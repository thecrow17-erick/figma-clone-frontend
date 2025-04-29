import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { MaterialModule } from '../../../material';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../home/services';
import { LocalstorageService } from '../../../shared/services';
import { Room } from '../../interfaces';
import { RoomUsersComponentComponent } from '../../components';
import { UserInvitationService } from '../../services';

@Component({
  selector: 'app-room-page',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    RoomUsersComponentComponent
  ],
  providers: [
    DatePipe
  ],
  templateUrl: "./room-page.component.html"
})
export class RoomPageComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private userRoomService = inject(UserInvitationService);
  private roomService = inject(RoomService);
  private localStorage = inject(LocalstorageService);
  public room = signal<Room | null>(null);
  public isLoading = signal<boolean>(false);
  private datepipe = inject(DatePipe);

  goBack(): void {
    window.history.back();
  }

  ngOnInit(): void {
    this.getRoom();
  }

  // Función para formatear fechas
  public formatDate(dateString: string): string {
    return this.datepipe.transform(dateString, 'dd/MM/yyyy HH:mm') || '';
  }

  private getRoom(): void {
    const roomId = + this.route.snapshot.paramMap.get('id')!;
    const token = this.localStorage.getItem<string>("token");
    if(!token) return;

    this.roomService.getRoomId(roomId,token).subscribe({
      next: (res)=> {
        console.log("room:", res);
        this.isLoading.set(true);
        this.room.set(res.data.room)
      }
    })
  }

  public removedUser(userId: string): void {
    const token = this.localStorage.getItem<string>("token");
    if(!token) return;

    this.userRoomService.removedUserRoom(userId,token!,this.room()!.id).subscribe(
      {
        next: (_)=> {
          this.getRoom();
        },
        error: (err)=>{
          console.log(err);
          alert(JSON.stringify(err))
        }
      }
    )
  }

  ngOnDestroy(): void {
    this.localStorage.removeItem("role");
  }
}
