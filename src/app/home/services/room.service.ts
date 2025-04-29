import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { IApiResponse } from '../../shared/interfaces';
import { IBodyCreateRoom, IResponseAllRooms, IResponseCreateRoom } from '../interfaces';
import { IRoomIDGetResponse } from '../../room/interfaces';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private roomUrl = `${environment.apiUrl}/room`
  private http = inject(HttpClient);

  public getRooms(token: string): Observable< IApiResponse<IResponseAllRooms>> {
    const header = new HttpHeaders()
      .set("auth-token",token);

    return this.http.get<IApiResponse<IResponseAllRooms>>(this.roomUrl, {
      headers: header
    }).pipe(
      tap( _ => console.log("Obteniendo salas..."))
    )
  }

  public createRoom(body: IBodyCreateRoom, token: string): Observable<IApiResponse<IResponseCreateRoom>>{
    const headers = new HttpHeaders()
      .set("auth-token", token);
    return this.http.post<IApiResponse<IResponseCreateRoom>>(this.roomUrl, body,{
      headers
    })
      .pipe(
        tap( _ => console.log("Creando sala..."))
      );
  }

  public getRoomId(id: number, token: string): Observable<IApiResponse<IRoomIDGetResponse>> {
    const headers = new HttpHeaders()
      .set("auth-token", token);

    return this.http.get<IApiResponse<IRoomIDGetResponse>>(`${this.roomUrl}/${id}`,{
      headers
    }).pipe(
      tap( _ => console.log("Obteniendo datos de la sala..."))
    )

  }

}
