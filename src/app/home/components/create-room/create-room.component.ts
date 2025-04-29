import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocalstorageService } from '../../../shared/services';
import { RoomService } from '../../services';
import { IBodyCreateRoom } from '../../interfaces';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-room',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: "./create-room.component.html"
})
export class CreateRoomComponent implements OnInit{
  private readonly dialogRef = inject(MatDialogRef<CreateRoomComponent>);
  public roomForm!: FormGroup;
  private localStorage = inject(LocalstorageService);
  private roomService = inject(RoomService);
  private router = inject(Router);
  public isLoading = signal<boolean>(false);
  public file: File | undefined = undefined;

  ngOnInit(): void {
    this.setForm();

  }

  private setForm(): void{
    this.roomForm = new FormGroup({
      name: new FormControl('',[
        Validators.required,
        Validators.minLength(3),
      ]),
      description: new FormControl('',[
        Validators.required,
        Validators.minLength(10)
      ])
    })
  }

  public onNoClick(): void {
    this.dialogRef.close();
  }

  public onSubmitCreateRoom(): void {
    if(!this.roomForm.valid) return;

    this.isLoading.set(true);
    const body: IBodyCreateRoom = {
      name: this.roomForm.value.name!,
      description: this.roomForm.value.description!
    };
    const token = this.localStorage.getItem<string>("token");

    if(!token){
      this.localStorage.removeItem("token");
      this.router.navigate(["auth/sign-in"],{
        replaceUrl: true
      });
      return;
    }

    this.roomService.createRoom(body,token,this.file).subscribe(
      {
        next: (res) => {
          console.log(res);
          this.isLoading.set(false);
          this.dialogRef.close();
        },
        error: (err) => {
          this.isLoading.set(false);
          alert(JSON.stringify(err));
        }
      }
    );
  }

  handleFile(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.file = input.files![0];
  }
}
