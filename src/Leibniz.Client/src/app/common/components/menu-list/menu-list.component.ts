import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-list',
  imports: [CommonModule],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.css',
})
export class MenuListComponent {
  @Input() data: any; // eslint-disable-line
  @Input() color: string = '';
  @Input() options: any[] /* eslint-disable-line */ | undefined = [];
  showDrop = false;
  clickedElement: any = null; // eslint-disable-line

  showMenu(element: any /* eslint-disable-line */) {
    if (this.clickedElement == element) {
      this.showDrop = false;
      this.clickedElement = null;
      return;
    }
    this.showDrop = true;
    this.clickedElement = element;
  }

  runAction(
    fn: any /* eslint-disable-line */,
    data: any /* eslint-disable-line */
  ): void {
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
