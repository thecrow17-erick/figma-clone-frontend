import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../material';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AllRoomsComponent } from '../AllRooms/AllRooms.component';
import { MatDialog } from '@angular/material/dialog';
import { CreateRoomComponent } from '../create-room/create-room.component';


@Component({
  selector: 'app-rooms-grid',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    AllRoomsComponent
  ],
  templateUrl: "./rooms-grid.component.html"
})
export class RoomsGridComponent {

  private readonly dialog = inject(MatDialog);




  public openDialog(): void {
    const dialogRef = this.dialog.open(CreateRoomComponent,{
      width: "60%",
      height: "auto"
    });
  }

}
