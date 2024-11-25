import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { EditLinkComponent } from '../edit-link/edit-link.component';
import { Link } from '../../domain/link';
import { ReplaySubject, takeUntil } from 'rxjs';
import { EntityType } from '../../../relationships/domain/entity-type';
import { LinksStore } from '../../services/links.store';

@Component({
  selector: 'app-links-list',
  standalone: true,
  imports: [],
  templateUrl: './links-list.component.html',
  styleUrl: './links-list.component.css',
})
export class LinksListComponent implements OnDestroy, AfterViewInit {
  @ViewChild(EditLinkComponent) editLink?: EditLinkComponent;
  dataSource?: Link[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() type?: EntityType;
  @Input() id?: number;
  count?: number;
  @Output() selectLink = new EventEmitter();

  constructor(private linksStore: LinksStore) {
    this.linksStore.secondaryLinks$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((links) => {
        if (!links || links.index == 0) {
          this.dataSource = [];
        }
        if (!links) {
          return;
        }
        this.dataSource = [...this.dataSource!, ...links.data];
        this.count = links.count;
      });
  }

  ngAfterViewInit(): void {
    if (!this.type || !this.id) return;

    this.linksStore.loadLinks(
      this.dataSource?.length ?? 0,
      10,
      this.type,
      this.id,
      false
    );
  }

  openLink(linkId: number): void {
    this.linksStore.getLink(linkId).subscribe((link) => {
      window.open(link?.url, '_blank');
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}