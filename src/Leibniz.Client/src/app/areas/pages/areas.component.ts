import { Component, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { Area } from '../domain/area';
import { AreasStore } from '../services/areas.store';
import { CommonModule } from '@angular/common';
import { EditAreaComponent } from '../components/edit-area.component';

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
export class AreasPage {
  @ViewChild(EditAreaComponent) editArea?: EditAreaComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Area[];

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
    const loading$ = this.areasStore.loading$;
    loading$.subscribe((loading) => {
      this.grid?.setLoading(loading);
    });

    const areas$ = this.areasStore.areas$;
    areas$.subscribe((areas) => {
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

  loadMore(): void {
    this.areasStore.loadAreas(this.dataSource?.length ?? 0, 25);
  }

  addArea(): void {
    this.editArea?.editArea(0);
  }
}
