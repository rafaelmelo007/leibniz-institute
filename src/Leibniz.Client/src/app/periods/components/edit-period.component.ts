import { Component, ViewChild } from '@angular/core';
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
import { EditImageComponent } from "../../images/components/edit-image/edit-image.component";
import { MoveToComponent } from "../../common/components/move-to/move-to.component";

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
    MoveToComponent
],
  templateUrl: './edit-period.component.html',
  styleUrl: './edit-period.component.css',
})
export class EditPeriodComponent {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;
  
  periodId = 0;
  showEdit = false;
  selectedTab: EditTabType = 'DETAIL';

  editForm = new FormGroup({
    periodId: new FormControl(0, []),
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
    } else {
      this.periodsStore.addPeriod(formValue);
    }
    this.editReferences?.saveReferences();
    this.showEdit = false;
  }
}
