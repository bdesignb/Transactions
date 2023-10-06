import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Transaction } from '../models/transaction';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private localUrl = environment.localUrl;
  private url = `${this.localUrl}transactions`;

  constructor(private http: HttpClient) { }

  // Get user transactions
  getTransactions(userId: number): Observable<Transaction[]>{
    return this.http.get<Transaction[]>(`${this.url}?userId=${userId}`);
  }

  // Save transaction
  saveTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.url, transaction);
  }

  // Update transaction
  updateTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.url}/${transaction.id}`,  transaction );
  }
  // Delete transaction
  deleteTransaction(transactionId: number): Observable<Transaction> {
    return this.http.delete<Transaction>(`${this.url}/${transactionId}`);
  }

}
