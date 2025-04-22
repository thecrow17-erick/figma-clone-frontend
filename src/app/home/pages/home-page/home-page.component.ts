import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModule } from '../../../material';
import { HeaderProfileComponent } from '../../components';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MaterialModule,
    HeaderProfileComponent
  ],
  templateUrl: "./home-page.component.html"
})
export class HomePageComponent {


}
