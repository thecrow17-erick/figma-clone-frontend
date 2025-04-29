import { Injectable } from '@angular/core';
import { environment } from '../../../environments';
import {Socket, io} from "socket.io-client"

@Injectable({
  providedIn: 'root'
})
export class CanvasSocketService {

  private socket: Socket = io(environment.wsUrl);
  private currentRoom: string | null = null;

  joinRoom(roomCode: string): void {

    this.currentRoom = roomCode;
    this.socket.emit('joinRoom', roomCode);
    console.log("conect");
  }

  leaveRoom(): void {
    if (this.currentRoom) {
      this.socket.emit('leaveRoom', this.currentRoom);
      this.currentRoom = null;
    }
  }

  onCanvasState(callback: (data: any) => void): void {
    this.socket.on('canvasState', callback);
  }

  onCanvasUpdate(callback: (data: any) => void): void {
    this.socket.on('canvasUpdate', callback);
  }

  sendCanvasUpdate(data: any): void {
    if (this.currentRoom) {
      this.socket.emit('canvasUpdate', {
        roomCode: this.currentRoom,
        data: JSON.stringify(data)
      });
    }
  }

  disconnect(): void {
    this.socket.disconnect();
  }

}
