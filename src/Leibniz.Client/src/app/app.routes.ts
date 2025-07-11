import { Routes } from '@angular/router';
import { LoginPage } from './user/pages/login/login.component';
import { RegisterPage } from './user/pages/register/register.component';
import { ForgotPasswordPage } from './user/pages/forgot-password/forgot-password.component';
import { PostsPage } from './posts/pages/posts.component';
import { BooksPage } from './books/pages/books/books.component';
import { AuthorsPage } from './authors/pages/authors.component';
import { TopicsPage } from './topics/pages/topics.component';
import { ThesesPage } from './theses/pages/theses.component';
import { PeriodsPage } from './periods/pages/periods.component';
import { AreasPage } from './areas/pages/areas.component';
import { LinksPage } from './links/pages/links.component';
import { ResetPasswordPage } from './user/pages/reset-password/reset-password.component';
import { BookDetailPage } from './books/pages/book-detail/book-detail.component';
import { AuthorDetailPage } from './authors/pages/author-detail/author-detail.component';
import { TopicDetailPage } from './topics/pages/topic-detail/topic-detail.component';
import { ThesisDetailPage } from './theses/pages/thesis-detail/thesis-detail.component';
import { DashboardComponent } from './dashboard/pages/dashboard/dashboard.component';
import { TimesheetComponent } from './timesheet/pages/timesheet/timesheet.component';
import { ChartsComponent } from './charts/pages/charts/charts.component';
import { NodesComponent } from './nodes/pages/nodes/nodes.component';

export const routes: Routes = [
  /* Feature: User */
  { path: 'pages/user/login', component: LoginPage },
  { path: 'pages/user/register', component: RegisterPage },
  { path: 'pages/user/forgot-password', component: ForgotPasswordPage },
  { path: 'pages/user/reset-password', component: ResetPasswordPage },

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

  /* Feature: Charts */
  { path: 'pages/charts', component: ChartsComponent },

  /* Feature: Timesheet */
  { path: 'pages/timesheet', component: TimesheetComponent },

  /* Feature: Nodes */
  { path: 'pages/nodes', component: NodesComponent },

  { path: '**', redirectTo: '/pages/user/login' },
];
