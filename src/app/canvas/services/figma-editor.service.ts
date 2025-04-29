import {  inject, Injectable, signal } from '@angular/core';
import * as fabric from 'fabric';
import { BehaviorSubject } from 'rxjs';
import { DrawingTool, IPointer, IViewPortTransform } from '../types';
import { CanvasSocketService, ShapeEditor } from './';
import {v4 as uuid} from "uuid"


@Injectable({
  providedIn: 'root'
})
export class FigmaEditorService {

  //#region SOCKETS
  private socketService = inject(CanvasSocketService);
  //#endregion SOCKETS

  //#region ATRIBUTOS
  private canvas!: fabric.Canvas;
  private activeObject: fabric.FabricObject | null = null;
  private selectObject: fabric.FabricObject[] = [];

  private currentColorStroke: string = '#3F51B5';
  private isDrawing = signal<boolean>(false);
  private isPanning = signal<boolean>(false);
  private startX = 0;
  private startY = 0;
  //#endregion ATRIBUTOS

  //#region BEHOVIER
  private colorSubject = new BehaviorSubject<string>("#3F51B5");
  public color$ = this.colorSubject.asObservable();

  private colorStrokeSubject = new BehaviorSubject<string>("#3F51B5");
  public colorStroke$ = this.colorStrokeSubject.asObservable();

  private selectedToolSubject = new BehaviorSubject<DrawingTool>("select");
  public selectedTool$ = this.selectedToolSubject.asObservable();

  private strokeSubject = new BehaviorSubject<number>(1);
  public stroke$ = this.strokeSubject.asObservable();

  private fontSizeSubject = new BehaviorSubject<number>(24);
  public fontSize$ = this.fontSizeSubject.asObservable();

  //#endregion BEHOVIER

  //#region EVENTOS SOCKETS
  // Método para unirse a una sala
  public joinRoom(roomCode: string): void {
    this.socketService.joinRoom(roomCode);

    // Escuchar el estado inicial del canvas
    this.socketService.onCanvasState((data) => {
      if (data) {
        this.loadCanvasFromJSON(data);
      }
    });
  }
  private loadCanvasFromJSON(json: any): void {
    if (!this.canvas) return;
    this.canvas.loadFromJSON(json, () => {
      this.canvas.renderAll();
    });
  }

  private sendCanvasUpdate(): void {
    if (!this.canvas) return;
    const json = this.canvas.toJSON();
    this.socketService.sendCanvasUpdate(json);
  }
  private handleUpdateCanvas(data: string): void {
    if (!this.canvas || !data) return;

  try {
    // Parse the JSON data received from the server
    const serverObjects = JSON.parse(data) as {version: string, objects: any[]};
    if (!serverObjects.objects || !Array.isArray(serverObjects.objects)) return;
    // Get current canvas objects
    const canvasObjects = this.canvas.getObjects();
    const serverObjectsIds = serverObjects.objects.map((obj: any) => obj.id || '');

    // CASE 1: Remove objects that exist in canvas but not in server
    const objectsToRemove = canvasObjects.filter(obj =>
      obj.id && !serverObjectsIds.includes(obj.id)
    );
    objectsToRemove.forEach(obj => this.canvas.remove(obj));

    // CASE 2: Add or update objects from server
    serverObjects.objects.forEach((serverObj: any) => {
      if (!serverObj.id) return; // Skip objects without ID

      // Check if object exists in canvas
      const existingObj = canvasObjects.find(obj => obj.id === serverObj.id);
      if (existingObj) {
        // CASE 2a: Update existing object if properties differ
        // Compare essential properties to see if an update is needed
        const needUpd = this.objectNeedsUpdate(existingObj, serverObj);
        if (needUpd) {
          // Update object properties
          this.updateObjectProperties(existingObj, serverObj);
        }
      } else {
        // CASE 2b: Add new object from server
        console.log("crea linea");
        this.addObjectFromServer(serverObj);
      }
    });

    // Render all changes
    this.canvas.renderAll();
  } catch (error) {
    console.error('Error updating canvas from server data:', error);
  }
}

// Helper method to determine if an object needs to be updated
private objectNeedsUpdate(existingObj: fabric.FabricObject, serverObj: any): boolean {
  // Compare essential properties
  const propsToCompare = ['left', 'top', 'width', 'height', 'scaleX', 'scaleY', 'angle', 'fill', 'stroke'];

  for (const prop of propsToCompare) {
    if (existingObj[prop as keyof fabric.FabricObject] !== serverObj[prop]) {
      return true;
    }
  }

  // For type-specific properties (e.g., radius for circles, text for textboxes)
  if (existingObj.type === 'circle') {
    // Casting al tipo correcto antes de acceder a radius
    const circleObj = existingObj as fabric.Circle;
    if (circleObj.radius !== serverObj.radius) {
      return true;
    }
  }

  if(existingObj.type === 'line'){
    const lineObj = existingObj as fabric.Line;
    if(
      lineObj.x1 !== serverObj.x1 ||
      lineObj.x2 !== serverObj.x2 ||
      lineObj.y1 !== serverObj.y1 ||
      lineObj.y2 !== serverObj.y2
    ) return true;
  }


  if (existingObj.type === 'textbox' && (existingObj as fabric.Textbox).text !== serverObj.text) {
    return true;
  }

  return false;
}

// Helper method to update object properties
private updateObjectProperties(existingObj: fabric.FabricObject, serverObj: any): void {
  // Update basic properties
  existingObj.set({
    left: serverObj.left,
    top: serverObj.top,
    scaleX: serverObj.scaleX,
    scaleY: serverObj.scaleY,
    angle: serverObj.angle,
    fill: serverObj.fill,
    stroke: serverObj.stroke,
    strokeWidth: serverObj.strokeWidth
  });
  // Update type-specific properties
  if (existingObj.type === 'rect' && serverObj.type === 'Rect') {
    (existingObj as fabric.Rect).set({
      width: serverObj.width,
      height: serverObj.height
    });
  } else if (existingObj.type === 'circle' && serverObj.type === 'Circle') {
    (existingObj as fabric.Circle).set({
      radius: serverObj.radius
    });
  } else if (existingObj.type === 'line' && serverObj.type === 'Line') {
    const adjustedPos = this.getAdjustedPosition({x: serverObj.x2,y: serverObj.y2});
    (existingObj as fabric.Line).set({
      x1: serverObj.x1,
      y1: serverObj.y1,
      x2: adjustedPos.x,
      y2: adjustedPos.y
    });
  } else if (existingObj.type === 'textbox' && serverObj.type === 'Textbox') {
    (existingObj as fabric.Textbox).set({
      text: serverObj.text,
      fontSize: serverObj.fontSize
    });
  } else if (existingObj.type === 'path' && serverObj.type === 'Path') {
    (existingObj as fabric.Path).set({
      path: serverObj.path
    });
  } else if (existingObj.type === 'image' && serverObj.type === 'image') {
    // For images we might need special handling
    (existingObj as fabric.FabricImage).setSrc(serverObj.src, {});
    this.canvas.renderAll();
  }
}

// Helper method to add a new object from server data
private addObjectFromServer(serverObj: any): void {
  // Based on the object type, create the appropriate Fabric.js object
  switch (serverObj.type) {
    case 'Rect':
      const rect = new fabric.Rect({
        left: serverObj.left,
        top: serverObj.top,
        width: serverObj.width,
        height: serverObj.height,
        fill: serverObj.fill,
        stroke: serverObj.stroke,
        strokeWidth: serverObj.strokeWidth,
        selectable: true,
        angle: serverObj.angle,
        scaleX: serverObj.scaleX,
        scaleY: serverObj.scaleY
      });
      rect.id = serverObj.id; // Assign the same ID
      this.canvas.add(rect);
      break;

    case 'Circle':
      const circle = new fabric.Circle({
        left: serverObj.left,
        top: serverObj.top,
        radius: serverObj.radius,
        fill: serverObj.fill,
        stroke: serverObj.stroke,
        strokeWidth: serverObj.strokeWidth,
        selectable: true,
        originX: 'center',
        originY: 'center',
        angle: serverObj.angle,
        scaleX: serverObj.scaleX,
        scaleY: serverObj.scaleY
      });
      circle.id = serverObj.id;
      this.canvas.add(circle);
      break;

    case 'Line':
      const adjustedPos = this.getAdjustedPosition({x: serverObj.x2,y: serverObj.y2});
      const line = new fabric.Line([serverObj.x1,serverObj.y1,serverObj.x1 + 100,serverObj.x1 + 100],{
        left: serverObj.left,
        top: serverObj.top,
        stroke: serverObj.stroke,
        strokeWidth: serverObj.strokeWidth,
        fill: serverObj.fill,
        selectable: true,
      });
      line.id = serverObj.id;
      this.canvas.add(line);
      break;

    case 'Textbox':
      const text = new fabric.Textbox(serverObj.text,{
        left: serverObj.left,
        top: serverObj.top,
        fontSize: serverObj.fontSize,
        fill: serverObj.fill,
        stroke: serverObj.stroke,
        strokeWidth: serverObj.strokeWidth,
        selectable: true,
        angle: serverObj.angle,
        scaleX: serverObj.scaleX,
        scaleY: serverObj.scaleY
      });
      text.id = serverObj.id;
      this.canvas.add(text);
      break;

    case 'Path':
      const path = new fabric.Path(serverObj.path, {
        left: serverObj.left,
        top: serverObj.top,
        fill: serverObj.fill,
        stroke: serverObj.stroke,
        strokeWidth: serverObj.strokeWidth,
        selectable: true,
        angle: serverObj.angle,
        scaleX: serverObj.scaleX,
        scaleY: serverObj.scaleY,
        id: serverObj.id
      });
      this.canvas.add(path);
      break;

    case 'image':
      // For images, we need to create an image element and then a Fabric image
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.src = serverObj.src;

      img.onload = () => {
        const fabricImg = new fabric.FabricImage(img, {
          left: serverObj.left,
          top: serverObj.top,
          scaleX: serverObj.scaleX,
          scaleY: serverObj.scaleY,
          angle: serverObj.angle,
          selectable: true
        });
        fabricImg.id = serverObj.id;
        this.canvas.add(fabricImg);
        this.canvas.renderAll();
      };
      break;
    }
  }

  //#endregion EVENTOS SOCKETS

  //#region INIT
  constructor(
    private readonly shapes : ShapeEditor
  ) {
    // Bind explícito de los métodos
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleSelection = this.handleSelection.bind(this);
    this.handleDeselection = this.handleDeselection.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleSmoothZoom = this.handleSmoothZoom.bind(this);
    this.handleMoving = this.handleMoving.bind(this);
    this.handleTextChanged = this.handleTextChanged.bind(this);
  }

  initCanvas(canvasEl: HTMLCanvasElement): void {
    this.canvas = new fabric.Canvas(canvasEl, {
      width: 1550,
      height: 900,
    });
    this.setupEventListeners()
    this.socketService.onCanvasUpdate((data) => {
      this.handleUpdateCanvas(data);
    });
  }



  public getCanvas(): fabric.Canvas {
    return this.canvas;
  }
  //#endregion INIT

  //#region EVENTS
  private setupEventListeners(): void {
    this.canvas.on('selection:created', (e) => this.handleSelection(e.selected));
    this.canvas.on('selection:updated', (e) => this.handleSelection(e.selected));
    this.canvas.on('selection:cleared', () => this.handleDeselection());
    this.canvas.on('mouse:move',(option)=> this.handleMouseMove(option));
    this.canvas.on('mouse:down',(option) => this.handleMouseDown(option));
    this.canvas.on("mouse:up", () => this.handleMouseUp());
    this.canvas.on("mouse:wheel", (option) => this.handleSmoothZoom(option));
    this.canvas.on('object:moving', (_) =>this.handleMoving());
    // this.canvas.on("text:editing:entered", (e)=> console.log(e))
    this.canvas.on("text:changed", (opt) => this.handleTextChanged(opt.target))
  }

  private handleTextChanged(target: fabric.IText): void {
    const getObjects = this.canvas.getObjects();

    const textBox = getObjects.find(obj => obj.id === target.id) as fabric.Textbox;

    if(textBox){
      textBox.set({
        text: target.text
      });
      this.canvas.renderAll();
    }
    this.sendCanvasUpdate();
  }

  private handleMoving(): void {
    this.sendCanvasUpdate();
  }
  private handleMouseDown(option: fabric.TPointerEventInfo<fabric.TPointerEvent>): void {
    if(!this.canvas) return;
    const pointer = this.canvas.getViewportPoint(option.e);
    this.startX = pointer.x;
    this.startY = pointer.y;
    this.isDrawing.set(true);

    switch(this.selectedToolSubject.value) {
      case "rectangle":
        this.createRectanguleStart(pointer);
        break;
      case "circle":
        this.createCircleStart(pointer);
        break;
      case "line":
        this.createLineStart(pointer);
        break;
      case "text":
        this.createTextStart(pointer);
        break;
      case "draw":
        this.setupFreeDrawing();
        break;
      case "moved":
        this.handleMovedDown();
        break;
    }
    this.sendCanvasUpdate();
  }

  private handleMouseUp(): void {
    // if(this.isDrawing() && this.activeObject){
    //   this.canvas.add(this.activeObject);
    // }
    if(this.selectObject.length){
      this.selectObject.map (obj => {
        if(obj.type === "Rect" || obj.type === "Circle" || obj.type === "Line")
          obj.set('fill', this.getCurrentColor());
          obj.set('stroke', this.currentColorStroke)
      })
      this.canvas.requestRenderAll();
    }

    this.isDrawing.set(false);
    this.activeObject = null;
    if (this.selectedToolSubject.value === 'moved') {
      this.handleMovedUp();
    }
    this.sendCanvasUpdate();
  }

  private handleMouseMove(option: fabric.TPointerEventInfo<fabric.TPointerEvent>): void {
    if(!this.canvas ) return;
    const pointer = this.canvas.getViewportPoint(option.e);
    if(this.activeObject || !this.isDrawing()){
      switch (this.selectedToolSubject.value){
        case "rectangle":
          this.updateRectangle(pointer);
          break;
        case "circle":
          this.updateCircle(pointer);
          break;
        case "line":
          this.updateLine(pointer);
          break;
      }
    }
    if(this.isPanning()){
      if(this.selectedToolSubject.value === "moved"){
        this.handleMovedMove(pointer);
      }
    }
  }

  private handleSelection(e:  fabric.FabricObject[]): void {
    this.selectObject = e;

  }

  public handleDeselection(): void {
    this.selectObject = [];
  }


  deleteSelectedObject(): void {
    const activeObject = this.canvas.getActiveObjects();
    if (activeObject) {
      activeObject.map ( m => this.canvas.remove(m))
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
      this.sendCanvasUpdate();
    }
  }

  public handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Delete') {
      this.deleteSelectedObject();
    }
  }

  handleMovedDown(): void {
    this.isPanning.set(true);
    this.canvas.defaultCursor = 'grabbing';
    this.sendCanvasUpdate();
  }

  handleMovedMove(point: IPointer): void {
    if (!this.isPanning() || !this.canvas) return;

    const deltaX = point.x - this.startX;
    const deltaY = point.y - this.startY;

    // Mueve el viewport
    this.canvas.relativePan(new fabric.Point(deltaX, deltaY));

    this.startX = point.x;
    this.startY = point.y;

  }

  handleMovedUp(): void {
    this.isPanning.set(false);
    this.canvas.defaultCursor = 'grab'; // Restaura cursor

  }

  handleSmoothZoom(opt: fabric.TPointerEventInfo<WheelEvent>): void {
    const delta = opt.e.deltaY;
    let zoom = this.canvas.getZoom();

    const zoomFactor = 0.05;

    if (delta > 0) {
      zoom *= 1 - zoomFactor;
    }
    else {
      zoom *= 1 + zoomFactor;
    }

    const pointer = this.canvas.getViewportPoint(opt.e);

    this.canvas.zoomToPoint(
      new fabric.Point(pointer.x, pointer.y),
      zoom
    );

    opt.e.preventDefault();
    opt.e.stopPropagation();
  }

  private getViewportTransform(): IViewPortTransform {
    if (!this.canvas?.viewportTransform) return { offsetX: 0, offsetY: 0, zoom: 1 };

    return {
      offsetX: this.canvas.viewportTransform[4],
      offsetY: this.canvas.viewportTransform[5],
      zoom: this.canvas.getZoom()
    };
  }

  private getAdjustedPosition(point: IPointer): IPointer {
    const transform = this.getViewportTransform();
    return {
      x: (point.x - transform.offsetX) / transform.zoom,
      y: (point.y - transform.offsetY) / transform.zoom
    };
  }


  //#endregion EVENTS

  //#region COLORS
  public updateActiveObjectColor(newColor: string): void {
    this.colorSubject.next(newColor);
    if(this.selectObject.length){
      this.selectObject.forEach(obj => {
        obj.set('fill', newColor);
      });
      this.canvas.requestRenderAll();
    }
  }

  public getCurrentColor(): string {
    return this.colorSubject.value;
  }

  public updateActiveObjectColorStroke(newColor: string): void {
    this.colorStrokeSubject.next(newColor);
    if(this.selectObject.length){
      this.selectObject.forEach(obj => {
        obj.set('stroke', newColor);
      });
      this.canvas.requestRenderAll();
    }
  }

  public getColorStroke(): string {
    return this.colorStrokeSubject.value;
  }

  //#endregion COLORS

  //#region SELECTEDTOOL
  public setTool(tool: DrawingTool): void {
    // Desactivar el modo de dibujo del canvas si no estamos en modo selección
    if (this.canvas) {
      if (tool === 'select') {
        this.canvas.isDrawingMode = false;
        this.canvas.defaultCursor = 'default';
        this.canvas.selection = true;
        this.canvas.forEachObject(obj => {
          obj.selectable = true;
        });
      } else {
        this.canvas.isDrawingMode = false;
        this.canvas.defaultCursor = 'default';
        this.canvas.selection = false;
        this.canvas.forEachObject(obj => {
          obj.selectable = false;
        });
      }

      if (tool === "moved") {
        this.canvas.defaultCursor = 'grab'; // Cambia el cursor
        this.canvas.selection = false;
      }
    }

    this.selectedToolSubject.next(tool);
  }

  public getTool(): DrawingTool {
    return this.selectedToolSubject.getValue();
  }

  //#endregion SELECTEDTOOL

  //#region STROKE
  public getStroke(): number {
    return this.strokeSubject.value;
  }

  public setStroke(stroke: number): void {
    this.strokeSubject.next(stroke);
    if(this.selectObject.length){
      this.selectObject.forEach(obj => {
        obj.set('strokeWidth', stroke);
      });
      this.canvas.requestRenderAll();
    }
  }

  //#endregion STROKE

  //#region FONTSIZE
  public getFontSize(): number {
    return this.fontSizeSubject.value;
  }

  public setFontSize(fontSize: number): void {
    this.fontSizeSubject.next(fontSize);
    if(this.selectObject.length){
      this.selectObject.forEach(obj => {
        if(obj.type === "Textbox"){
          console.log("es textbox");
          obj.set("fontSize", fontSize)
        }
      });
      this.canvas.requestRenderAll();
    }
  }
  //#endregion FONTSIZE

  //#region METHODS RECT
  public createRectanguleStart(point: IPointer): void {
      if(!this.canvas ) return;
      const adjustedPos = this.getAdjustedPosition(point);

      const rect = this.shapes.createRectangule({
        left: adjustedPos.x,
        top: adjustedPos.y,
        width: 1,
        height: 1,
        fill: this.getCurrentColor(),
        stroke: this.currentColorStroke,
        strokeWidth: this.getStroke(),
        selectable: true,
      });

      this.activeObject = rect;
      this.canvas.add( rect);
    }

    public updateRectangle(point: IPointer): void {
      if (!this.canvas || !this.activeObject) return;

      const rect = this.activeObject as fabric.Rect;
      const adjustedPos = this.getAdjustedPosition(point);
      // Calcular las nuevas dimensiones
      let width = Math.abs(adjustedPos.x - this.startX!);
      let height = Math.abs(adjustedPos.y - this.startY!);

      // Establecer la posición correcta del rectángulo basado en la dirección del arrastre
      if (adjustedPos.x < this.startX) {
        rect.set({ left: adjustedPos.x });
      }
      if (adjustedPos.y < this.startY) {
        rect.set({ top: adjustedPos.y });
      }
      // Actualizar dimensiones
      rect.set({ width, height });

      // Actualizar el canvas
      this.canvas.renderAll();
      this.sendCanvasUpdate();
    }

  //#endregion

  //#region METHODS CIRCLE
  private createCircleStart(pointer: IPointer) {
    if(!this.canvas) return;
    const adjustedPos = this.getAdjustedPosition(pointer);
    const circle = new fabric.Circle({
      left: adjustedPos.x,
      top: adjustedPos.y,
      radius: 1, // Radio inicial pequeño
      fill: this.getCurrentColor(),
      stroke: this.currentColorStroke,
      strokeWidth: this.getStroke(),
      selectable: true,
      originX: 'center',
      originY: 'center'
    });
    circle.id = uuid();
    this.activeObject = circle;
    this.canvas.add(circle);
    return circle;
  }

  private updateCircle(point: IPointer) {
    if(!this.canvas || !this.activeObject) return;
    const adjustedPos = this.getAdjustedPosition(point);

    const circle = this.activeObject as fabric.Circle;

    // Calcular distancia desde el punto inicial (radio)
    const radius = Math.sqrt(
        Math.pow(adjustedPos.x - this.startX, 2) +
        Math.pow(adjustedPos.y - this.startY, 2)
    );

    // Calcular posición del centro
    const centerX = this.startX;
    const centerY = this.startY;

    // Actualizar propiedades del círculo
    circle.set({
        radius: radius,
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center'
    });

    // Forzar actualización del canvas
    this.canvas.renderAll();
    this.sendCanvasUpdate();
  }
  //#endregion METHODS CIRCLE

  //#region METHODS LINE
  createLineStart(point: IPointer) {
    if(!this.canvas) return;
    const adjustedPos = this.getAdjustedPosition(point);
    const line = this.shapes.createLine({
      stroke: this.getColorStroke(),
      strokeWidth: 3,
      fill: this.getCurrentColor(),
      left: adjustedPos.x,
      top: adjustedPos.y,
      height: 1,
      width: 1,
      selectable: true,
    });

    this.activeObject = line;
    this.canvas.add(line);
  }

  updateLine(pointer: IPointer) {
    if(!this.canvas || !this.activeObject) return;
    const adjustedPos = this.getAdjustedPosition(pointer);
    const line = this.activeObject as fabric.Line;
    line.set("x1", this.startX);
    line.set("y1", this.startY);

    line.set("x2", adjustedPos.x);
    line.set("y2", adjustedPos.y);

    this.canvas.renderAll();
    this.sendCanvasUpdate();
  }
  //#endregion METHODS LINE

  //#region METHODS TEXT
  public createTextStart(point: IPointer): void {
    if(!this.canvas ) return;
    const adjustedPos = this.getAdjustedPosition(point);
    const text = this.shapes.createText({
      left: adjustedPos.x,
      top: adjustedPos.y,
      width: this.getFontSize(),
      fill: this.getCurrentColor(),
      stroke: this.getColorStroke(),
      strokeWidth: this.getStroke(),
      height: 0,
      selectable: true
    });
    this.canvas.add(text);
  }

  //#endregion METHODS TEXT

  //#region METODS DRAW
  private setupFreeDrawing(): void {
    if (!this.canvas) return;

    this.canvas.isDrawingMode = true;
    // const pencilBrush = new fabric.PencilBrush(this.canvas);
    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    // Configuración del pincel
    this.canvas.freeDrawingBrush.width = this.getStroke();

    this.canvas.freeDrawingBrush.color = this.getCurrentColor();

    this.canvas.on('path:created', (event) => {
      const path = event.path;
      path.set({ id: uuid() }); // Asigna un UUID único al path dibujado
       // Para debug
    });
  }
  //#endregion METODS DRAW

  //#region IMAGE
  async addImageToCanvas(imageFile: File): Promise<void> {
    if (!this.canvas) return;
    const url = URL.createObjectURL(imageFile);

    const imageElement = document.createElement("img");
    imageElement.src = url;
    imageElement.crossOrigin = "anonymous";
    imageElement.onload = () => {
      const imageWidth = imageElement.naturalWidth;
      const imageHeight = imageElement.naturalHeight;
      imageElement.width = imageWidth / 2;
      imageElement.height = imageHeight / 2;
      // Get canvas dimensions
      const canvasWidth = this.canvas.width;
      const canvasHeight = this.canvas.height;
      const scale = Math.min(
          canvasWidth / imageWidth,
          canvasHeight / imageHeight
      );
      this.canvas.renderAll();
      const fabricImg = new fabric.FabricImage(imageElement, {
          left: 0,
          top: 0,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          hoverCursor: "default",
          id: uuid(),
      });
      this.canvas.add(fabricImg);
      console.log(fabricImg);
      this.canvas.renderAll();
    };

  }
  //#endregion IMAGE


}
