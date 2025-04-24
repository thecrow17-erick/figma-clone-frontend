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
  isDrawingMode = 'edit_off'
  selectedTool: DrawingTool = "rectangle";

  @ViewChild('fabricCanvas') fabricCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private fabricService: FigmaEditorService) {}

  ngAfterViewInit(): void {
    // Elimina el setTimeout - no es necesario
    this.fabricService.initCanvas(this.fabricCanvasRef.nativeElement);
  }

  ngOnInit(): void {
    // Suscribirse a los cambios de herramienta
    this.fabricService.selectedTool$.subscribe(tool => {
      this.currentColor = this.fabricService.getCurrentColor();
    });
  }

  //#region COLOR
  public getColor(): string {
    return this.fabricService.getCurrentColor();
  }

  public onColorChange(e: Event): void {
    const input = e.target as HTMLInputElement; // Hacemos el cast correcto
    this.currentColor = input.value;
    this.fabricService.updateActiveObjectColor(this.currentColor); // Pasamos el color actualizado
  }

  public getColorStroke(): string {
    return this.fabricService.getColorStroke();
  }

  public onColorStrokeChange(e: Event): void {
    const input = e.target as HTMLInputElement; // Hacemos el cast correcto
    this.currentColor = input.value;
    this.fabricService.updateActiveObjectColorStroke(this.currentColor);
  }
  //#endregion COLOR

  //#region Tool
  public selectTool(tool: DrawingTool): void {
    this.fabricService.setTool(tool);
  }

  public getTool(): DrawingTool {
    return this.fabricService.getTool();
  }

  //#endregion Tool

  public onDeleteClick(): void {
    this.fabricService.deleteSelectedObject();
  }

  public onSelect(): void {
    this.fabricService.handleDeselection()
  }

  async handleFileChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      await this.fabricService.addImageToCanvas(file);
    }
  }

  getStroke(): number {
    return this.fabricService.getStroke();
  }

  setStroke(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.fabricService.setStroke(+input.value)
  }

  getFontSize(): number {
    return this.fabricService.getFontSize();
  }

  setFontSize(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.fabricService.setFontSize(+input.value);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  @HostListener('window:keydown', ['$event'])
  public prvihandleKeyDown(event: KeyboardEvent): void {
    this.fabricService.handleKeyDown(event);
  }


}
