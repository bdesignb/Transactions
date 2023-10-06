import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { Observable, map, of, catchError, Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private localUrl = environment.localUrl;
  private userIdKey = 'userId';
  user: User = <User>{};

  private isLoggedIn = new Subject<boolean>();;
  isLoggedIn$ = this.isLoggedIn.asObservable();

  private errorMessage = new Subject<string>();
  errorMessage$ = this.errorMessage.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  // Login user
  loginUser(email: string, password: string): void {
    this.http.get<User[]>(`${this.localUrl}users`, { params: { email, password } })
      .subscribe({
        next: (users: User[]) => {
          if (users.length > 0) {
            this.user = users[0];
            this.storeUserId(users[0].id);
            this.navigateToAccountPage();
          } else {
            this.errorMessage.next('Incorrect email or password');
          }
        },
        error: (error: any) => {
          console.log('Error', error);
          this.errorMessage.next('An error occurred while processing your request')
        }
      })
  }

  // Logout user
  logoutUser(): void {
    this.removeStoredUserId();
    this.navigateToLoginPage();
  }

  // Store user id in localStorage
  private storeUserId(userId: number): void {
    localStorage.setItem(this.userIdKey, userId.toString());
    this.isLoggedIn.next(true);
  }

  // Remove user from localStorage
  private removeStoredUserId(): void {
    localStorage.removeItem(this.userIdKey);
    this.isLoggedIn.next(false);
  }

  // Check if user id exist in localStorage
  hasStoredUserId(): boolean {
    return !!localStorage.getItem(this.userIdKey);
  }

  // Get user id from localStorage
  getStoredUserId(): string | null {
    return localStorage.getItem(this.userIdKey);
  }

  // Save new user
  saveUser(user: User): Observable<User> {
    const url = `${this.localUrl}users`;
    return this.http.post<any>(url, user);
  }

  // Get user by id
  private getUserById(userId: any): Observable<User> {
    const url = `${this.localUrl}users/${userId}`;
    return this.http.get<User>(url);
  }

  // Check if email already exist
  checkEmailAvailability(email: string): Observable<boolean> {
    const url = `${this.localUrl}users`;
    return this.http.get<User[]>(url, { params: { email } }).pipe(
      map(users => users.length === 0)
    )
  }

  // Check if user is admin
  isAdmin(): Observable<boolean> {
    const userId = this.getStoredUserId();

    if (!userId) {
      return of(false);
    }
    return this.getUserById(userId).pipe(
      map(user => user && user.email === 'admin@kireygroup.com' && user.password === 'Admin@kireygroup2023'),
      catchError(() => of(false))
    )
  }

  // Navigate to Login Page
  private navigateToLoginPage(): void {
    this.router.navigate(['/']);
  }

  // Navigate to Account Page
  private navigateToAccountPage(): void {
    this.router.navigate(['/account']);
  }

}
