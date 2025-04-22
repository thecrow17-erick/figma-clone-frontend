import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { LocalstorageService } from '../../shared/services';

export const authGuard: CanActivateFn = (route, state) => {
  const localStorage = inject(LocalstorageService);
  const router = inject(Router);

  const token = localStorage.getItem<string>("token");

  if(!token) {
    router.navigate(['auth/sign-in'],{
      replaceUrl: true
    });
    return false;
  }
  return true;
};
