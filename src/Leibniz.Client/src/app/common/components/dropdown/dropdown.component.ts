import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, input } from '@angular/core';
import { MenuOption } from '../../domain/menu-option';

@Component({
  selector: 'app-dropdown',
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
})
export class DropdownComponent {
  label = input<string>();
  @Input() data: any; // eslint-disable-line
  @Input() color = '';
  options = input<MenuOption[]>();
  showDrop = false;

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

    if (targetElement && !targetElement.closest('.dropdown-container')) {
      this.showDrop = false;
    }
  }
}
