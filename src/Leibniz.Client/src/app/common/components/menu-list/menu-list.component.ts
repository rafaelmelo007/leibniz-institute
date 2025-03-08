import { Component, HostListener, input, Input } from '@angular/core';
import { MenuOption } from '../../domain/menu-option';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.css',
})
export class MenuListComponent {
  @Input() data: any;
  @Input() color: string = '';
  @Input() options: any[] | undefined = [];
  showDrop = false;
  clickedElement: any = null;

  showMenu(element: any) {
    if (this.clickedElement == element) {
      this.showDrop = false;
      this.clickedElement = null;
      return;
    }
    this.showDrop = true;
    this.clickedElement = element;
  }

  runAction(fn: any, data: any): void {
    this.showDrop = false;

    if (!fn) return;

    fn(data);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;

    if (targetElement != this.clickedElement) {
      this.showDrop = false;
      this.clickedElement = null;
    }
  }
}
