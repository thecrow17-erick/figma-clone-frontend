import { FigmaEditorService } from './../../services/figma-editor.service';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material';
import { CommonModule } from '@angular/common';
import { DrawingTool } from '../../types';

@Component({
  selector: 'app-figma-editor',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule
  ],
  templateUrl: './figma-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FigmaEditorComponent implements  OnInit,AfterViewInit  {
  currentColor: string = '#3F51B5';
  currentColorStroke: string = '#3F51B5';
  isDrawingMode = 'edit'
  @ViewChild('fabricCanvas') fabricCanvasRef!: ElementRef<HTMLCanvasElement>;
  selectedTool: DrawingTool = "rectangle";

  constructor(private fabricService: FigmaEditorService) {}

  ngAfterViewInit(): void {
    // Elimina el setTimeout - no es necesario
    this.fabricService.initCanvas(this.fabricCanvasRef.nativeElement);

    // Verificación adicional
    setTimeout(() => {
      console.log('Canvas después de init:', this.fabricService.getCanvas());
    }, 1000);
  }

  ngOnInit(): void {
    // Suscribirse a los cambios de herramienta
    this.fabricService.selectedTool$.subscribe(tool => {
      this.selectedTool = tool;
      this.currentColor = this.fabricService.getCurrentColor();
    });
  }


  onColorChange(e: Event): void {
    const input = e.target as HTMLInputElement; // Hacemos el cast correcto
    this.currentColor = input.value;
    this.fabricService.updateActiveObjectColor(this.currentColor); // Pasamos el color actualizado
  }

  onColorStrokeChange(e: Event): void {
    const input = e.target as HTMLInputElement; // Hacemos el cast correcto
    this.currentColor = input.value;
    this.fabricService.updateActiveObjectColorStroke(this.currentColor);
  }

  onDeleteClick(): void {
    this.fabricService.deleteSelectedObject();
  }

  onSelect(): void {
    this.fabricService.handleDeselection()
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    this.fabricService.handleKeyDown(event);
  }

  selectTool(tool: DrawingTool): void {
    console.log(tool);
    this.fabricService.setTool(tool);
  }

}
