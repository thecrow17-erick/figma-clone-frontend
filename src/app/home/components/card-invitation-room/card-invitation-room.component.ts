import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { isRole, Role, RoomElement } from '../../interfaces';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-card-invitation-room',
  standalone: true,
  imports: [],
  providers: [
    DatePipe
  ],
  templateUrl: "./card-invitation-room.component.html"
})
export class CardInvitationRoomComponent {

  @Input({required: true}) invitation!: RoomElement;
  @Output() accept = new EventEmitter<void>();
  @Output() refused = new EventEmitter<void>();

  private datePipe = inject(DatePipe);

  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm') || '';
  }

  public isRoleConvert(role: Role): string {
    const roledId = isRole[role];
    return roledId;
  }
}
