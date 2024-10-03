import { Component, OnDestroy, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { Area } from '../domain/area';
import { AreasStore } from '../services/areas.store';
import { CommonModule } from '@angular/common';
import { EditAreaComponent } from '../components/edit-area.component';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [
    LoadingComponent,
    GridTableComponent,
    CommonModule,
    EditAreaComponent,
  ],
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.css',
})
export class AreasPage implements OnDestroy {
  @ViewChild(EditAreaComponent) editArea?: EditAreaComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Area[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  columns: Column[] = [
    {
      field: 'name',
      header: 'Name',
      width: '600px',
      useHyperlink: true,
      action: (data: Area) => {
        this.editArea?.editArea(data.areaId);
      },
    },
  ];

  actions = [
    {
      label: 'Edit Area',
      icon: 'fa fa-edit',
      action: (data: Area) => {
        this.editArea?.editArea(data.areaId!);
      },
    },
    {
      label: 'Remove Area',
      icon: 'fa fa-remove',
      action: (data: Area) => {
        if (
          !confirm(
            'You are about to delete this area. Do you want to continue?'
          )
        )
          return;
        this.areasStore.deleteArea(data.areaId!);
      },
    },
  ];

  count?: number;

  constructor(private areasStore: AreasStore) {
    this.subscribeAreas();
    this.subscribeAreaChanges();
  }

  subscribeAreas(): void {
    const loading$ = this.areasStore.loading$;
    loading$.pipe(takeUntil(this.destroyed$)).subscribe((loading) => {
      this.grid?.setLoading(loading);
    });

    const areas$ = this.areasStore.areas$;
    areas$.pipe(takeUntil(this.destroyed$)).subscribe((areas) => {
      if (!areas || areas.index == 0) {
        this.dataSource = [];
      }
      if (!areas) {
        return;
      }
      this.dataSource = [...this.dataSource!, ...areas.data];
      this.count = areas.count;
    });
  }

  subscribeAreaChanges(): void {
    const changes$ = this.areasStore.changes$;
    changes$.pipe(takeUntil(this.destroyed$)).subscribe((entry) => {
      if (entry?.changeType == 'deleted') {
        this.dataSource = this.dataSource?.filter((x) => x.areaId != entry.id);
        this.count = (this.count ?? 0) - 1;
      }
      if (entry?.changeType == 'added') {
        this.dataSource = [];
        this.loadMore();
      }
      if (entry?.changeType == 'updated') {
        this.dataSource = this.dataSource?.map((x) => {
          if (x.areaId == entry.data?.areaId) {
            x.name = entry.data.name;
            x.content = entry.data.content;
          }
          return x;
        });
      }
    });
  }

  loadMore(): void {
    this.areasStore.loadAreas(this.dataSource?.length ?? 0, 25);
  }

  addArea(): void {
    this.editArea?.editArea(0);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
