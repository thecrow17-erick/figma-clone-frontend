import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MaterialModule } from '../../../material';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: "./signup-form.component.html"
})
export class SignupFormComponent implements OnInit {
  public is_pass = signal(false);
  public isLoading = signal(false);
  private router = inject(Router);
  public signInForm!: FormGroup;
  public authService = inject(AuthService);

  ngOnInit(): void {
      this.setForm();
  }
  public isViewPass(): void{
    this.is_pass.update((pass)=>!pass);
  }

  private setForm(): void{
    this.signInForm = new FormGroup({
      username: new FormControl('',[
        Validators.required,
        Validators.minLength(8)
      ]),
      email: new FormControl('',[
        Validators.required,
        Validators.minLength(5)
      ]),
      password: new FormControl('',[
        Validators.required,
        Validators.minLength(8)
      ])
    })
  }

  public clickSignUp(){
    if(!this.signInForm.valid) return;

    this.isLoading.set(true);
    const body = {
      email: this.signInForm.value.email!,
      password: this.signInForm.value.password!,
      username: this.signInForm.value.username!
    }
    this.authService.signUp(body).subscribe(
      {
        next: (_) => {
          this.isLoading.set(false);
          this.router.navigate(["auth/sign-in"]);
        },
        error: (err) => {
          alert(JSON.stringify(err));
          this.isLoading.set(false);
        }
      }
    )
  }
}
