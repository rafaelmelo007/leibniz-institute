import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog-window',
  standalone: true,
  imports: [],
  templateUrl: './dialog-window.component.html',
  styleUrl: './dialog-window.component.css',
})
export class DialogWindowComponent {
  @Input() title?: string;
  @Input() primaryButtonLabel?: string;
  @Input() height = 0;
  @Input() width = 0;
  @Output() submitDialog = new EventEmitter();
  @Output() closeDialog = new EventEmitter();

  executeAction(): void {
    this.submitDialog?.emit(true);
  }

  closeWindow(): void {
    this.closeDialog?.emit(true);
  }
}
