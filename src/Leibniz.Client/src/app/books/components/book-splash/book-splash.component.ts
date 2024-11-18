import { Component, Input, input, OnInit, ViewChild } from '@angular/core';
import { BooksStore } from '../../services/books.store';
import { Book } from '../../domain/book';
import { CommonModule } from '@angular/common';
import { ImageBoxComponent } from '../../../common/components/image-box/image-box.component';
import { NewlineToBrPipe } from '../../../common/pipes/newline-to-br.pipe';
import { EditBookComponent } from '../edit-book/edit-book.component';

@Component({
  selector: 'app-book-splash',
  standalone: true,
  imports: [
    CommonModule,
    ImageBoxComponent,
    NewlineToBrPipe,
    EditBookComponent,
  ],
  templateUrl: './book-splash.component.html',
  styleUrl: './book-splash.component.css',
})
export class BookSplashComponent implements OnInit {
  @ViewChild(EditBookComponent) editBook?: EditBookComponent;
  @Input() bookId: number = 0;
  book?: Book | null;

  constructor(private booksStore: BooksStore) {}

  ngOnInit(): void {
    this.booksStore.getBook(this.bookId).subscribe((book) => {
      this.book = book;
    });
  }

  edit(): void {
    this.editBook?.editBook(this.bookId);
  }
}
