import { Component, ViewChild } from '@angular/core';
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
import { TabsComponent } from "../../common/components/tabs/tabs.component";
import { EditReferencesComponent } from "../../relationships/components/edit-references/edit-references.component";

@Component({
  selector: 'app-edit-author',
  standalone: true,
  imports: [
    FieldValidationErrorsComponent,
    DialogWindowComponent,
    CommonModule,
    ReactiveFormsModule,
    TabsComponent,
    EditReferencesComponent
],
  templateUrl: './edit-author.component.html',
  styleUrl: './edit-author.component.css',
})
export class EditAuthorComponent {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;
  
  authorId = 0;
  showEdit = false;
  selectedTab: EditTabType = 'DETAIL';

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
    } else {
      this.authorsStore.addAuthor(formValue);
    }
    this.editReferences?.saveReferences();
    this.showEdit = false;
  }
}
