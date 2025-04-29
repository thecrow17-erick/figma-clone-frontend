import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { MaterialModule } from '../../../material';
import { UserElement } from '../../interfaces';
import { DatePipe } from '@angular/common';
import { isRole, Role } from '../../../home/interfaces';
import { LocalstorageService } from '../../../shared/services';
import { Router } from '@angular/router';
import { User } from '../../../auth/interfaces';

@Component({
  selector: 'app-room-users-component',
  standalone: true,
  imports: [
    MaterialModule,

  ],
  providers:[
    DatePipe
  ],
  templateUrl: "./room-users-component.component.html"
})
export class RoomUsersComponentComponent implements OnInit {

  @Input({required: true}) users!: UserElement[];

  @Output() removedUserEvent = new EventEmitter<string>();

  private localStorage = inject(LocalstorageService);
  private router = inject(Router);
  dataSource = signal<UserElement[]>([]) ;
  private datePipe = inject(DatePipe);

  // Columnas para la tabla de usuarios
  displayedColumns: string[] = ['NOMBRE', 'ROL', 'EMAIL', 'FECHA INGRESO'];


  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'dd/MM/yyyy HH:mm') || '';
  }

  public isRoleConvert(role: Role): string {
      const roledId = isRole[role];
      return roledId;
  }

  ngOnInit(): void {
    const user = this.localStorage.getItem<User>("user");
    if(!user){
      this.router.navigate(["auth/sign-in"]);
      return;
    }
    this.dataSource.set(this.users.filter(userfil => userfil.user_id != user.id && userfil.status === "OFICIAL"));
    const role = this.localStorage.getItem<Role>("role");
    if(!role){
      this.router.navigate(["home"]);
      return;
    }
    if(role === "OWNER") this.displayedColumns.push("ELIMINAR")
  }

}
