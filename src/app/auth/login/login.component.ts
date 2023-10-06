import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  user: User = <User>{};
  signUpUser: User = <User>{};
  emailPattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  passwordPattern: RegExp = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{5,}$/;
  emailAvailable: boolean | null = null;
  errorMessage: string | null = null;
  signUpDialog: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    const errorMessageSubscription = this.authService.errorMessage$
      .subscribe(message => {
        this.errorMessage = message;
      });
    this.subscriptions.add(errorMessageSubscription);

    this.redirectLoggedInUser();
  }

  // Login user
  loginUser() {
    this.authService.loginUser(this.user.email, this.user.password);
  }

  // Save new user
  saveUser() {
    this.authService.saveUser(this.signUpUser)
      .subscribe({
        next: (user: User) => {
          this.authService.loginUser(user.email, user.password);
          this.signUpDialog = false;
          this.signUpUser = <User>{};
        },
        error: (error: any) => {
          console.log('Error occured: ', error);
        }
      })
  }

  // Check email availability
  checkEmailAvailability(email: string) {
    this.authService.checkEmailAvailability(email).subscribe(emailAvailable => {
      this.emailAvailable = emailAvailable;
    })
  }

  // Redirect logged in user
  redirectLoggedInUser() {
    const loggedInUser = this.authService.hasStoredUserId();
    if (loggedInUser) {
      this.router.navigate(['/account']);
    }
  }

   // Sign up (open dialog)
   signUp(loginForm: NgForm) {
    this.signUpDialog = true;
    loginForm.reset();
  }

  // Reset sign up form
  resetSignUpForm(signUpform: NgForm) {
    this.signUpDialog = false;
    return signUpform.reset();
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

}
