import { Transaction } from './../../models/transaction';
import { TransactionService } from './../../services/transaction.service';
import { Component } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { Category } from 'src/app/models/transaction';
import { User } from 'src/app/models/user';
import { AccountService } from 'src/app/services/account.service';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class AdminComponent {
  // User
  user: User = <User>{};
  users: User[] = [<User>{}];
  userDialog: boolean = false;

  // Transaction
  transaction: Transaction = <Transaction>{};
  transactions: Transaction[] = [<Transaction>{}];
  transactionListDialog: boolean = false;
  transactionDialog: boolean = false;
  amountSpentCopy?: number;

  constructor(
    private adminService: AdminService,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService) { }

  ngOnInit() {
    this.getAllUsers();
  }

  get Category() {
    return Category;
  }

  // Get all users
  private getAllUsers() {
    this.adminService.getAllUsers().subscribe(users => {
      this.users = users.filter(user => user.email !== 'admin@kireygroup.com')
    });
  }

  // Get user data and belonging transactions
  getUserTransactions(userId: number) {
    this.findUserById(userId);
    this.transactionService.getTransactions(userId).subscribe(transactions => this.transactions = transactions);
    this.transactionListDialog = true;
  }

  // Find User by id
  private findUserById(userId: number) {
    const foundUser = this.users.find(user => user.id === userId);
    this.user = foundUser ? foundUser : <User>{};
  }

  // Delete user and related transactions
  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user ${user.fullName ? user.fullName : ''}? `,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminService.deleteUser(user.id).subscribe(response => {
          if (response) {
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: `User ${user.fullName ? user.fullName : ''} Deleted`, life: 3000 });
            this.getAllUsers();
          }
        });
        this.transaction = <Transaction>{};
      }
    });
  }

  // Update user transaction
  updateTransaction(transaction: Transaction) {
    // Modify user account balance by adding the amount spent in the transaction
    const accountBalanceChanged = this.modifyAccountBalance();

    this.transactionService.updateTransaction(transaction)
      .subscribe(response => {
        if (response) {
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Transaction Updated', life: 3000 });
          this.getUserTransactions(transaction.userId);
          // Update user account balance if changed
          if (accountBalanceChanged) {
            this.updateAccountBalance();
          }
        }
      });
    this.closeTransactionDialog();
  }

  // Modify user account balance
  private modifyAccountBalance(): boolean {
    let accountBalanceChanged = false;

    if (this.amountSpentCopy !== null && this.amountSpentCopy !== undefined && this.amountSpentCopy !== this.transaction.amountSpent) {
      const amountSpentDif = this.amountSpentCopy - this.transaction.amountSpent;
      if (amountSpentDif < 0) {
        this.user.accountAmount -= Math.abs(amountSpentDif);
      } else {
        this.user.accountAmount += amountSpentDif;
      }
      accountBalanceChanged = true;
    }
    return accountBalanceChanged;
  }

  // Update user account balance
  private updateAccountBalance() {
    this.accountService.updateAccountBalance(this.user.id, this.user.accountAmount)
      .subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User account balance updated', life: 3000 });
      });
  }

  // Delete user transaction
  deleteTransaction(transaction: Transaction) {
    // Modify user account balance by adding the amount spent in the transaction
    this.user.accountAmount += transaction.amountSpent;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete transaction ${transaction.purchasedItem ? transaction.purchasedItem : ''}? `,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.transactionService.deleteTransaction(transaction.id)
          .subscribe(response => {
            if (response) {
              this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Transaction Deleted', life: 3000 });
              this.getUserTransactions(transaction.userId);
              // Update user account balance
              this.updateAccountBalance();
            }
          });
        this.transaction = <Transaction>{};
      }
    });
  }

  // Open Transaction Dialog
  openTransactionDialog(transaction: Transaction) {
    this.transaction = { ...transaction };
    this.amountSpentCopy = this.transaction.amountSpent;
    this.transaction.date = new Date(this.transaction.date);
    this.transactionDialog = true;
  }

  // Close Transaction Dialog
  closeTransactionDialog() {
    this.transactionDialog = false;
    this.transaction = <Transaction>{};
    this.amountSpentCopy = undefined;
  }

}
