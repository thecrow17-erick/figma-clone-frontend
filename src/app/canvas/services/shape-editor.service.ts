
import * as fabric from 'fabric';
import { ICreateObject, IOptionUpdRect, IPointer } from '../types';
import { Injectable } from '@angular/core';
import {v4 as uuid} from "uuid"


@Injectable({
  providedIn: 'root'
})
export class ShapeEditor {

  public createRectangule(options: ICreateObject): fabric.Rect {
    return new fabric.Rect({
      ...options,
      id: uuid()
    });
  }

  public createCircle(options: ICreateObject): fabric.Circle {
    return new fabric.Circle({
      ...options,
      radius: 100,
      strokeWidth: 1,
      selectable: true,
      originX: 'center',
      originY: 'center',
    })
  }

  public createLine(options: ICreateObject): fabric.Line{
    return new fabric.Line([options.left,options.height,options.left + 100, options.height + 100],{
      stroke: options.stroke,
      strokeWidth: options.strokeWidth,
      fill: options.fill,
      selectable: options.selectable,
      id: uuid()
    });
  }

  public createText(options: ICreateObject): fabric.Textbox {
    return new fabric.Textbox(options.text? options.text: "Igrese", {
      left: options.left,
      top: options.top,
      fontSize: options.width,
      fill: options.fill,
      stroke: options.stroke,
      strokeWidth: options.strokeWidth,
      selectable: options.selectable,
      id: uuid()
    })
  }



}
