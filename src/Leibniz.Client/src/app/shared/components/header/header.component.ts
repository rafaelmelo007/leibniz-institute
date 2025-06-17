import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AccountStore } from '../../../account/services/account.store';
import { Me } from '../../../account/domain/me';
import { tap } from 'rxjs';
import { DropdownComponent } from '../../../common/components/dropdown/dropdown.component';
import { MenuListComponent } from '../../../common/components/menu-list/menu-list.component';
import { MenuOption } from '../../../common/domain/menu-option';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DropdownComponent, RouterLink, RouterModule, MenuListComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  menuList?: MenuOption[] = [
    {
      label: 'View Profile',
      icon: 'fa fa-user',
    },
    {
      label: 'Sign out',
      icon: 'fa fa-sign-out',
      action: () => {
        this.accountStore.logout();
      },
    },
  ];

  me?: Me | null;

  constructor(private accountStore: AccountStore) {
    this.accountStore.me$
      .pipe(
        tap((res) => {
          this.me = res;
        })
      )
      .subscribe();
  }
}
