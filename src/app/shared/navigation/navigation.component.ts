import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  items: MenuItem[] | undefined;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.setMenuItems();
    this.filterMenuItems();
  }

  // Set menu items
  private setMenuItems() {
    this.items = [
      { label: 'My Account', command: () => this.navigateTo('account') },
      { label: 'Transactions', command: () => this.navigateTo('transactions') },
      { label: 'Admin', command: () => this.navigateTo('admin') },
      {
        label: 'Sign out',
        icon: 'pi pi-fw pi-sign-out',
        command: () => this.logoutUser(),
      }
    ];
  }

  // Filter menu items (show/hide Admin page)
  private filterMenuItems() {
    this.authService.isAdmin().subscribe(isAdmin => {
      if (!isAdmin) {
        this.items = this.items?.filter(item => item.label !== 'Admin');
      }
    })
  }

  private navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logoutUser() {
    this.authService.logoutUser();
  }

}
