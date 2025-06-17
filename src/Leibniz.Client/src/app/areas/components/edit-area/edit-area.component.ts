import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Area } from '../../domain/area';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AreasStore } from '../../services/areas.store';
import { DialogWindowComponent } from '../../../common/components/dialog-window/dialog-window.component';
import { FieldValidationErrorsComponent } from '../../../common/components/field-validation-errors/field-validation-errors.component';
import { CommonModule } from '@angular/common';
import { TabsComponent } from '../../../common/components/tabs/tabs.component';
import { MenuOption } from '../../../common/domain/menu-option';
import { EditReferencesComponent } from '../../../relationships/components/edit-references/edit-references.component';
import { EditTabType } from '../../../relationships/domain/edit-tab-type';
import { EditImageComponent } from '../../../images/components/edit-image/edit-image.component';
import { MoveToComponent } from '../../../shared/components/move-to/move-to.component';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-area',
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
  templateUrl: './edit-area.component.html',
  styleUrl: './edit-area.component.css',
})
export class EditAreaComponent implements OnDestroy {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;

  areaId = 0;
  showEdit = false;
  selectedTab: EditTabType = 'DETAIL';
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  editForm = new FormGroup({
    areaId: new FormControl(0, []),
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
      selected: false,
      action: () => {
        this.selectedTab = 'REFERENCES';
      },
    },
    {
      label: 'Image',
      icon: 'fa fa-image',
      selected: false,
      action: () => {
        this.selectedTab = 'IMAGE';
      },
    },
    {
      label: 'Move To',
      icon: 'fa fa-arrows',
      selected: false,
      action: () => {
        this.selectedTab = 'MOVE_TO';
      },
    },
  ];

  constructor(private areasStore: AreasStore) {}

  editArea(areaId: number): void {
    this.showEdit = true;

    this.areaId = areaId;

    if (areaId == 0) {
      const area = {
        areaId: 0,
        name: '',
        content: '',
      } as Area;
      this.editForm.patchValue(area);
      return;
    }

    this.areasStore.getArea(areaId).subscribe((area) => {
      if (!area) return;
      this.editForm.patchValue(area);
    });
  }

  saveArea(): void {
    this.editForm.markAllAsTouched();
    if (!this.editForm.valid) return;

    const formValue = this.editForm.value as Area;
    if (formValue.areaId) {
      this.areasStore.updateArea(formValue);
      this.editReferences?.saveReferences();
      this.showEdit = false;
    } else {
      this.areasStore.changes$
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res) => {
          if (res?.changeType !== 'added' || res.ref.type !== 'area') return;

          this.editReferences?.saveReferences(res?.ref.id);
          this.ngOnDestroy();
          this.showEdit = false;
        });
      this.areasStore.addArea(formValue);
    }
  }

  getFilteredTabs(): MenuOption[] {
    return this.areaId == 0
      ? this.tabs.filter((x) => x.label !== 'Image' && x.label !== 'Move To')
      : this.tabs;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
