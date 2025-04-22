import {  Injectable, signal } from '@angular/core';
import * as fabric from 'fabric';
import { BehaviorSubject } from 'rxjs';
import { DrawingTool, IPointer } from '../types';
import { ShapeEditor } from './shape-editor.service';


@Injectable({
  providedIn: 'root'
})
export class FigmaEditorService {

  private canvas!: fabric.Canvas;
  private activeObject: fabric.FabricObject | null = null;
  private selectObject: fabric.FabricObject[] = [];

  private currentColor: string = '#3F51B5';
  private currentColorStroke: string = '#3F51B5';
  private isDrawing = signal<boolean>(false);
  private startX = 0;
  private startY = 0;


  private selectedToolSubject = new BehaviorSubject<DrawingTool>("select");
  public selectedTool$ = this.selectedToolSubject.asObservable();

  constructor(
    private readonly shapes : ShapeEditor
  ) {
    // Bind explícito de los métodos
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleSelection = this.handleSelection.bind(this);
    this.handleDeselection = this.handleDeselection.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this)
  }

  initCanvas(canvasEl: HTMLCanvasElement): void {
    this.canvas = new fabric.Canvas(canvasEl, {
      width: 1550,
      height: 900,
      backgroundColor: '#dadada',
      preserveObjectStacking: true,
    });

    this.setupEventListeners();
  }
  //#region EVENTS
  private setupEventListeners(): void {
    this.canvas.on('selection:created', (e) => this.handleSelection(e.selected));
    this.canvas.on('selection:updated', (e) => this.handleSelection(e.selected));
    this.canvas.on('selection:cleared', () => this.handleDeselection());
    this.canvas.on('mouse:move',(option)=> this.handleMouseMove(option));
    this.canvas.on('mouse:down',(option) => this.handleMouseDown(option));
    this.canvas.on("mouse:up", () => this.handleMouseUp());
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
    }
  }

  private handleMouseUp(): void {
    if(this.activeObject){
      this.activeObject.set('fill', this.currentColor);
      this.activeObject.set('stroke', this.currentColorStroke)
      this.canvas.requestRenderAll();
    }
    this.isDrawing.set(false);
    this.activeObject = null;
  }

  private handleMouseMove(option: fabric.TPointerEventInfo<fabric.TPointerEvent>): void {
    if(!this.canvas || !this.isDrawing()) return;
    const pointer = this.canvas.getViewportPoint(option.e);
    // console.log("type obj: ", this.selectedToolSubject.value);
    if(this.activeObject){
      switch (this.selectedToolSubject.value){
        case "rectangle":
          this.updateRectangle(pointer);
          break;
        case "circle":
          this.updateCircle(pointer);
          break;
      }
    }
  }

  private handleSelection(e:  fabric.FabricObject[]): void {
    console.log(e);
    this.selectObject = e;
    console.log(this.canvas.getObjects());
  }

  public handleDeselection(): void {
    this.activeObject = null;
  }


  deleteSelectedObject(): void {
    const activeObject = this.canvas.getActiveObjects();
    if (activeObject) {
      activeObject.map ( m => this.canvas.remove(m))
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Delete') {
      this.deleteSelectedObject();
    }
  }

  //#endregion EVENTS

  public updateActiveObjectColor(newColor: string): void {
    this.currentColor = newColor;
    if(this.selectObject.length){
      this.selectObject.forEach(obj => {
        obj.set('fill', newColor);
      });
      this.canvas.requestRenderAll();
    }
  }

  public updateActiveObjectColorStroke(newColor: string): void {
    this.currentColorStroke = newColor;
    if(this.selectObject.length){
      this.selectObject.forEach(obj => {
        obj.set('stroke', newColor);
      });
      this.canvas.requestRenderAll();
    }
  }

  getCurrentColor(): string {
    return this.currentColor;
  }

  getCanvas(): fabric.Canvas {
    return this.canvas;
  }

  public setTool(tool: DrawingTool): void {
    // Desactivar el modo de dibujo del canvas si no estamos en modo selección
    if (this.canvas) {
      if (tool === 'select') {
        this.canvas.isDrawingMode = false;
        this.canvas.selection = true;
        this.canvas.forEachObject(obj => {
          obj.selectable = true;
        });
      } else {
        this.canvas.isDrawingMode = false;
        this.canvas.selection = false;
        this.canvas.forEachObject(obj => {
          obj.selectable = false;
        });
      }
    }

    this.selectedToolSubject.next(tool);
  }

  //#region METHODS RECT
  public createRectanguleStart(point: IPointer): void {
      if(!this.canvas ) return;

      const rect = this.shapes.createRectangule({
        left: point.x,
        top: point.y,
        width: 1,
        height: 1,
        fill: this.getCurrentColor(),
        stroke: this.currentColorStroke,
        strokeWidth: 5,
        selectable: false,
      });

      this.canvas.add(rect);
      this.activeObject = rect;
    }

    public updateRectangle(point: IPointer): void {
      if (!this.canvas || !this.activeObject) return;

      const rect = this.activeObject as fabric.Rect;

      // Calcular las nuevas dimensiones
      let width = Math.abs(point.x - this.startX!);
      let height = Math.abs(point.y - this.startY!);

      // Establecer la posición correcta del rectángulo basado en la dirección del arrastre
      if (point.x < this.startX) {
        rect.set({ left: point.x });
      }
      if (point.y < this.startY) {
        rect.set({ top: point.y });
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

    const circle = new fabric.Circle({
      left: pointer.x,
      top: pointer.y,
      radius: 1, // Radio inicial pequeño
      fill: this.currentColor,
      stroke: this.currentColorStroke,
      strokeWidth: 1,
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


    const circle = this.activeObject as fabric.Circle;

    // Calcular distancia desde el punto inicial (radio)
    const radius = Math.sqrt(
        Math.pow(point.x - this.startX, 2) +
        Math.pow(point.y - this.startY, 2)
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
  createLineStart(pointer: IPointer) {
    if(!this.canvas) return;

  }

  updateLine(pointer: IPointer, options: {
    startX: number;
    startY: number;
    canvas: fabric.Canvas;
    activeObject: fabric.Line;
  }) {
    options.activeObject.set({
      x2: pointer.x,
      y2: pointer.y
    });

    options.canvas.requestRenderAll();
  }
  //#endregion METHODS LINE

}
