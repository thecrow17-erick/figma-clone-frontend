import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private exportUrl = `${environment.apiUrl}/export/angular`
  private http = inject(HttpClient);

  public exportFromAngular(file: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('photo', file);

    return this.http.post<Blob>(this.exportUrl,formData,{
      responseType: "blob" as "json",
    })
  }

  base64ToFile(base64Data: string, filename: string, mimeType: string): File {
    // Extraer la parte pura del Base64 (remover metadata si existe)
    const base64WithoutPrefix = base64Data.split(',')[1] || base64Data;

    // Convertir a byte string
    const byteString = atob(base64WithoutPrefix);

    // Crear ArrayBuffer y Uint8Array
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    // Llenar el buffer
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    // Crear Blob y luego File
    const blob = new Blob([arrayBuffer], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
  }

  async captureBase64(element: HTMLElement,fileName: string = 'component.png'): Promise<string> {
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Mejor calidad
        logging: false,
        useCORS: true, // Para imágenes externas
        allowTaint: true
      });
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      return link.href;
    } catch (error) {
      console.error('Error capturando componente:', error);
      throw error;
    }
  }

  async captureComponent(element: HTMLElement, fileName: string = 'component.png'): Promise<void> {
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Mejor calidad
        logging: false,
        useCORS: true, // Para imágenes externas
        allowTaint: true
      });
      this.downloadImage(canvas, fileName);
    } catch (error) {
      console.error('Error capturando componente:', error);
      throw error;
    }
  }

  private downloadImage(canvas: HTMLCanvasElement, fileName: string): void {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

}
