import {  Injectable, signal } from '@angular/core';
import * as fabric from 'fabric';
import { BehaviorSubject } from 'rxjs';
import { DrawingTool, IPointer, IViewPortTransform } from '../types';
import { ShapeEditor } from './shape-editor.service';


@Injectable({
  providedIn: 'root'
})
export class FigmaEditorService {


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
  }

  initCanvas(canvasEl: HTMLCanvasElement): void {
    this.canvas = new fabric.Canvas(canvasEl, {
      width: 1550,
      height: 900,
      backgroundColor: '#dadada',
    });
    this.setupEventListeners();
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
    // this.canvas.on('object:moving', (e) => {  //evento de que se mueve el objeto
    //   const movingObject = e.target;
    //   console.log({
    //     left: movingObject.left,       // Posición X
    //     top: movingObject.top,         // Posición Y
    //     width: movingObject.width,     // Ancho
    //     height: movingObject.height,   // Alto
    //     angle: movingObject.angle,    // Rotación
    //     fill: movingObject.fill,       // Color de relleno
    //     stroke: movingObject.stroke,   // Color del borde
    //     scaleX: movingObject.scaleX,  // Escala horizontal
    //     scaleY: movingObject.scaleY   // Escala vertical
    //   });
    // });
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
  }

  private handleMouseUp(): void {
    if(this.activeObject){
      this.activeObject.set('fill', this.getCurrentColor());
      this.activeObject.set('stroke', this.currentColorStroke)
      this.canvas.requestRenderAll();
    }
    this.isDrawing.set(false);
    this.activeObject = null;
    if (this.selectedToolSubject.value === 'moved') {
      this.handleMovedUp();
    }
    console.log(this.canvas._setObject);
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
  }

  handleMovedMove(point: IPointer): void {
    if (!this.isPanning() || !this.canvas) return;

    const deltaX = point.x - this.startX;
    const deltaY = point.y - this.startY;

    // Mueve el viewport
    this.canvas.relativePan(new fabric.Point(deltaX, deltaY));

    this.startX = point.x;
    this.startY = point.y ;
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

      this.canvas.add(rect);
      this.activeObject = rect;
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

    this.canvas.add(circle);
    this.activeObject = circle;
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

    this.canvas.add(line);
    this.activeObject = line;

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
    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);

    // Configuración del pincel
    this.canvas.freeDrawingBrush.width = this.getStroke();
    this.canvas.freeDrawingBrush.color = this.getCurrentColor();

    if(this.canvas.upperCanvasEl){
      this.canvas.upperCanvasEl.style.cursor = `url(public/pencil.png), auto`;
    }
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
      });
      this.canvas.add(fabricImg);
      this.canvas.renderAll();
    };

  }
  //#endregion IMAGE


}
