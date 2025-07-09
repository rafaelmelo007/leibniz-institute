import { Component, OnDestroy, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { Thesis } from '../domain/thesis';
import { ThesesStore } from '../services/theses.store';
import { CommonModule } from '@angular/common';
import { EditThesisComponent } from '../components/edit-thesis/edit-thesis.component';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ImagesStore } from '../../images/services/images.store';
import { AuthService } from '../../user/services/auth.service';
import { Router } from '@angular/router';
import { PageTitleComponent } from "../../common/components/page-title/page-title.component";

@Component({
    selector: 'app-theses',
    imports: [
        LoadingComponent,
        GridTableComponent,
        CommonModule,
        EditThesisComponent,
        PageTitleComponent
    ],
    templateUrl: './theses.component.html',
    styleUrl: './theses.component.css'
})
export class ThesesPage implements OnDestroy {
  @ViewChild(EditThesisComponent) editThesis?: EditThesisComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Thesis[];
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
      width: '600px',
      useHyperlink: true,
      action: (data: Thesis) => {
        this.router.navigate(['/pages/theses/' + data.thesisId]);
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
  queryStringToken: string | null;

  constructor(
    public thesesStore: ThesesStore,
    private imagesStore: ImagesStore,
    private authService: AuthService,
    private router: Router
  ) {
    this.subscribeTheses();
    this.subscribeThesisChanges();
    this.subscribeImageChanges();

    this.queryStringToken = this.authService.getQueryStringToken();
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
          (x) => x.thesisId != entry.ref.id
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

  subscribeImageChanges(): void {
    const imageExists$ = this.imagesStore.imageExists$;
    imageExists$.pipe(takeUntil(this.destroyed$)).subscribe((res) => {
      const exists = res.exists;

      this.dataSource?.forEach((thesis) => {
        if (res.ref?.type != 'thesis' || res.ref.id != thesis.thesisId) return;
        if (!this.queryStringToken) return;

        if (exists && thesis.imageFileName) return;
        if (!exists && !thesis.imageFileName) return;

        thesis.imageFileName = exists
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
    this.thesesStore.listTheses(this.dataSource?.length ?? 0, 25);
  }

  loadDeepSearch(query: string): void {
    this.dataSource = [];
    this.thesesStore.query = query;
    this.thesesStore.listTheses(this.dataSource?.length ?? 0, 25);
  }

  addThesis(): void {
    this.editThesis?.editThesis(0);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
