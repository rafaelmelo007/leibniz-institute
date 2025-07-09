import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MessagesService } from './common/services/messages.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { filter } from 'rxjs';
import { UserStore } from './user/services/user.store';
import { LoadingService } from './common/services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  providers: [MessagesService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  showHeader = true;
  loading = true;

  constructor(
    private router: Router,
    private userStore: UserStore,
    loadingService: LoadingService
  ) {
    loadingService.loading$.subscribe((x) => {
      this.loading = x;
    });
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const currentUrl = this.router.url;
        this.showHeader = this.shouldShowHeader(currentUrl);
        if (this.showHeader) {
          this.userStore.tryRetrieveUser();
        }
      });
  }

  shouldShowHeader(url: string): boolean {
    const noHeaderRoutes = [
      '/pages/user/login',
      '/pages/user/register',
      '/pages/user/forgot-password',
      '/pages/user/reset-password',
    ];

    return !noHeaderRoutes.some((route) => url.startsWith(route));
  }
}
