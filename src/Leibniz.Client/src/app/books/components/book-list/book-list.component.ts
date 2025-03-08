import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { EditBookComponent } from '../edit-book/edit-book.component';
import { Book } from '../../domain/book';
import { filter, ReplaySubject, takeUntil } from 'rxjs';
import { EntityType } from '../../../relationships/domain/entity-type';
import { BooksStore } from '../../services/books.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [EditBookComponent],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css',
})
export class BookListComponent implements OnDestroy, OnInit, OnChanges {
  @ViewChild(EditBookComponent) editBook?: EditBookComponent;
  dataSource?: Book[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() type?: EntityType;
  @Input() id?: number;
  count?: number;
  loading = true;
  @Output() selectBook = new EventEmitter();

  constructor(private booksStore: BooksStore, private router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;
    this.booksStore.primaryBooks$
      .pipe(
        filter((x) => x?.type == this.type && x?.id == this.id),
        takeUntil(this.destroyed$)
      )
      .subscribe((books) => {
        if (!books || books.index == 0) {
          this.dataSource = [];
        }
        if (!books) {
          return;
        }
        this.dataSource = [...this.dataSource!, ...books.data];
        this.count = books.count;
        this.loading = false;
      });

    if (!this.type || !this.id) return;

    this.booksStore.loadBooks(
      this.dataSource?.length ?? 0,
      30,
      this.type,
      this.id,
      true
    );
  }

  edit(bookId: number): void {
    this.editBook?.editBook(bookId);
  }

  navigate(bookId: number): void {
    this.router.navigate([`/pages/books/${bookId}`]);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
