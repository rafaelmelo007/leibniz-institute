import { Component, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { CommonModule } from '@angular/common';
import { Link } from '../domain/link';
import { LinksStore } from '../services/links.store';
import { EditLinkComponent } from '../components/edit-link.component';

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
export class LinksPage {
  @ViewChild(EditLinkComponent) editLink?: EditLinkComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Link[];

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
    const links$ = this.linksStore.links$;
    links$.subscribe((links) => {
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

  loadMore(): void {
    this.linksStore.loadLinks(this.dataSource?.length ?? 0, 50);
  }

  addLink(): void {
    this.editLink?.editLink(0);
  }
}
