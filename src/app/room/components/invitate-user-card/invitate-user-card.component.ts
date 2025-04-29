import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { User } from '../../../auth/interfaces';
import { MaterialModule } from '../../../material';
import { Role } from '../../../home/interfaces';
import { LocalstorageService } from '../../../shared/services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IBodyInvitateUser } from '../../interfaces';

@Component({
  selector: 'app-invitate-user-card',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: "./invitate-user-card.component.html"
})
export class InvitateUserCardComponent implements OnInit {
  @Input({required:true}) user!: User;
  @Input({required: true}) roomId!: number;
  @Output() invitate = new EventEmitter<IBodyInvitateUser>();

  public isLoading = signal<boolean>(false);
  private localStorage = inject(LocalstorageService);
  public roles = signal<{value: Role, desc: string}[]>([{ value: "MEMBER", desc: "Miembro"}]);
  public role: Role = "MEMBER";

  ngOnInit(): void {
    this.getRoles();
  }

  private getRoles(): void {
    const userRole = this.localStorage.getItem<Role>("role");
    if(userRole === "OWNER"){
      this.roles.update(value => [...value,{value: "COLABORATOR",desc: "Colaborador"}]);
    }
  }

  public invitateClick(): void {
    this.isLoading.set(true);
    this.invitate.emit({
      userId: this.user.id,
      role: this.role
    });
    this.isLoading.set(false);
  }

}
