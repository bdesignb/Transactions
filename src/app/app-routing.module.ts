import { AdminGuard } from './guards/admin.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { MyAccountComponent } from './home/my-account/my-account.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminComponent } from './home/admin/admin.component';
import { TransactionsComponent } from './home/transactions/transactions.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'transactions', component: TransactionsComponent, canActivate: [AuthGuard]},
  { path: 'account', component: MyAccountComponent, canActivate: [AuthGuard]},
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard, AdminGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
