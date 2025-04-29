
import * as fabric from 'fabric';

export type DrawingTool = 'select' | 'rectangle' | 'circle' | 'line' | 'text' | 'draw' | 'moved';



export interface ICreateObject {
  left: number;
  top: number;
  width: number;
  height: number;
  fill: string,
  stroke: string,
  strokeWidth: number,
  selectable: boolean,
  text?: string
}

export interface IPointer {
  x: number;
  y: number;
}

export interface IViewPortTransform{
  offsetX: number;
  offsetY: number;
  zoom: number;
}


export interface IOptionUpdRect {
  activeObject?: fabric.FabricObject | null;
  canvas?: fabric.Canvas;
  startX?: number;
  startY?: number;
  color?: string;
  stroke_color?: string;
}
