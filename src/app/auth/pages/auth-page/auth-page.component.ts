import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: "./auth-page.component.html",
})
export class AuthPageComponent { }
