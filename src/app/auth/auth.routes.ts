import { Routes } from "@angular/router";
import { AuthPageComponent } from "./pages";
import { SigninFormComponent, SignupFormComponent } from "./components";


export const authRoutes: Routes = [
  {
    path: "",
    redirectTo: "sign-in",
    pathMatch: 'full'
  },
  {
    path: "",
    component: AuthPageComponent,
    children: [
      {
        path: "sign-in",
        component: SigninFormComponent
      },
      {
        path: "sign-up",
        component: SignupFormComponent
      }
    ]
  }
];
