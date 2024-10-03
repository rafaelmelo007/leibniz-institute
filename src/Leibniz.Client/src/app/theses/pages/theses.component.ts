import { Component, OnDestroy, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { Thesis } from '../domain/thesis';
import { ThesesStore } from '../services/theses.store';
import { CommonModule } from '@angular/common';
import { EditThesisComponent } from '../components/edit-thesis.component';
import { ReplaySubject, takeUntil } from 'rxjs';

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
export class ThesesPage implements OnDestroy {
  @ViewChild(EditThesisComponent) editThesis?: EditThesisComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Thesis[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

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
    this.subscribeTheses();
    this.subscribeThesisChanges();
  }

  subscribeTheses(): void {
    const loading$ = this.thesesStore.loading$;
    loading$.pipe(takeUntil(this.destroyed$)).subscribe((loading) => {
      this.grid?.setLoading(loading);
    });

    const theses$ = this.thesesStore.theses$;
    theses$.pipe(takeUntil(this.destroyed$)).subscribe((theses) => {
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

  subscribeThesisChanges(): void {
    const changes$ = this.thesesStore.changes$;
    changes$.pipe(takeUntil(this.destroyed$)).subscribe((entry) => {
      if (entry?.changeType == 'deleted') {
        this.dataSource = this.dataSource?.filter(
          (x) => x.thesisId != entry.id
        );
        this.count = (this.count ?? 0) - 1;
      }
      if (entry?.changeType == 'added') {
        this.dataSource = [];
        this.loadMore();
      }
      if (entry?.changeType == 'updated') {
        this.dataSource = this.dataSource?.map((x) => {
          if (x.thesisId == entry.data?.thesisId) {
            x.name = entry.data.name;
            x.content = entry.data.content;
          }
          return x;
        });
      }
    });
  }

  loadMore(): void {
    this.thesesStore.loadTheses(this.dataSource?.length ?? 0, 25);
  }

  addThesis(): void {
    this.editThesis?.editThesis(0);
  }
  
  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}