import { Component, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { CommonModule } from '@angular/common';
import { Author } from '../domain/author';
import { AuthorsStore } from '../services/authors.store';
import { EditAuthorComponent } from '../components/edit-author.component';
import { tap } from 'rxjs';

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [
    LoadingComponent,
    GridTableComponent,
    CommonModule,
    EditAuthorComponent,
  ],
  templateUrl: './authors.component.html',
  styleUrl: './authors.component.css',
})
export class AuthorsPage {
  @ViewChild(EditAuthorComponent) editAuthor?: EditAuthorComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Author[];

  columns: Column[] = [
    {
      field: 'name',
      header: 'Name',
      width: '600px',
      useHyperlink: true,
      action: (data: Author) => {
        this.editAuthor?.editAuthor(data.authorId);
      },
    },
  ];

  actions = [
    {
      label: 'Edit Author',
      icon: 'fa fa-edit',
      action: (data: Author) => {
        this.editAuthor?.editAuthor(data.authorId);
      },
    },
    {
      label: 'Remove Author',
      icon: 'fa fa-remove',
      action: (data: Author) => {
        if (
          !confirm(
            'You are about to delete this author. Do you want to continue?'
          )
        )
          return;
        this.authorsStore.deleteAuthor(data.authorId);
      },
    },
  ];

  count?: number;

  loading?: boolean;

  constructor(private authorsStore: AuthorsStore) {
    this.authorsStore.authors$
      .pipe(
        tap((authors) => {
          this.loading = !authors;
          if (authors) {
            this.dataSource = [...(this.dataSource || []), ...authors.data];
            this.count = authors.count;
          }
        })
      )
      .subscribe();
  }

  loadMore(): void {
    this.authorsStore.loadAuthors(this.dataSource?.length ?? 0, 25);
  }

  addAuthor(): void {
    this.editAuthor?.editAuthor(0);
  }
}
