import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { Me } from '../../../user/domain/me';
import { tap } from 'rxjs';
import { DropdownComponent } from '../../../common/components/dropdown/dropdown.component';
import { MenuListComponent } from '../../../common/components/menu-list/menu-list.component';
import { MenuOption } from '../../../common/domain/menu-option';
import { UserStore } from '../../../user/services/user.store';

@Component({
  selector: 'app-header',
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
        this.userStore.logout();
      },
    },
  ];

  me?: Me | null;

  constructor(private userStore: UserStore) {
    this.userStore.me$
      .pipe(
        tap((res) => {
          this.me = res;
        })
      )
      .subscribe();
  }
}
