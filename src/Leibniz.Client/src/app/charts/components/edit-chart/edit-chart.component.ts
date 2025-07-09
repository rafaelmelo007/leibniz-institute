import { Component, OnDestroy, ViewChild } from '@angular/core';
import { EditReferencesComponent } from '../../../relationships/components/edit-references/edit-references.component';
import { EditTabType } from '../../../relationships/domain/edit-tab-type';
import { ReplaySubject, takeUntil } from 'rxjs';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MenuOption } from '../../../common/domain/menu-option';
import { ChartsStore } from '../../services/charts.store';
import { Chart } from '../../domain/chart';
import { DialogWindowComponent } from '../../../common/components/dialog-window/dialog-window.component';
import { TabsComponent } from '../../../common/components/tabs/tabs.component';
import { CommonModule } from '@angular/common';
import { FieldValidationErrorsComponent } from '../../../common/components/field-validation-errors/field-validation-errors.component';
import { MoveToComponent } from '../../../shared/components/move-to/move-to.component';
import { NetworkComponent } from '../../../network/components/network/network.component';

@Component({
  selector: 'app-edit-chart',
  imports: [
    FormsModule,
    DialogWindowComponent,
    CommonModule,
    ReactiveFormsModule,
    TabsComponent,
    FieldValidationErrorsComponent,
    EditReferencesComponent,
    MoveToComponent,
    NetworkComponent,
  ],
  templateUrl: './edit-chart.component.html',
  styleUrl: './edit-chart.component.css',
})
export class EditChartComponent implements OnDestroy {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;

  graphJson = {
    nodes: [
      {
        id: 1,
        label: 'New Element',
        x: 6,
        y: 6,
        fixed: {
          x: false,
          y: false,
        },
      },
    ],
    edges: [],
  };

  chartId = 0;
  showEdit = false;
  selectedTab: EditTabType = 'DETAIL';
  private destroyed$ = new ReplaySubject<boolean>(1);

  editForm = new FormGroup({
    chartId: new FormControl(0, []),
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
      label: 'Move To',
      icon: 'fa fa-arrows',
      selected: true,
      action: () => {
        this.selectedTab = 'MOVE_TO';
      },
    },
  ];

  constructor(private chartsStore: ChartsStore) {}

  editChart(chartId: number): void {
    this.showEdit = true;
    this.chartId = chartId;

    if (chartId == 0) {
      const chart = {
        chartId: 0,
        name: '',
        content:
          '{ "nodes": [ { "id": 1, "label": "New Element" } ], "edges": [] }',
      } as Chart;
      this.tabs = this.tabs.filter(
        (x) => x.label !== 'Image' && x.label !== 'Move To'
      );
      this.editForm.patchValue(chart);
    }

    this.chartsStore.getChart(chartId).subscribe((chart) => {
      if (!chart) return;
      this.editForm.patchValue(chart);
    });
  }

  saveChart(): void {
    this.editForm.markAllAsTouched();
    if (!this.editForm.valid) return;

    const formValue = this.editForm.value as Chart;
    if (formValue.chartId) {
      this.chartsStore.updateChart(formValue);
      this.editReferences?.saveReferences();
      this.showEdit = false;
    } else {
      this.chartsStore.changes$
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res) => {
          if (res?.changeType !== 'added' || res.ref.type !== 'chart') return;

          this.editReferences?.saveReferences(res?.ref.id);
          this.ngOnDestroy();
          this.showEdit = false;
        });
      this.chartsStore.addChart(formValue);
    }
  }

  getFilteredTabs(): MenuOption[] {
    return this.chartId == 0
      ? this.tabs.filter((x) => x.label !== 'Image' && x.label !== 'Move To')
      : this.tabs;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
