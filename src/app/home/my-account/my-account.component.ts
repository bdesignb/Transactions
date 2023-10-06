import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { User } from 'src/app/models/user';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss'],
  providers: [MessageService]
})
export class MyAccountComponent implements OnInit {
  user: User = <User>{};
  displayDialog: boolean = false;
  accountAmount?: number;

  constructor(
    private accountSerivce: AccountService,
    private messageService: MessageService) { }

  ngOnInit() {
    this.getUserById(localStorage.getItem('userId'));
  }

  // Get User by Id
  private getUserById(userId: any) {
    this.accountSerivce.getUserById(userId).subscribe(user => this.user = user);
  }

  // Update user account balance
  updateAccountBalance() {
    if (this.accountAmount !== null && this.accountAmount !== undefined) {
      this.accountSerivce.updateAccountBalance(this.user.id, this.accountAmount)
        .subscribe(response => {
          if (response) {
            this.getUserById(this.user.id);
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Account balance updated', life: 3000 });
          }
        },
        error => {
          console.error('Error updating account balance:', error);
        });
    }
    this.displayDialog = false;
  }

  // Show dialog
  showDialog() {
    this.accountAmount = this.user.accountAmount;
    this.displayDialog = true;
  }
}
