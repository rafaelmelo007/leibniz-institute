import { Routes } from '@angular/router';
import { LoginPage } from './account/pages/login/login.component';
import { RegisterPage } from './account/pages/register/register.component';
import { ForgotPasswordPage } from './account/pages/forgot-password/forgot-password.component';
import { PostsPage } from './posts/pages/posts.component';
import { BooksPage } from './books/pages/books/books.component';
import { AuthorsPage } from './authors/pages/authors.component';
import { TopicsPage } from './topics/pages/topics.component';
import { ThesesPage } from './theses/pages/theses.component';
import { PeriodsPage } from './periods/pages/periods.component';
import { AreasPage } from './areas/pages/areas.component';
import { LinksPage } from './links/pages/links.component';
import { ResetPasswordPage } from './account/pages/reset-password/reset-password.component';
import { BookDetailPage } from './books/pages/book-detail/book-detail.component';
import { AuthorDetailPage } from './authors/pages/author-detail/author-detail.component';
import { TopicDetailPage } from './topics/pages/topic-detail/topic-detail.component';
import { ThesisDetailPage } from './theses/pages/thesis-detail/thesis-detail.component';
import { DashboardComponent } from './dashboard/pages/dashboard/dashboard.component';
import { TimesheetComponent } from './timesheet/pages/timesheet/timesheet.component';

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
  { path: 'pages/books/:id', component: BookDetailPage },

  /* Feature: Authors */
  { path: 'pages/authors', component: AuthorsPage },
  { path: 'pages/authors/:id', component: AuthorDetailPage },

  /* Feature: Topics */
  { path: 'pages/topics', component: TopicsPage },
  { path: 'pages/topics/:id', component: TopicDetailPage },

  /* Feature: Theses */
  { path: 'pages/theses', component: ThesesPage },
  { path: 'pages/theses/:id', component: ThesisDetailPage },

  /* Feature: Periods */
  { path: 'pages/periods', component: PeriodsPage },

  /* Feature: Areas */
  { path: 'pages/areas', component: AreasPage },

  /* Feature: Links */
  { path: 'pages/links', component: LinksPage },

  /* Feature: Dashboard */
  { path: 'pages/dashboard', component: DashboardComponent },

  /* Feature: Timesheet */
  { path: 'pages/timesheet', component: TimesheetComponent },

  { path: '**', redirectTo: '/pages/account/login' },
];
