import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Period } from '../domain/period';
import { PeriodsStore } from '../services/periods.store';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DialogWindowComponent } from '../../common/components/dialog-window/dialog-window.component';
import { FieldValidationErrorsComponent } from '../../common/components/field-validation-errors/field-validation-errors.component';
import { CommonModule } from '@angular/common';
import { TabsComponent } from '../../common/components/tabs/tabs.component';
import { EditTabType } from '../../relationships/components/domain/edit-tab-type';
import { MenuOption } from '../../common/domain/menu-option';
import { EditReferencesComponent } from '../../relationships/components/edit-references/edit-references.component';
import { EditImageComponent } from '../../images/components/edit-image/edit-image.component';
import { MoveToComponent } from '../../common/components/move-to/move-to.component';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-period',
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
  templateUrl: './edit-period.component.html',
  styleUrl: './edit-period.component.css',
})
export class EditPeriodComponent implements OnDestroy {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;

  periodId = 0;
  showEdit = false;
  selectedTab: EditTabType = 'DETAIL';
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  editForm = new FormGroup({
    periodId: new FormControl(0, []),
    name: new FormControl('', [Validators.required]),
    content: new FormControl('', []),
    beginYear: new FormControl(0, []),
    beginMonth: new FormControl(0, []),
    beginDay: new FormControl(0, []),
    endYear: new FormControl(0, []),
    endMonth: new FormControl(0, []),
    endDay: new FormControl(0, []),
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

  constructor(private periodsStore: PeriodsStore) {}

  editPeriod(periodId: number): void {
    this.showEdit = true;
    this.periodId = periodId;

    if (periodId == 0) {
      const period = {
        periodId: 0,
        name: '',
        url: '',
        content: '',
      } as Period;
      this.tabs = this.tabs.filter(
        (x) => x.label !== 'Image' && x.label !== 'Move To'
      );
      this.editForm.patchValue(period);
      return;
    }

    this.periodsStore.getPeriod(periodId).subscribe((period) => {
      if (!period) return;
      this.editForm.patchValue(period);
    });
  }

  savePeriod(): void {
    this.editForm.markAllAsTouched();
    if (!this.editForm.valid) return;

    const formValue = this.editForm.value as Period;
    if (formValue.periodId) {
      this.periodsStore.updatePeriod(formValue);
      this.editReferences?.saveReferences();
      this.showEdit = false;
    } else {
      this.periodsStore.changes$
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res) => {
          if (res?.changeType !== 'added' || res.ref.type !== 'period') return;

          this.editReferences?.saveReferences(res?.ref.id);
          this.ngOnDestroy();
          this.showEdit = false;
        });
      this.periodsStore.addPeriod(formValue);
    }
  }

  getFilteredTabs(): MenuOption[] {
    return this.periodId == 0
      ? this.tabs.filter((x) => x.label !== 'Image' && x.label !== 'Move To')
      : this.tabs;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
