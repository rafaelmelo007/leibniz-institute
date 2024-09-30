import { Component, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { Thesis } from '../domain/thesis';
import { ThesesStore } from '../services/theses.store';
import { CommonModule } from '@angular/common';
import { EditThesisComponent } from '../components/edit-thesis.component';

@Component({
  selector: 'app-theses',
  standalone: true,
  imports: [
    LoadingComponent,
    GridTableComponent,
    CommonModule,
    EditThesisComponent,
  ],
  templateUrl: './theses.component.html',
  styleUrl: './theses.component.css',
})
export class ThesesPage {
  @ViewChild(EditThesisComponent) editThesis?: EditThesisComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Thesis[];

  columns: Column[] = [
    {
      field: 'name',
      header: 'Name',
      width: '600px',
      useHyperlink: true,
      action: (data: Thesis) => {
        this.editThesis?.editThesis(data.thesisId);
      },
    },
  ];

  actions = [
    {
      label: 'Edit Thesis',
      icon: 'fa fa-edit',
      action: (data: Thesis) => {
        this.editThesis?.editThesis(data.thesisId);
      },
    },
    {
      label: 'Remove Thesis',
      icon: 'fa fa-remove',
      action: (data: Thesis) => {
        if (
          !confirm(
            'You are about to delete this thesis. Do you want to continue?'
          )
        )
          return;
        this.thesesStore.deleteThesis(data.thesisId);
      },
    },
  ];

  count?: number;
  loading?: boolean;

  constructor(private thesesStore: ThesesStore) {
    const theses$ = this.thesesStore.theses$;
    theses$.subscribe((theses) => {
      this.loading = !theses;

      if (!theses || theses.index == 0) {
        this.dataSource = [];
      }
      if (!theses) {
        return;
      }
      this.dataSource = [...this.dataSource!, ...theses.data];
      this.count = theses.count;
    });
  }

  loadMore(): void {
    this.thesesStore.loadTheses(this.dataSource?.length ?? 0, 25);
  }

  addThesis(): void {
    this.editThesis?.editThesis(0);
  }
}
