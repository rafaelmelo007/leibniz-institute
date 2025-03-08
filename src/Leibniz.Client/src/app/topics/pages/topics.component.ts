import { Component, OnDestroy, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { CommonModule } from '@angular/common';
import { Topic } from '../domain/topic';
import { TopicsStore } from '../services/topics.store';
import { EditTopicComponent } from '../components/edit-topic/edit-topic.component';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ImagesStore } from '../../images/services/images.store';
import { AuthService } from '../../account/services/auth.service';
import { Router } from '@angular/router';
import { PageTitleComponent } from "../../common/components/page-title/page-title.component";

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [
    LoadingComponent,
    GridTableComponent,
    CommonModule,
    EditTopicComponent,
    PageTitleComponent
],
  templateUrl: './topics.component.html',
  styleUrl: './topics.component.css',
})
export class TopicsPage implements OnDestroy {
  @ViewChild(EditTopicComponent) editTopic?: EditTopicComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Topic[];
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
      action: (data: Topic) => {
        this.router.navigate(['/pages/topics/' + data.topicId]);
      },
    },
  ];

  actions = [
    {
      label: 'Edit Topic',
      icon: 'fa fa-edit',
      action: (data: Topic) => {
        this.editTopic?.editTopic(data.topicId);
      },
    },
    {
      label: 'Remove Topic',
      icon: 'fa fa-remove',
      action: (data: Topic) => {
        if (
          !confirm(
            'You are about to delete this topic. Do you want to continue?'
          )
        )
          return;
        this.topicsStore.deleteTopic(data.topicId);
      },
    },
  ];

  count?: number;
  loading?: boolean;
  queryStringToken: string | null;

  constructor(
    private router: Router,
    public topicsStore: TopicsStore,
    private imagesStore: ImagesStore,
    private authService: AuthService
  ) {
    this.subscribeTopics();
    this.subscribeTopicChanges();
    this.subscribeImageChanges();

    this.queryStringToken = this.authService.getQueryStringToken();
  }

  subscribeTopics(): void {
    const loading$ = this.topicsStore.loading$;
    loading$.pipe(takeUntil(this.destroyed$)).subscribe((loading) => {
      this.grid?.setLoading(loading);
    });

    const topics$ = this.topicsStore.topics$;
    topics$.pipe(takeUntil(this.destroyed$)).subscribe((topics) => {
      this.loading = !topics;

      if (!topics || topics.index == 0) {
        this.dataSource = [];
      }
      if (!topics) {
        return;
      }
      this.dataSource = [...this.dataSource!, ...topics.data];
      this.count = topics.count;
    });
  }

  subscribeTopicChanges(): void {
    const changes$ = this.topicsStore.changes$;
    changes$.pipe(takeUntil(this.destroyed$)).subscribe((entry) => {
      if (entry?.changeType == 'deleted') {
        this.dataSource = this.dataSource?.filter(
          (x) => x.topicId != entry.ref.id
        );
        this.count = (this.count ?? 0) - 1;
      }
      if (entry?.changeType == 'added') {
        this.dataSource = [];
        this.loadMore();
      }
      if (entry?.changeType == 'updated') {
        this.dataSource = this.dataSource?.map((x) => {
          if (x.topicId == entry.data?.topicId) {
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

      this.dataSource?.forEach((topic) => {
        if (res.ref?.type != 'topic' || res.ref.id != topic.topicId) return;
        if (!this.queryStringToken) return;

        if (exists && topic.imageFileName) return;
        if (!exists && !topic.imageFileName) return;

        topic.imageFileName = exists
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
    this.topicsStore.listTopics(this.dataSource?.length ?? 0, 25);
  }

  loadDeepSearch(query: string): void {
    this.dataSource = [];
    this.topicsStore.query = query;
    this.topicsStore.listTopics(this.dataSource?.length ?? 0, 25);
  }

  addTopic(): void {
    this.editTopic?.editTopic(0);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
