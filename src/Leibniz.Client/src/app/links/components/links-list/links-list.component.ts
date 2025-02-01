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
import { filter, ReplaySubject, takeUntil } from 'rxjs';
import { EntityType } from '../../../relationships/domain/entity-type';
import { LinksStore } from '../../services/links.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-links-list',
  standalone: true,
  imports: [EditLinkComponent],
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

  constructor(private linksStore: LinksStore, private router: Router) {
    this.linksStore.secondaryLinks$
      .pipe(
        filter((x) => x?.type == this.type && x?.id == this.id),
        takeUntil(this.destroyed$)
      )
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

  edit(linkId: number): void {
    this.editLink?.editLink(linkId);
  }

  navigate(linkId: number): void {
    this.router.navigate([`/pages/links/${linkId}`]);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
