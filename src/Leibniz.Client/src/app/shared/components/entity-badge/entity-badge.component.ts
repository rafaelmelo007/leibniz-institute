import { Component, input, OnInit } from '@angular/core';
import { EntityType } from '../../../relationships/domain/entity-type';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-entity-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entity-badge.component.html',
  styleUrl: './entity-badge.component.css',
})
export class EntityBadgeComponent implements OnInit {
  type = input<EntityType>();
  id = input<number>();
  name = input<string>();

  iconClass?: string;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const type = this.type()!;
    switch (type) {
      case 'post':
        this.iconClass = 'fa fa-comment';
        break;
      case 'book':
        this.iconClass = 'fa fa-book';
        break;
      case 'author':
        this.iconClass = 'fa fa-users';
        break;
      case 'topic':
        this.iconClass = 'fa fa-tags';
        break;
      case 'period':
        this.iconClass = 'fa fa-clock-o';
        break;
      case 'area':
        this.iconClass = 'fa fa-map-o';
        break;
      case 'thesis':
        this.iconClass = 'fa fa-graduation-cap';
        break;
      case 'link':
        this.iconClass = 'fa fa-link';
        break;
      default:
        this.iconClass = 'fa fa-plus';
    }
  }

  goTo(): void {
    const type = this.type()!;
    switch (type) {
      case 'post':
        this.router.navigate(['/pages/posts/' + this.id()]);
        break;
      case 'book':
        this.router.navigate(['/pages/books/' + this.id()]);
        break;
      case 'author':
        this.router.navigate(['/pages/authors/' + this.id()]);
        break;
      case 'topic':
        this.router.navigate(['/pages/topics/' + this.id()]);
        break;
      case 'period':
        this.router.navigate(['/pages/periods/' + this.id()]);
        break;
      case 'area':
        this.router.navigate(['/pages/areas/' + this.id()]);
        break;
      case 'thesis':
        this.router.navigate(['/pages/theses/' + this.id()]);
        break;
      case 'link':
        this.router.navigate(['/pages/links/' + this.id()]);
        break;
    }
  }
}
