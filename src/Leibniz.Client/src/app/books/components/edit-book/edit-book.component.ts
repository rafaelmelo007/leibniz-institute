import { Component, OnDestroy, ViewChild } from '@angular/core';
import { DialogWindowComponent } from '../../../common/components/dialog-window/dialog-window.component';
import { CommonModule } from '@angular/common';
import { FieldValidationErrorsComponent } from '../../../common/components/field-validation-errors/field-validation-errors.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Book } from '../../domain/book';
import { BooksStore } from '../../services/books.store';
import { EditTabType } from '../../../relationships/domain/edit-tab-type';
import { MenuOption } from '../../../common/domain/menu-option';
import { TabsComponent } from '../../../common/components/tabs/tabs.component';
import { EditReferencesComponent } from '../../../relationships/components/edit-references/edit-references.component';
import { EditImageComponent } from '../../../images/components/edit-image/edit-image.component';
import { MoveToComponent } from '../../../shared/components/move-to/move-to.component';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-book',
  imports: [
    DialogWindowComponent,
    CommonModule,
    ReactiveFormsModule,
    FieldValidationErrorsComponent,
    TabsComponent,
    EditReferencesComponent,
    EditImageComponent,
    MoveToComponent,
  ],
  templateUrl: './edit-book.component.html',
  styleUrl: './edit-book.component.css',
})
export class EditBookComponent implements OnDestroy {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;

  bookId = 0;
  showEdit = false;
  selectedTab: EditTabType = 'DETAIL';
  private destroyed$ = new ReplaySubject<boolean>(1);

  editForm = new FormGroup({
    bookId: new FormControl(0, []),
    title: new FormControl('', [Validators.required]),
    author: new FormControl('', [Validators.required]),
    year: new FormControl(0, []),
    publisher: new FormControl('', []),
    edition: new FormControl(0, []),
    local: new FormControl('', []),
    content: new FormControl('', []),
    totalOfPages: new FormControl(0, []),
    translator: new FormControl('', []),
    isbn: new FormControl('', []),
    price: new FormControl(0, []),
    purchasedDate: new FormControl(new Date(), []),
    sizeX: new FormControl(0, []),
    sizeY: new FormControl(0, []),
    sizeZ: new FormControl(0, []),
  });

  tabs: MenuOption[] = [
    {
      label: 'Details',
      icon: 'fa fa-window-maximize',
      selected: true,
      action: () => {
        this.selectedTab = 'DETAIL';
      },
    },
    {
      label: 'References',
      icon: 'fa fa-link',
      selected: true,
      action: () => {
        this.selectedTab = 'REFERENCES';
      },
    },
    {
      label: 'Image',
      icon: 'fa fa-image',
      selected: true,
      action: () => {
        this.selectedTab = 'IMAGE';
      },
    },
    {
      label: 'Move To',
      icon: 'fa fa-arrows',
      selected: true,
      action: () => {
        this.selectedTab = 'MOVE_TO';
      },
    },
  ];

  constructor(private booksStore: BooksStore) {}

  editBook(bookId: number): void {
    this.showEdit = true;

    this.bookId = bookId;

    if (bookId == 0) {
      const book = {
        bookId: 0,
        title: '',
        author: '',
        content: '',
        year: 0,
        publisher: '',
        edition: 0,
        local: '',
        totalOfPages: 0,
        translator: '',
        isbn: '',
        price: 0,
        purchasedDate: null,
        sizeX: null,
        sizeY: null,
        sizeZ: null,
      } as Book;
      this.tabs = this.tabs.filter(
        (x) => x.label !== 'Image' && x.label !== 'Move To'
      );
      this.editForm.patchValue(book);
      return;
    }

    this.booksStore.getBook(bookId).subscribe((book) => {
      if (!book) return;
      this.editForm.patchValue(book);
    });
  }

  saveBook(): void {
    this.editForm.markAllAsTouched();
    if (!this.editForm.valid) return;

    const formValue = this.editForm.value as Book;
    if (formValue.bookId) {
      this.booksStore.updateBook(formValue);
      this.editReferences?.saveReferences();
      this.showEdit = false;
    } else {
      this.booksStore.changes$
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res) => {
          if (res?.changeType !== 'added' || res.ref.type !== 'book') return;

          this.editReferences?.saveReferences(res?.ref.id);
          this.ngOnDestroy();
          this.showEdit = false;
        });
      this.booksStore.addBook(formValue);
    }
  }

  getFilteredTabs(): MenuOption[] {
    return this.bookId == 0
      ? this.tabs.filter((x) => x.label !== 'Image' && x.label !== 'Move To')
      : this.tabs;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
