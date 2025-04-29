import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { IApiResponse } from '../../shared/interfaces';
import { Invitation, IResponseGetInvitations, IResponseInvitationAccept, RoomElement } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  private invitationUrl = `${environment.apiUrl}`
  private http = inject(HttpClient);



  public getInvitations(token: string): Observable<IApiResponse<IResponseGetInvitations>> {
    const headers = new HttpHeaders()
      .set("auth-token", token);
    return this.http.get<IApiResponse<IResponseGetInvitations>>(`${this.invitationUrl}/room/invitation`,{headers}).pipe(
      tap(_ => console.log("Obteniendo invitaciones..."))
    )
  }

  public acceptOrRefusedInvitation(roomId: number, token: string, type: Invitation): Observable<IApiResponse<IResponseInvitationAccept>> {
    const headers = new HttpHeaders()
      .set("auth-token", token);
    return this.http.put<IApiResponse<IResponseInvitationAccept>>(
      `${this.invitationUrl}/user-room/${roomId}/${type}`,
      null,
      {headers}
    ).pipe(
      tap(_ => console.log("Invitacion aceptada..."))
    )
  }

}
