import { LocalstorageService } from './../../../shared/services/localstorage.service';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MaterialModule } from '../../../material';
import { User } from '../../../auth/interfaces';
import {  Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-profile',
  standalone: true,
  imports: [
    MaterialModule,
  ],
  templateUrl: './header-profile.component.html'
})
export class HeaderProfileComponent implements OnInit {

  private localstorageService = inject(LocalstorageService);
  public user = signal<User | null>(null);
  public router = inject(Router);

  ngOnInit(): void {
      this.storageInit();
  }

  private storageInit(): void {
    const user = this.localstorageService.getItem<User>("user")
    if(!user){
      this.localstorageService.clear();
      this.router.navigate(["auth/sign-in"],{
        replaceUrl: true
      });
      return;
    }
    this.user.set(user);
  }

  public logout(): void {
    this.localstorageService.removeItem("user");
    this.localstorageService.removeItem("token");
    this.router.navigate(["auth/sign-in"],{
      replaceUrl: true
    });
  }

}
