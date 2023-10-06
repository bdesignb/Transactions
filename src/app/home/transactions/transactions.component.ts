import { AccountService } from 'src/app/services/account.service';
import { Transaction } from './../../models/transaction';
import { TransactionService } from './../../services/transaction.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { Category } from 'src/app/models/transaction';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class TransactionsComponent implements OnInit {
  // Transaction
  transaction: Transaction = <Transaction>{};
  transactions: Transaction[] = [<Transaction>{}];
  transactionDialog: boolean = false;
  amountSpentCopy?: number;

  // User
  user: User = <User>{};
  userId: string | null = null;

  constructor(
    private transactionService: TransactionService,
    private accountService: AccountService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService) { }

  ngOnInit() {
    this.userId = this.getStoredUserId();
    this.getUserById();
    this.getTransactions();
  }

  get Category() {
    return Category;
  }

  // Get all transactions
  private getTransactions() {
    if (this.userId) {
      this.transactionService.getTransactions(+this.userId)
        .subscribe(transactions => this.transactions = transactions);
    }
  }

  // Get user by id
  private getUserById() {
    this.accountService.getUserById(this.userId)
      .subscribe(user => this.user = user);
  }

  // Save/Update transaction
  saveTransaction() {
    if (!this.userId) return;
    this.transaction.userId = +this.userId;

    if (this.transaction.id !== 0) {
      // Modify user account balance by adding or subtracting the amount spent in the transaction
      const accountBalanceChanged = this.modifyAccountBalance();

      this.transactionService.updateTransaction(this.transaction)
        .subscribe(response => {
          if (response) {
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Transaction Updated', life: 3000 });
            this.getTransactions();
            // Update user account balance
            if (accountBalanceChanged) {
              this.updateAccountBalance();
            }
          }
        });
    } else {
      // Modify user account balance by subtracting the amount spent in the transaction
      this.user.accountAmount -= this.transaction.amountSpent;

      this.transactionService.saveTransaction(this.transaction)
        .subscribe(response => {
          if (response) {
            this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Transaction Created', life: 3000 });
            this.getTransactions();
            // Update user account balance
            this.updateAccountBalance();
          }
        });
    }
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
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Account balance updated', life: 3000 });
      });
  }

  // Delete transaction
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
              this.getTransactions();
              // Update user account balance
              this.updateAccountBalance();
            }
          });
        this.transaction = <Transaction>{};
      }
    });
  }

  // Open Transaction Dialog - add new transaction
  addTransaction() {
    this.transactionDialog = true;
    this.transaction = {
      id: 0,
      userId: this.userId ? +this.userId : 0,
      purchasedItem: '',
      category: Category.Accessories,
      date: new Date(),
      amountSpent: 0
    };
  }

  // Open Transaction Dialog - edit existing transaction
  editTransaction(transaction: Transaction) {
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

  // Get user id from localStorage
  private getStoredUserId(): string | null {
    return localStorage.getItem('userId');
  }

}
