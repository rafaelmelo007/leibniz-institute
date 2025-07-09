import { Component } from '@angular/core';
import { PageTitleComponent } from '../../../common/components/page-title/page-title.component';

@Component({
  selector: 'app-dashboard',
  imports: [PageTitleComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {}
