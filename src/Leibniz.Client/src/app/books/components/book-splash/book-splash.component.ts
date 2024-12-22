import { Component, Input, input, OnInit, ViewChild } from '@angular/core';
import { BooksStore } from '../../services/books.store';
import { Book } from '../../domain/book';
import { CommonModule } from '@angular/common';
import { ImageBoxComponent } from '../../../common/components/image-box/image-box.component';
import { NewlineToBrPipe } from '../../../common/pipes/newline-to-br.pipe';
import { EditBookComponent } from '../edit-book/edit-book.component';
import { DropdownComponent } from '../../../common/components/dropdown/dropdown.component';
import { MenuOption } from '../../../common/domain/menu-option';
import { EditPostComponent } from '../../../posts/components/edit-post/edit-post.component';
import { AddBatchPostsComponent } from '../../../posts/components/add-batch-posts/add-batch-posts.component';

@Component({
  selector: 'app-book-splash',
  standalone: true,
  imports: [
    CommonModule,
    ImageBoxComponent,
    NewlineToBrPipe,
    EditBookComponent,
    DropdownComponent,
    EditPostComponent,
    AddBatchPostsComponent,
  ],
  templateUrl: './book-splash.component.html',
  styleUrl: './book-splash.component.css',
})
export class BookSplashComponent implements OnInit {
  @ViewChild(EditBookComponent) editBook?: EditBookComponent;
  @ViewChild(EditPostComponent) editPost?: EditPostComponent;
  @ViewChild(AddBatchPostsComponent) addBatchPosts?: AddBatchPostsComponent;
  @Input() bookId: number = 0;
  book?: Book | null;
  menuList?: MenuOption[] = [
    {
      label: 'Add Single Post',
      icon: 'fa fa-comment',
      action: () => {
        this.editPost?.editPost(0, 'book', this.bookId);
      },
    },
    {
      label: 'Add Many Posts',
      icon: 'fa fa-comments',
      action: () => {
        this.addBatchPosts?.show('book', this.bookId);
      },
    },
  ];

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
