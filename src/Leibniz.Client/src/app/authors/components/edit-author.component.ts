import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Author } from '../domain/author';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthorsStore } from '../services/authors.store';
import { FieldValidationErrorsComponent } from '../../common/components/field-validation-errors/field-validation-errors.component';
import { DialogWindowComponent } from '../../common/components/dialog-window/dialog-window.component';
import { CommonModule } from '@angular/common';
import { MenuOption } from '../../common/domain/menu-option';
import { EditTabType } from '../../relationships/components/domain/edit-tab-type';
import { TabsComponent } from '../../common/components/tabs/tabs.component';
import { EditReferencesComponent } from '../../relationships/components/edit-references/edit-references.component';
import { EditImageComponent } from '../../images/components/edit-image/edit-image.component';
import { MoveToComponent } from '../../common/components/move-to/move-to.component';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-author',
  standalone: true,
  imports: [
    FieldValidationErrorsComponent,
    DialogWindowComponent,
    CommonModule,
    ReactiveFormsModule,
    TabsComponent,
    EditReferencesComponent,
    EditImageComponent,
    MoveToComponent,
  ],
  templateUrl: './edit-author.component.html',
  styleUrl: './edit-author.component.css',
})
export class EditAuthorComponent implements OnDestroy {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;

  authorId = 0;
  showEdit = false;
  selectedTab: EditTabType = 'DETAIL';
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  editForm = new FormGroup({
    authorId: new FormControl(0, []),
    name: new FormControl('', [Validators.required]),
    content: new FormControl('', []),
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

  constructor(private authorsStore: AuthorsStore) {}

  editAuthor(authorId: number): void {
    this.showEdit = true;

    this.authorId = authorId;

    if (authorId == 0) {
      const area = {
        authorId: 0,
        name: '',
        content: '',
      } as Author;
      this.editForm.patchValue(area);
      return;
    }

    this.authorsStore.getAuthor(authorId).subscribe((author) => {
      if (!author) return;
      this.editForm.patchValue(author);
    });
  }

  saveAuthor(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const formValue = this.editForm.value as Author;
    if (formValue.authorId) {
      this.authorsStore.updateAuthor(formValue);
      this.editReferences?.saveReferences();
      this.showEdit = false;
    } else {
      this.authorsStore.changes$
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res) => {
          if (res?.changeType !== 'added' || res.ref.type !== 'author') return;

          this.editReferences?.saveReferences(res?.ref.id);
          this.ngOnDestroy();
          this.showEdit = false;
        });
      this.authorsStore.addAuthor(formValue);
    }
  }

  getFilteredTabs(): MenuOption[] {
    return this.authorId == 0
      ? this.tabs.filter((x) => x.label !== 'Image' && x.label !== 'Move To')
      : this.tabs;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
