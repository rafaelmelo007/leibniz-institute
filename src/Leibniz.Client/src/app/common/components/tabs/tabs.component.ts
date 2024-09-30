import { Component, Input, OnInit } from '@angular/core';
import { MenuOption } from '../../domain/menu-option';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
})
export class TabsComponent implements OnInit {
  @Input() options?: MenuOption[];
  selectedSection?: string | undefined;

  ngOnInit(): void {
    const opt = this.options?.find((x) => x.selected);
    this.selectedSection = opt?.label;
    if (opt !== undefined && opt.action !== undefined) {
      opt.action(opt);
    }
  }

  setSection(label: string): void {
    this.selectedSection = label;
  }
}
