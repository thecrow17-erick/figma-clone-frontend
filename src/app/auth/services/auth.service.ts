import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { IApiResponse } from '../../shared/interfaces';
import { IBodySignIn, IBodySignUp, IResponseSignIn, IResponseSignUp } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authUrl = `${environment.apiUrl}/auth`;

  private http = inject(HttpClient);

  public signIn(body: IBodySignIn): Observable<IApiResponse<IResponseSignIn>> {
    return this.http.post<IApiResponse<IResponseSignIn>>(`${this.authUrl}/sign-in`,body).pipe(
      tap(_ => console.log("Logeandose..."))
    );
  }

  public signUp(body: IBodySignUp): Observable<IApiResponse<IResponseSignUp>> {
    return this.http.post<IApiResponse<IResponseSignUp>>(`${this.authUrl}/sign-up`,body).pipe(
      tap( _ => console.log("Creando usuario.."))
    );
  }


}
