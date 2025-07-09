import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Book } from '../../domain/book';
import {
  Column,
  GridTableComponent,
} from '../../../common/components/grid-table/grid-table.component';
import { BooksStore } from '../../services/books.store';
import { LoadingComponent } from '../../../common/components/loading/loading.component';
import { CommonModule } from '@angular/common';
import { EditBookComponent } from '../../components/edit-book/edit-book.component';
import { BookListItem } from '../../domain/book-list-item';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ImagesStore } from '../../../images/services/images.store';
import { AuthService } from '../../../user/services/auth.service';
import { Router } from '@angular/router';
import { PageTitleComponent } from "../../../common/components/page-title/page-title.component";

@Component({
    selector: 'app-books',
    imports: [
        LoadingComponent,
        GridTableComponent,
        CommonModule,
        EditBookComponent,
        PageTitleComponent
    ],
    templateUrl: './books.component.html',
    styleUrl: './books.component.css'
})
export class BooksPage implements OnDestroy {
  @ViewChild(EditBookComponent) editBook?: EditBookComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: BookListItem[];
  queryStringToken?: string | null;
  private destroyed$ = new ReplaySubject<boolean>(1);

  maxImageWidth = 120;
  maxImageHeight = 140;

  columns: Column[] = [
    {
      field: 'imageFileName',
      header: '',
      width: '130px',
      textAlign: 'center',
      useImage: true,
      maxImageWidth: this.maxImageWidth,
      maxImageHeight: this.maxImageHeight,
    },
    {
      field: 'title',
      header: 'Title',
      width: '600px',
      useHyperlink: true,
      action: (data: Book) => {
        this.router.navigate(['/pages/books/' + data.bookId]);
      },
    },
    {
      field: 'author',
      header: 'Author',
      width: '180px',
    },
    {
      field: 'totalOfPages',
      header: 'TotalOfPages',
      width: '180px',
      textAlign: 'center',
    },
    {
      field: 'publisher',
      header: 'Publisher',
      width: '160px',
      textAlign: 'center',
    },
    {
      field: 'year',
      header: 'Year',
      width: '130px',
      textAlign: 'center',
    },
  ];

  actions = [
    {
      label: 'Edit Book',
      icon: 'fa fa-edit',
      action: (data: BookListItem) => {
        this.editBook?.editBook(data.bookId!);
      },
    },
    {
      label: 'Remove Book',
      icon: 'fa fa-remove',
      action: (data: BookListItem) => {
        if (
          !confirm(
            'You are about to delete this book. Do you want to continue?'
          )
        )
          return;
        this.booksStore.deleteBook(data.bookId!);
      },
    },
  ];

  count?: number;
  loading?: boolean;

  constructor(
    public booksStore: BooksStore,
    private imagesStore: ImagesStore,
    private authService: AuthService,
    private router: Router
  ) {
    this.subscribeBooks();
    this.subscribeBookChanges();
    this.subscribeImageChanges();
    this.queryStringToken = this.authService.getQueryStringToken();
  }

  subscribeBooks(): void {
    const loading$ = this.booksStore.loading$;
    loading$.pipe(takeUntil(this.destroyed$)).subscribe((loading) => {
      this.grid?.setLoading(loading);
    });

    const books$ = this.booksStore.books$;
    books$.pipe(takeUntil(this.destroyed$)).subscribe((books) => {
      this.loading = !books;

      if (!books || books.index == 0) {
        this.dataSource = [];
      }
      if (!books) {
        return;
      }
      if (!this.dataSource) {
        this.dataSource = [];
      }
      this.dataSource = [...this.dataSource!, ...books.data];
      this.count = books.count;
    });
  }

  subscribeBookChanges(): void {
    const changes$ = this.booksStore.changes$;
    changes$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      if (this.dataSource?.length == 0) return;

      this.dataSource = [];
      this.loadMore();
    });
  }

  subscribeImageChanges(): void {
    const imageExists$ = this.imagesStore.imageExists$;
    imageExists$.pipe(takeUntil(this.destroyed$)).subscribe((res) => {
      const exists = res.exists;

      this.dataSource?.forEach((book) => {
        if (res.ref?.type != 'book' || res.ref.id != book.bookId) return;
        if (!this.queryStringToken) return;

        if (exists && book.imageFileName) return;
        if (!exists && !book.imageFileName) return;

        book.imageFileName = exists
          ? this.imagesStore.getImageUrl(
              res.ref.type,
              res.ref.id,
              this.queryStringToken,
              this.maxImageWidth,
              this.maxImageHeight
            )
          : null;
      });
    });
  }

  loadMore(): void {
    this.booksStore.listBooks(this.dataSource?.length ?? 0, 25);
  }

  loadDeepSearch(query: string): void {
    this.dataSource = [];
    this.booksStore.query = query;
    this.booksStore.listBooks(this.dataSource?.length ?? 0, 25);
  }

  addBook(): void {
    this.editBook?.editBook(0);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
