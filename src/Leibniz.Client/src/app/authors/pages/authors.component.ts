import { Component, OnDestroy, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { CommonModule } from '@angular/common';
import { Author } from '../domain/author';
import { AuthorsStore } from '../services/authors.store';
import { EditAuthorComponent } from '../components/edit-author.component';
import { ReplaySubject, takeUntil } from 'rxjs';

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
export class AuthorsPage implements OnDestroy {
  @ViewChild(EditAuthorComponent) editAuthor?: EditAuthorComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Author[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

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
    this.subscribeAuthors();
    this.subscribeAuthorChanges();
  }

  subscribeAuthors(): void {
    const loading$ = this.authorsStore.loading$;
    loading$.pipe(takeUntil(this.destroyed$)).subscribe((loading) => {
      this.grid?.setLoading(loading);
    });

    const authors$ = this.authorsStore.authors$;
    authors$.pipe(takeUntil(this.destroyed$)).subscribe((authors) => {
      if (!authors || authors.index == 0) {
        this.dataSource = [];
      }
      if (!authors) {
        return;
      }
      this.dataSource = [...this.dataSource!, ...authors.data];
      this.count = authors.count;
    });
  }

  subscribeAuthorChanges(): void {
    const changes$ = this.authorsStore.changes$;
    changes$.pipe(takeUntil(this.destroyed$)).subscribe((entry) => {
      if (entry?.changeType == 'deleted') {
        this.dataSource = this.dataSource?.filter(
          (x) => x.authorId != entry.id
        );
        this.count = (this.count ?? 0) - 1;
      }
      if (entry?.changeType == 'added') {
        this.dataSource = [];
        this.loadMore();
      }
      if (entry?.changeType == 'updated') {
        this.dataSource = this.dataSource?.map((x) => {
          if (x.authorId == entry.data?.authorId) {
            x.name = entry.data.name;
            x.content = entry.data.content;
          }
          return x;
        });
      }
    });
  }

  loadMore(): void {
    this.authorsStore.loadAuthors(this.dataSource?.length ?? 0, 25);
  }

  addAuthor(): void {
    this.editAuthor?.editAuthor(0);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
