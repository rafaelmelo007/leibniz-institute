import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-page-title',
    imports: [CommonModule],
    templateUrl: './page-title.component.html',
    styleUrl: './page-title.component.css'
})
export class PageTitleComponent {
  @Input() title: string | undefined;
  @Input() iconName: string | undefined;
  @Input() addButtonLabel: string | undefined;
  @Output() addClick = new EventEmitter();
}
