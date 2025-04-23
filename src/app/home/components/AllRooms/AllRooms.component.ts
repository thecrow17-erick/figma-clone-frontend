import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MaterialModule } from '../../../material';
import { RoomCardComponent } from '../room-card/room-card.component';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../services';
import { LocalstorageService } from '../../../shared/services';
import { Router } from '@angular/router';
import { IRooms } from '../../interfaces';

@Component({
  selector: 'app-all-rooms',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    RoomCardComponent
  ],
  templateUrl: "./AllRooms.component.html"
})
export class AllRoomsComponent implements OnInit{

  private roomService = inject(RoomService);
  private localStorage = inject(LocalstorageService);
  private router = inject(Router);
  public rooms = signal<IRooms[]>([]);

  ngOnInit(): void {
    this.getRoomsUser();
  }


  private getRoomsUser ():void {
    const token = this.localStorage.getItem<string>("token");

    if(!token){
      this.localStorage.removeItem("user");
      this.router.navigate(["auth/sign-in"],{
        replaceUrl: true
      });
    }
    this.roomService.getRooms(token!).subscribe(
      {
        next: (res) => {
          console.log(res);
          this.rooms.set(res.data.rooms);
        },
        error: (err) => {
          alert(JSON.stringify(err));
        }
      }
    )

  }

}
