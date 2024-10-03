import { Component, OnDestroy, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { CommonModule } from '@angular/common';
import { Period } from '../domain/period';
import { PeriodsStore } from '../services/periods.store';
import { EditPeriodComponent } from '../components/edit-period.component';
import { ReplaySubject, takeUntil } from 'rxjs';

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
export class PeriodsPage implements OnDestroy {
  @ViewChild(EditPeriodComponent) editPeriod?: EditPeriodComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Period[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

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
    this.subscribePeriods();
    this.subscribePeriodChanges();
  }

  subscribePeriods(): void {
    const loading$ = this.periodsStore.loading$;
    loading$.pipe(takeUntil(this.destroyed$)).subscribe((loading) => {
      this.grid?.setLoading(loading);
    });

    const periods$ = this.periodsStore.periods$;
    periods$.pipe(takeUntil(this.destroyed$)).subscribe((periods) => {
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

  subscribePeriodChanges(): void {
    const changes$ = this.periodsStore.changes$;
    changes$.pipe(takeUntil(this.destroyed$)).subscribe((entry) => {
      if (entry?.changeType == 'deleted') {
        this.dataSource = this.dataSource?.filter(
          (x) => x.periodId != entry.id
        );
        this.count = (this.count ?? 0) - 1;
      }
      if (entry?.changeType == 'added') {
        this.dataSource = [];
        this.loadMore();
      }
      if (entry?.changeType == 'updated') {
        this.dataSource = this.dataSource?.map((x) => {
          if (x.periodId == entry.data?.periodId) {
            x.name = entry.data.name;
            x.content = entry.data.content;
          }
          return x;
        });
      }
    });
  }

  loadMore(): void {
    this.periodsStore.loadPeriods(this.dataSource?.length ?? 0, 25);
  }

  addPeriod(): void {
    this.editPeriod?.editPeriod(0);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
