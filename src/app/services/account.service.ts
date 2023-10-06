import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private localUrl = environment.localUrl;

  constructor(private http: HttpClient) { }

  // Get user by id
  getUserById(userId: any): Observable<User> {
    const url = `${this.localUrl}users/${userId}`;
    return this.http.get<User>(url);
  }

  // Update user account balance
  updateAccountBalance(userId: number, accountAmount: number): Observable<User> {
    const url = `${this.localUrl}users/${userId}`
    return this.http.patch<User>(url, { accountAmount })
  }
}
