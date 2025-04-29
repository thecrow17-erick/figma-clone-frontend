import { FigmaEditorService } from './../../services';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material';
import { CommonModule } from '@angular/common';
import { DrawingTool } from '../../types';
import { ActivatedRoute, Router } from '@angular/router';

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

  private fabricService = inject(FigmaEditorService);
  private router = inject(Router);
  private activatedRouter = inject(ActivatedRoute);



  ngAfterViewInit(): void {
    // Elimina el setTimeout - no es necesario

    if (this.fabricCanvasRef?.nativeElement) {
      const code = this.activatedRouter.snapshot.paramMap.get('code')!;
      this.fabricService.joinRoom(code)
      this.fabricService.initCanvas(this.fabricCanvasRef.nativeElement);
    };
  }

  ngOnInit(): void {
    // Suscribirse a los cambios de herramienta
    this.fabricService.selectedTool$.subscribe(_ => {
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

  //#region METHODS
  public onDeleteClick(): void {
    this.fabricService.deleteSelectedObject();
  }

  public onSelect(): void {
    this.fabricService.handleDeselection()
  }

  public async handleFileChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      await this.fabricService.addImageToCanvas(file);
    }
  }

  public getStroke(): number {
    return this.fabricService.getStroke();
  }

  public setStroke(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.fabricService.setStroke(+input.value)
  }

  public getFontSize(): number {
    return this.fabricService.getFontSize();
  }

  public setFontSize(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.fabricService.setFontSize(+input.value);
  }

  public triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  @HostListener('window:keydown', ['$event'])
  public prvihandleKeyDown(event: KeyboardEvent): void {
    this.fabricService.handleKeyDown(event);
  }

  public goToHome(): void {
    this.router.navigate(["home"])
  }
  //#endregion METHODS



}
