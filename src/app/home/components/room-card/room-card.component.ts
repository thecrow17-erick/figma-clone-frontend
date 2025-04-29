import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { MaterialModule } from '../../../material';
import { IRooms, isRole, Role } from '../../interfaces';
import { LocalstorageService } from '../../../shared/services';
import { User } from '../../../auth/interfaces';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { InvitateUserComponent } from '../../../room/components';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [
    MaterialModule,
  ],
  templateUrl: "./room-card.component.html"
})
export class RoomCardComponent {
  @Input({required: true}) roomDetail!: IRooms;

  private router = inject(Router);
  private localStorage = inject(LocalstorageService);
  private readonly dialog = inject(MatDialog);

  public isRoleConvert(role: Role): string {
    const roledId = isRole[role];
    return roledId;
  }

  public goRoomId(): void {
    this.localStorage.setItem("role", this.roomDetail.role);

    this.router.navigate(["room",this.roomDetail.room.id]);
  }

  public getRole(): Role {
    return this.roomDetail.role;
  }

  public openDialogAddPerson(): void {
    this.localStorage.setItem("role", this.roomDetail.role);
    this.dialog.open(InvitateUserComponent,{
      width: "90vw",
      height: "800px",
      data: {
        room: this.roomDetail.room
      }
    });
  }

  public goCanvas(): void {
    this.router.navigate(["canva",this.roomDetail.room.code])
  }
}
