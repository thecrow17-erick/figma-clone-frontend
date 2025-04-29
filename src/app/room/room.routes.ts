import { Routes } from "@angular/router";
import { RoomPageComponent } from "./page";



export const roomRoutes: Routes = [
  {
    path: ":id",
    component: RoomPageComponent
  }
];
