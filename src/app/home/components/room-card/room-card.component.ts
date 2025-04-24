import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { MaterialModule } from '../../../material';
import { IRooms, isRole, Role } from '../../interfaces';
import { LocalstorageService } from '../../../shared/services';
import { User } from '../../../auth/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [
    MaterialModule
  ],
  templateUrl: "./room-card.component.html"
})
export class RoomCardComponent {
  @Input({required: true}) roomDetail!: IRooms;
  public isRoleConvert(role: Role): string {
    const roledId = isRole[role];
    return roledId;
  }

}
