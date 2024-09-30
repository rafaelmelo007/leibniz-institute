import { Component, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { CommonModule } from '@angular/common';
import { Period } from '../domain/period';
import { PeriodsStore } from '../services/periods.store';
import { EditPeriodComponent } from '../components/edit-period.component';

@Component({
  selector: 'app-periods',
  standalone: true,
  imports: [
    LoadingComponent,
    GridTableComponent,
    CommonModule,
    EditPeriodComponent,
  ],
  templateUrl: './periods.component.html',
  styleUrl: './periods.component.css',
})
export class PeriodsPage {
  @ViewChild(EditPeriodComponent) editPeriod?: EditPeriodComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Period[];

  columns: Column[] = [
    {
      field: 'name',
      header: 'Name',
      width: '600px',
      useHyperlink: true,
      action: (data: Period) => {
        this.editPeriod?.editPeriod(data.periodId);
      },
    },
  ];

  actions = [
    {
      label: 'Edit Period',
      icon: 'fa fa-edit',
      action: (data: Period) => {
        this.editPeriod?.editPeriod(data.periodId);
      },
    },
    {
      label: 'Remove Period',
      icon: 'fa fa-remove',
      action: (data: Period) => {
        if (
          !confirm(
            'You are about to delete this period. Do you want to continue?'
          )
        )
          return;
        this.periodsStore.deletePeriod(data.periodId);
      },
    },
  ];

  count?: number;
  loading?: boolean;

  constructor(private periodsStore: PeriodsStore) {
    const periods$ = this.periodsStore.periods$;
    periods$.subscribe((periods) => {
      this.loading = !periods;

      if (!periods || periods.index == 0) {
        this.dataSource = [];
      }
      if (!periods) {
        return;
      }
      this.dataSource = [...this.dataSource!, ...periods.data];
      this.count = periods.count;
    });
  }

  loadMore(): void {
    this.periodsStore.loadPeriods(this.dataSource?.length ?? 0, 25);
  }

  addPeriod(): void {
    this.editPeriod?.editPeriod(0);
  }
}
