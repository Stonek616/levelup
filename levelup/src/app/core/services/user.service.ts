import { Injectable, signal} from '@angular/core';
import { AuthUser } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _currentUser = signal<AuthUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  setUser (user: AuthUser) {
     this._currentUser.set(user);
  }

  clearUser () {
     this._currentUser.set(null);
  }

}
