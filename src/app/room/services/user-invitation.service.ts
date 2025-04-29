import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { IApiResponse } from '../../shared/interfaces';
import { IBodyInvitateUser, IResponseGetFindUsers } from '../interfaces';
import { IResponseInvitationAccept } from '../../home/interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserInvitationService {
  private userRoomUrl = `${environment.apiUrl}/user-room`
  private http = inject(HttpClient);



  public getFindUsers(token: string,roomId:number, search?: string): Observable<IApiResponse<IResponseGetFindUsers>> {
    let params = new HttpParams();
    if (search) {
      params = params.set("search", search);
    }
    const headers = new HttpHeaders()
      .set("auth-token",token);
    const url = `${this.userRoomUrl}/${roomId}/find-users`;
    return this.http.get<IApiResponse<IResponseGetFindUsers>>(url,{params,headers})
      .pipe(
        tap(_ => console.log("Buscando usuarios")
      )
    );
  }


  public invitateUser(body: IBodyInvitateUser, token: string, roomId: number): Observable<IApiResponse<IResponseInvitationAccept>> {
    const headers = new HttpHeaders()
      .set("auth-token", token);
    const url = `${this.userRoomUrl}/${roomId}/invitation`;
    return this.http.post<IApiResponse<IResponseInvitationAccept>>(url,body,{headers})
      .pipe(
        tap(_ => console.log("Invitando al usuario"))
      )
  }

  public removedUserRoom(userId: string,token: string, roomId: number): Observable<IApiResponse<IResponseInvitationAccept>>{
    const headers = new HttpHeaders()
      .set("auth-token", token);
    const url = `${this.userRoomUrl}/${roomId}/removed-user`;
    return this.http.put<IApiResponse<IResponseInvitationAccept>>(url,{user_id: userId},{headers})
      .pipe(
        tap(_ => console.log("Removiendo usuario de la sala"))
      )
  }

}
