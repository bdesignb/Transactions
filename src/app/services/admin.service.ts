import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { Transaction } from '../models/transaction';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private localUrl = environment.localUrl;

  constructor(private http: HttpClient) { }

  // Get all users
  getAllUsers(): Observable<User[]> {
    const url = `${this.localUrl}users`;
    return this.http.get<User[]>(url);
  }

  // Delete user
  deleteUser(userId: number): Observable<User> {
    const url = `${this.localUrl}users/${userId}`;
    return this.http.delete<User>(url);
  }

  // Delete user transactions
  deleteUserTransactions(userId: number): Observable<Transaction> {
    const url = `${this.localUrl}transactions?userId=${userId}`;
    return this.http.delete<Transaction>(url);
  }
}
