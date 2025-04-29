import {  Component } from '@angular/core';
import { MaterialModule } from '../../../material';
import { AllInvitationsComponent, AllRoomsComponent, HeaderProfileComponent } from '../../components';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MaterialModule,
    HeaderProfileComponent,
    AllInvitationsComponent,
    AllRoomsComponent
  ],
  templateUrl: "./home-page.component.html"
})
export class HomePageComponent {}
