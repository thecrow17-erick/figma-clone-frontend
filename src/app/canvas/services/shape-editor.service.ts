
import * as fabric from 'fabric';
import { ICreateObject, IOptionUpdRect, IPointer } from '../types';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ShapeEditor {

  public createRectangule(options: ICreateObject): fabric.Rect {
    return new fabric.Rect({
      ...options
    });
  }

  public createCircle(options: ICreateObject): fabric.Circle {
    return new fabric.Circle({
      ...options,
      radius: 100,
      strokeWidth: 1,
      selectable: true,
      originX: 'center',
      originY: 'center'
    })
  }

  public createLine(options: ICreateObject): fabric.Line{
    return new fabric.Line([options.left,options.height,options.left, options.height],{
      stroke: options.stroke,
      strokeWidth: options.strokeWidth,
      fill: options.fill,
      selectable: options.selectable
    });
  }

  public createText(options: ICreateObject): fabric.Textbox {
    return new fabric.Textbox("Ingrese", {
      left: options.left,
      top: options.top,
      fontSize: options.width,
      fill: options.fill,
      stroke: options.stroke,
      strokeWidth: options.strokeWidth,
      selectable: options.selectable
    })
  }

}
