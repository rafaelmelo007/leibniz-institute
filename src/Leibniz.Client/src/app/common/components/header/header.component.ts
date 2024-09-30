import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from '../../components/dropdown/dropdown.component';
import { RouterLink, RouterModule } from '@angular/router';
import { AccountStore } from '../../../account/services/account.store';
import { Me } from '../../../account/domain/me';
import { tap } from 'rxjs';
import { MenuOption } from '../../domain/menu-option';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [DropdownComponent, RouterLink, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
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

  constructor(private accountStore: AccountStore) {}

  ngOnInit(): void {
    this.accountStore.me$
      .pipe(
        tap((res) => {
          this.me = res;
        })
      )
      .subscribe();
  }
}
