import { ExportService, FigmaEditorService } from './../../services';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material';
import { CommonModule } from '@angular/common';
import { DrawingTool } from '../../types';
import { ActivatedRoute, Router } from '@angular/router';
import {v4 as uuid} from 'uuid'

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
  @ViewChild('ImageExport') elementImage!: ElementRef<HTMLElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public isLoading = signal<boolean>(false);
  private fabricService = inject(FigmaEditorService);
  private router = inject(Router);
  private activatedRouter = inject(ActivatedRoute);
  private exportService = inject(ExportService);


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


  public async onClickPhoto(): Promise<void> {
    await this.exportService.captureComponent(this.elementImage.nativeElement, uuid());
  }

  public async downloadZip(): Promise<void> {
    const fileName = uuid();
    const base64 = await this.exportService.captureBase64(this.elementImage.nativeElement, fileName);
    const file = this.exportService.base64ToFile(base64,fileName,'image/png');
    this.isLoading.set(true);
    this.exportService.exportFromAngular(file).subscribe(
      {
        next: (value)=> {
          this.handleDownload(value);
          this.isLoading.set(false);
        },
        error: (err) => {
          alert(JSON.stringify(err));
          this.isLoading.set(false);
        }
      }
    )

  }

  private handleDownload(blob: Blob) {
    // Crear un enlace temporal
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    // Configurar el enlace
    a.href = url;
    a.download = 'template.zip'; // Nombre del archivo
    document.body.appendChild(a);

    // Disparar el click y limpiar
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
}
