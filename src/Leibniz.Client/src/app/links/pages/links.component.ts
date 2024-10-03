import { Component, OnDestroy, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { CommonModule } from '@angular/common';
import { Link } from '../domain/link';
import { LinksStore } from '../services/links.store';
import { EditLinkComponent } from '../components/edit-link.component';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [
    LoadingComponent,
    GridTableComponent,
    CommonModule,
    EditLinkComponent,
  ],
  templateUrl: './links.component.html',
  styleUrl: './links.component.css',
})
export class LinksPage implements OnDestroy {
  @ViewChild(EditLinkComponent) editLink?: EditLinkComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Link[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  columns: Column[] = [
    {
      field: 'name',
      header: 'Name',
      width: '400px',
      useHyperlink: true,
      action: (data: Link) => {
        this.editLink?.editLink(data.linkId);
      },
    },
    {
      field: 'url',
      header: 'Url',
      width: '700px',
      useHyperlink: true,
      action: (data: Link) => {
        window.open(data.url, '_blank');
      },
    },
  ];

  actions = [
    {
      label: 'Edit Link',
      icon: 'fa fa-edit',
      action: (data: Link) => {
        this.editLink?.editLink(data.linkId);
      },
    },
    {
      label: 'Remove Link',
      icon: 'fa fa-remove',
      action: (data: Link) => {
        if (
          !confirm(
            'You are about to delete this link. Do you want to continue?'
          )
        )
          return;
        this.linksStore.deleteLink(data.linkId);
      },
    },
  ];

  count?: number;

  loading?: boolean;

  constructor(private linksStore: LinksStore) {
    this.subscribeLinks();
    this.subscribeLinkChanges();
  }

  subscribeLinks(): void {
    const loading$ = this.linksStore.loading$;
    loading$.pipe(takeUntil(this.destroyed$)).subscribe((loading) => {
      this.grid?.setLoading(loading);
    });

    const links$ = this.linksStore.links$;
    links$.pipe(takeUntil(this.destroyed$)).subscribe((links) => {
      this.loading = !links;

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

  subscribeLinkChanges(): void {
    const changes$ = this.linksStore.changes$;
    changes$.pipe(takeUntil(this.destroyed$)).subscribe((entry) => {
      if (entry?.changeType == 'deleted') {
        this.dataSource = this.dataSource?.filter((x) => x.linkId != entry.id);
        this.count = (this.count ?? 0) - 1;
      }
      if (entry?.changeType == 'added') {
        this.dataSource = [];
        this.loadMore();
      }
      if (entry?.changeType == 'updated') {
        this.dataSource = this.dataSource?.map((x) => {
          if (x.linkId == entry.data?.linkId) {
            x.name = entry.data.name;
            x.content = entry.data.content;
            x.url = entry.data.url;
          }
          return x;
        });
      }
    });
  }

  loadMore(): void {
    this.linksStore.loadLinks(this.dataSource?.length ?? 0, 50);
  }

  addLink(): void {
    this.editLink?.editLink(0);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
