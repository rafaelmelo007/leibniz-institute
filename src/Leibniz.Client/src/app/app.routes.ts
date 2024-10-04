import { Routes } from '@angular/router';
import { LoginPage } from './account/pages/login/login.component';
import { RegisterPage } from './account/pages/register/register.component';
import { ForgotPasswordPage } from './account/pages/forgot-password/forgot-password.component';
import { PostsPage } from './posts/pages/posts.component';
import { BooksPage } from './books/pages/books.component';
import { AuthorsPage } from './authors/pages/authors.component';
import { TopicsPage } from './topics/pages/topics.component';
import { ThesesPage } from './theses/pages/theses.component';
import { PeriodsPage } from './periods/pages/periods.component';
import { AreasPage } from './areas/pages/areas.component';
import { LinksPage } from './links/pages/links.component';
import { ResetPasswordPage } from './account/pages/reset-password/reset-password.component';

export const routes: Routes = [
  /* Feature: Account */
  { path: 'pages/account/login', component: LoginPage },
  { path: 'pages/account/register', component: RegisterPage },
  { path: 'pages/account/forgot-password', component: ForgotPasswordPage },
  { path: 'pages/account/reset-password', component: ResetPasswordPage },

  /* Feature: Posts */
  { path: 'pages/posts', component: PostsPage },

  /* Feature: Books */
  { path: 'pages/books', component: BooksPage },

  /* Feature: Authors */
  { path: 'pages/authors', component: AuthorsPage },

  /* Feature: Topics */
  { path: 'pages/topics', component: TopicsPage },

  /* Feature: Theses */
  { path: 'pages/theses', component: ThesesPage },

  /* Feature: Periods */
  { path: 'pages/periods', component: PeriodsPage },

  /* Feature: Areas */
  { path: 'pages/areas', component: AreasPage },

  /* Feature: Links */
  { path: 'pages/links', component: LinksPage },

  { path: '**', redirectTo: '/pages/posts' },
];
