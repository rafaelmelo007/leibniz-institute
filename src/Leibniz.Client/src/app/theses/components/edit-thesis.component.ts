import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FieldValidationErrorsComponent } from '../../common/components/field-validation-errors/field-validation-errors.component';
import { DialogWindowComponent } from '../../common/components/dialog-window/dialog-window.component';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Thesis } from '../domain/thesis';
import { ThesesStore } from '../services/theses.store';
import { EditTabType } from '../../relationships/components/domain/edit-tab-type';
import { MenuOption } from '../../common/domain/menu-option';
import { TabsComponent } from '../../common/components/tabs/tabs.component';
import { EditReferencesComponent } from '../../relationships/components/edit-references/edit-references.component';
import { EditImageComponent } from '../../images/components/edit-image/edit-image.component';
import { MoveToComponent } from '../../common/components/move-to/move-to.component';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-thesis',
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
  templateUrl: './edit-thesis.component.html',
  styleUrl: './edit-thesis.component.css',
})
export class EditThesisComponent implements OnDestroy {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;

  thesisId = 0;
  showEdit = false;
  selectedTab: EditTabType = 'DETAIL';
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  editForm = new FormGroup({
    thesisId: new FormControl(0, []),
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

  constructor(private thesesStore: ThesesStore) {}

  editThesis(thesisId: number): void {
    this.showEdit = true;
    this.thesisId = thesisId;

    if (thesisId == 0) {
      const thesis = {
        thesisId: 0,
        name: '',
        content: '',
      } as Thesis;
      this.tabs = this.tabs.filter(
        (x) => x.label !== 'Image' && x.label !== 'Move To'
      );
      this.editForm.patchValue(thesis);
      return;
    }

    this.thesesStore.getThesis(thesisId).subscribe((thesis) => {
      if (!thesis) return;
      this.editForm.patchValue(thesis);
    });
  }

  saveThesis(): void {
    this.editForm.markAllAsTouched();
    if (!this.editForm.valid) return;

    const formValue = this.editForm.value as Thesis;
    if (formValue.thesisId) {
      this.thesesStore.updateThesis(formValue);
      this.editReferences?.saveReferences();
      this.showEdit = false;
    } else {
      this.thesesStore.changes$
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res) => {
          if (res?.changeType !== 'added' || res.ref.type !== 'thesis') return;

          this.editReferences?.saveReferences(res?.ref.id);
          this.ngOnDestroy();
          this.showEdit = false;
        });
      this.thesesStore.addThesis(formValue);
    }
  }

  getFilteredTabs(): MenuOption[] {
    return this.thesisId == 0
      ? this.tabs.filter((x) => x.label !== 'Image' && x.label !== 'Move To')
      : this.tabs;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
