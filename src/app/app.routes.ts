import { Routes } from '@angular/router';
// import { FigmaEditorComponent } from './canvas/components/figma-editor/figma-editor.component';
import { authRoutes } from './auth/auth.routes';
import { homeRoutes } from './home/home.routes';

export const routes: Routes = [
  {
    path: "",
    redirectTo: "auth",
    pathMatch: "full"
  },
  {
    path: "auth",
    children: authRoutes
  },
  {
    path: "home",
    children: homeRoutes
  }
];
