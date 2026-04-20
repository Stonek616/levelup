import { Injectable, signal} from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  setUser (user: User) {
     this._currentUser.set(user);
  }

  clearUser () {
     this._currentUser.set(null);
  }

}
