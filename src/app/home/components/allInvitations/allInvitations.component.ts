import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RoomElement } from '../../interfaces';
import { LocalstorageService } from '../../../shared/services';
import { InvitationService } from '../../services/invitation.service';
import { Router } from '@angular/router';
import { CardInvitationRoomComponent } from '../card-invitation-room/card-invitation-room.component';

@Component({
  selector: 'app-all-invitations',
  standalone: true,
  imports: [
    CommonModule,
    CardInvitationRoomComponent
  ],
  templateUrl: "./allInvitations.component.html"
})
export class AllInvitationsComponent implements OnInit {
  public allInvitation = signal<RoomElement[]>([]);
  private localStorage = inject(LocalstorageService);
  private invitationService = inject(InvitationService);
  private router = inject(Router);
  ngOnInit(): void {
    this.getAllInvitation();
  }

  private getAllInvitation(): void {
    const token = this.localStorage.getItem<string>("token");
    if(!token){
      this.goToBack();
    }
    this.invitationService.getInvitations(token!).subscribe({
      next: (res)=> {
        this.allInvitation.set(res.data.rooms);
      },
      error: (err) => {
        this.goToBack();
      }
    })
  }


  private goToBack(): void {
    this.localStorage.removeItem("token");
    this.localStorage.removeItem("user");
    this.router.navigate(["auth","sign-in"],{
      replaceUrl: true
    });
    return;

  }

  public acceptInvitation(roomId: number): void {
    const token = this.localStorage.getItem<string>("token");
    if(!token) this.goToBack();

    this.invitationService.acceptOrRefusedInvitation(roomId,token!,"accept-invitation").subscribe(
      {
        next: (_)=> {
          this.getAllInvitation();
        },
        error: (err) => {
          alert(JSON.stringify(err))
        }
      }
    )
  }

  public refusedInvitation(roomId: number): void {
    const token = this.localStorage.getItem<string>("token");
    if(!token) this.goToBack();

    this.invitationService.acceptOrRefusedInvitation(roomId,token!,"refused-invitation").subscribe(
      {
        next: (_)=> {
          this.getAllInvitation();
        },
        error: (err) => {
          console.log(JSON.stringify(err));
        }
      }
    )
  }

}
