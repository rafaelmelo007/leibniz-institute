import { Component, OnDestroy, ViewChild } from '@angular/core';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { Area } from '../domain/area';
import { AreasStore } from '../services/areas.store';
import { CommonModule } from '@angular/common';
import { EditAreaComponent } from '../components/edit-area/edit-area.component';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ImagesStore } from '../../images/services/images.store';
import { AuthService } from '../../user/services/auth.service';
import { PageTitleComponent } from "../../common/components/page-title/page-title.component";

@Component({
    selector: 'app-areas',
    imports: [
        GridTableComponent,
        CommonModule,
        EditAreaComponent,
        PageTitleComponent
    ],
    templateUrl: './areas.component.html',
    styleUrl: './areas.component.css'
})
export class AreasPage implements OnDestroy {
  @ViewChild(EditAreaComponent) editArea?: EditAreaComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Area[];
  private destroyed$ = new ReplaySubject<boolean>(1);

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
  queryStringToken: string | null;

  constructor(
    public areasStore: AreasStore,
    private imagesStore: ImagesStore,
    private authService: AuthService
  ) {
    this.subscribeAreas();
    this.subscribeAreaChanges();
    this.subscribeImageChanges();
    this.queryStringToken = this.authService.getQueryStringToken();
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
        this.dataSource = this.dataSource?.filter(
          (x) => x.areaId != entry.ref.id
        );
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

  subscribeImageChanges(): void {
    const imageExists$ = this.imagesStore.imageExists$;
    imageExists$.pipe(takeUntil(this.destroyed$)).subscribe((res) => {
      const exists = res.exists;

      this.dataSource?.forEach((area) => {
        if (res.ref?.type != 'area' || res.ref.id != area.areaId) return;
        if (!this.queryStringToken) return;

        if (exists && area.imageFileName) return;
        if (!exists && !area.imageFileName) return;

        area.imageFileName = exists
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
    this.areasStore.loadAreas(this.dataSource?.length ?? 0, 25);
  }

  loadDeepSearch(query: string): void {
    this.dataSource = [];
    this.areasStore.query = query;
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
