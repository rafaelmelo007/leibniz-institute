import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './common/components/header/header.component';
import { LoadingComponent } from './common/components/loading/loading.component';
import { MessagesService } from './common/services/messages.service';
import { AccountStore } from './account/services/account.store';
import { BreakpointIndicatorComponent } from "./common/components/debug-display-mode/debug-display-mode.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, LoadingComponent, BreakpointIndicatorComponent],
  providers: [MessagesService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  showHeader = true;

  constructor(private router: Router, private accountStore: AccountStore) {
    this.router.events.subscribe((ev: any) => {
      const currentUrl = this.router.url;
      const type = ev.constructor.name;

      if (!(ev instanceof NavigationEnd) || currentUrl == '/') return;

      this.showHeader = this.shouldShowHeader(currentUrl);
      if (this.showHeader) {
        this.accountStore.tryRetrieveUser();
      }
    });
  }

  shouldShowHeader(url: string): boolean {
    const noHeaderRoutes = [
      '/pages/account/login',
      '/pages/account/register',
      '/pages/account/forgot-password',
      '/pages/account/reset-password',
    ];

    return !noHeaderRoutes.some((route) => url.startsWith(route));
  }
}
