import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-expandable-text',
    imports: [CommonModule],
    templateUrl: './expandable-text.component.html',
    styleUrls: ['./expandable-text.component.css']
})
export class ExpandableTextComponent {
  @Input() text: string = '';
  @Input() maxLength: number = 300;
  expanded: boolean = false;

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  encodeValue(value: string): string {
    if (!value) return value;

    return value.replace(/\n/g, '<br />');
  }

  getText(): string {
    if (!this.text) return this.text;

    return this.expanded
      ? this.text
      : this.text.substring(0, this.maxLength) +
          (this.text.length > this.maxLength ? '...' : '');
  }
}
