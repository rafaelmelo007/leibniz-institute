import { Component, OnDestroy, ViewChild } from '@angular/core';
import { PageTitleComponent } from '../../../common/components/page-title/page-title.component';
import { LoadingComponent } from '../../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../../common/components/grid-table/grid-table.component';
import { EditChartComponent } from '../../components/edit-chart/edit-chart.component';
import { CommonModule } from '@angular/common';
import { Chart } from '../../domain/chart';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ChartsStore } from '../../services/charts.store';
import { NetworkComponent } from '../../../network/components/network/network.component';

@Component({
  selector: 'app-charts',
  imports: [
    CommonModule,
    PageTitleComponent,
    LoadingComponent,
    EditChartComponent,
    NetworkComponent,
  ],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.css',
})
export class ChartsComponent implements OnDestroy {
  @ViewChild(EditChartComponent) editChart?: EditChartComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Chart[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  maxImageWidth = 120;
  maxImageHeight = 140;

  columns: Column[] = [
    {
      field: 'name',
      header: 'Name',
      width: '130px',
      useHyperlink: true,
      action: (data: Chart) => {
        this.editChart?.editChart(data.chartId);
      },
    },
    {
      field: 'content',
      header: 'Content',
      width: '550px',
      textAlign: 'center',
    },
  ];

  actions = [
    {
      label: 'Edit Chart',
      icon: 'fa fa-edit',
      action: (data: Chart) => {
        this.editChart?.editChart(data.chartId);
      },
    },
    {
      label: 'Remove Chart',
      icon: 'fa fa-remove',
      action: (data: Chart) => {
        if (
          !confirm(
            'You are about to delete this chart. Do you want to continue?'
          )
        )
          return;
        this.chartsStore.deleteChart(data.chartId);
      },
    },
  ];

  count?: number;
  loading?: boolean;
  query?: string;

  constructor(public chartsStore: ChartsStore) {
    this.subscribeCharts();
    this.subscribeChartChanges();
    this.loadMore();
  }

  subscribeCharts(): void {
    const loading$ = this.chartsStore.loading$;
    loading$.pipe(takeUntil(this.destroyed$)).subscribe((loading) => {
      this.grid?.setLoading(loading);
    });

    const charts$ = this.chartsStore.charts$;
    charts$.pipe(takeUntil(this.destroyed$)).subscribe((charts) => {
      this.loading = !charts;

      if (!charts || charts.index == 0) {
        this.dataSource = [];
      }
      if (!charts) {
        return;
      }
      this.dataSource = [...this.dataSource!, ...charts.data];
      this.count = charts.count;
    });
  }

  subscribeChartChanges(): void {
    const changes$ = this.chartsStore.changes$;
    changes$.pipe(takeUntil(this.destroyed$)).subscribe((entry) => {
      if (entry?.changeType == 'deleted') {
        this.dataSource = this.dataSource?.filter(
          (x) => x.chartId != entry.ref.id
        );
        this.count = (this.count ?? 0) - 1;
      }
      if (entry?.changeType == 'added') {
        this.dataSource = [];
        this.loadMore();
      }
      if (entry?.changeType == 'updated') {
        this.dataSource = this.dataSource?.map((x) => {
          if (x.chartId == entry.data?.chartId) {
            x.name = entry.data.name;
            x.content = entry.data.content;
          }
          return x;
        });
      }
    });
  }

  loadMore(): void {
    this.chartsStore.loadPeriods(this.dataSource?.length ?? 0, 25);
  }

  loadDeepSearch(query: string): void {
    this.dataSource = [];
    this.chartsStore.query = query;
    this.chartsStore.loadPeriods(this.dataSource?.length ?? 0, 25);
  }

  addChart(): void {
    this.editChart?.editChart(0);
  }

  edit(chartId: number): void {
    this.editChart?.editChart(chartId);
  }

  deleteChart(chartId: number): void {
    this.chartsStore.deleteChart(chartId);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
