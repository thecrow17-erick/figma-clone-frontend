
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
    return new fabric.Line([options.left,options.height,options.left+100, options.height+100],{
      stroke: options.stroke,
      strokeWidth: options.strokeWidth,
      fill: options.fill
    });
  }


}
