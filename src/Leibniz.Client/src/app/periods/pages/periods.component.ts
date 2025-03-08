import { Component, OnDestroy, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { CommonModule } from '@angular/common';
import { Period } from '../domain/period';
import { PeriodsStore } from '../services/periods.store';
import { EditPeriodComponent } from '../components/edit-period/edit-period.component';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ImagesStore } from '../../images/services/images.store';
import { AuthService } from '../../account/services/auth.service';
import { PageTitleComponent } from "../../common/components/page-title/page-title.component";

@Component({
  selector: 'app-periods',
  standalone: true,
  imports: [
    LoadingComponent,
    GridTableComponent,
    CommonModule,
    EditPeriodComponent,
    PageTitleComponent
],
  templateUrl: './periods.component.html',
  styleUrl: './periods.component.css',
})
export class PeriodsPage implements OnDestroy {
  @ViewChild(EditPeriodComponent) editPeriod?: EditPeriodComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Period[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  maxImageWidth = 120;
  maxImageHeight = 140;

  columns: Column[] = [
    {
      field: 'imageFileName',
      header: '',
      width: '130px',
      textAlign: 'center',
      useImage: true,
      maxImageWidth: this.maxImageWidth,
      maxImageHeight: this.maxImageHeight,
    },
    {
      field: 'name',
      header: 'Name',
      width: '550px',
      useHyperlink: true,
      action: (data: Period) => {
        this.editPeriod?.editPeriod(data.periodId);
      },
    },
    {
      field: 'beginYear',
      header: 'Begin Year',
      width: '130px',
      textAlign: 'center',
    },
    {
      field: 'endYear',
      header: 'End Year',
      width: '130px',
      textAlign: 'center',
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
  query?: string;
  queryStringToken: string | null;

  constructor(
    public periodsStore: PeriodsStore,
    private imagesStore: ImagesStore,
    private authService: AuthService
  ) {
    this.subscribePeriods();
    this.subscribePeriodChanges();
    this.subscribeImageChanges();

    this.queryStringToken = this.authService.getQueryStringToken();
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
          (x) => x.periodId != entry.ref.id
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

  subscribeImageChanges(): void {
    const imageExists$ = this.imagesStore.imageExists$;
    imageExists$.pipe(takeUntil(this.destroyed$)).subscribe((res) => {
      const exists = res.exists;

      this.dataSource?.forEach((period) => {
        if (res.ref?.type != 'period' || res.ref.id != period.periodId) return;
        if (!this.queryStringToken) return;

        if (exists && period.imageFileName) return;
        if (!exists && !period.imageFileName) return;

        period.imageFileName = exists
          ? this.imagesStore.getImageUrl(
              res.ref.type,
              res.ref.id,
              this.queryStringToken,
              this.maxImageWidth,
              this.maxImageHeight
            )
          : null;
      });
    });
  }

  loadMore(): void {
    this.periodsStore.loadPeriods(this.dataSource?.length ?? 0, 25);
  }

  loadDeepSearch(query: string): void {
    this.dataSource = [];
    this.periodsStore.query = query;
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
