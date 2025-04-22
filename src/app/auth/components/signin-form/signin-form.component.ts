import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MaterialModule } from '../../../material';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IBodySignIn } from '../../interfaces';
import { Router, RouterLink } from '@angular/router';
import { LocalstorageService } from '../../../shared/services';
import { AuthService } from '../../services';

@Component({
  selector: 'app-signin-form',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: "./signin-form.component.html"
})
export class SigninFormComponent implements OnInit{
  public is_pass = signal(false);
  private router = inject(Router);
  public signInForm!: FormGroup;
  public isLoading = signal<boolean>(false);
  private authService = inject(AuthService);
  private localStorageService = inject(LocalstorageService);

  ngOnInit(): void {
      this.setForm();
  }

  public isViewPass(): void{
    this.is_pass.update((pass)=>!pass);
  }

  private setForm(): void{
    this.signInForm = new FormGroup({
      email: new FormControl('',[
        Validators.required,
        Validators.minLength(3),
        Validators.email
      ]),
      password: new FormControl('',[
        Validators.required,
        Validators.minLength(3)
      ])
    })
  }

  public clickLogin(){
    if(!this.signInForm.valid) return;

    this.isLoading.set(true);
    const body: IBodySignIn = {
      email: this.signInForm.value.email!,
      password: this.signInForm.value.password!
    }

    this.authService.signIn(body).subscribe(
      {
        next: (res) => {
          this.isLoading.set(false);
          this.localStorageService.setItem("user", res.data.user);
          this.localStorageService.setItem("token", res.data.token);
          const isUrl = this.localStorageService.getItem<string>("url_dir");
          if(isUrl){
            this.router.navigate([isUrl],{
              replaceUrl: true
            });
          }else{
            this.router.navigate(["home"],{
              replaceUrl: true
            });
          }
        },
        error: (err) => {
          alert(JSON.stringify(err));
          this.isLoading.set(false);
        }
      }
    );
  }

}
