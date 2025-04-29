import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material';
import { CommonModule } from '@angular/common';
import { LocalstorageService } from '../../../shared/services';
import { User } from '../../../auth/interfaces';
import { UserInvitationService } from '../../services';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvitateUserCardComponent } from '../invitate-user-card/invitate-user-card.component';
import { Role } from '../../../home/interfaces';
import { IBodyInvitateUser } from '../../interfaces';

@Component({
  selector: 'app-invitate-user',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    InvitateUserCardComponent
  ],
  templateUrl: "./invitate-user.component.html"
})
export class InvitateUserComponent implements  OnDestroy {
  public data = inject(MAT_DIALOG_DATA);
  public localStorage = inject(LocalstorageService)
  public invitationService = inject(UserInvitationService);
  public isLoading = signal<boolean>(false);
  private router = inject(Router);
  public filteredUsers = signal<User[]>([])
  public search: string = '';

  ngOnDestroy(): void {
    this.localStorage.removeItem("role");
  }

  public searchUsers(): void {
    if(this.search === ''){
      this.getUsers();
      return;
    }

    this.getUsers(this.search);

  }

  private getUsers(search?: string): void {
    this.isLoading.set(true);
    const token = this.localStorage.getItem<string>("token");
    if(!token) this.goAuth()
    const roomId = +this.data.room.id;

    this.invitationService.getFindUsers(token!,roomId,search).subscribe(
      {
        next: (res) => {
          this.filteredUsers.set(res.data.users);
          this.isLoading.set(false);
        },
        error: (_) => {
          this.isLoading.set(false);
          this.goAuth();
        }
      }
    );
  }

  private goAuth(): void {
    this.router.navigate(["auth/sign-in"],{
      replaceUrl: true
    });
    this.localStorage.removeItem("token");
    this.localStorage.removeItem("user");
    return;
  }

  public invitateUser(body: IBodyInvitateUser): void {
    const roomId = +this.data.room.id;
    const token = this.localStorage.getItem<string>("token");
    if(!token) this.goAuth();
    this.invitationService.invitateUser(body,token!,roomId).subscribe(
      {
        next: (_) => {
          this.getUsers(this.search);
        },
        error: (err)=> {
          alert(JSON.stringify(err));
        }
      }
    )
  }
}
