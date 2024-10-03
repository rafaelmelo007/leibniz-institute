import { Component, OnDestroy, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { CommonModule } from '@angular/common';
import { Topic } from '../domain/topic';
import { TopicsStore } from '../services/topics.store';
import { EditTopicComponent } from '../components/edit-topic.component';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-topics',
  standalone: true,
  imports: [
    LoadingComponent,
    GridTableComponent,
    CommonModule,
    EditTopicComponent,
  ],
  templateUrl: './topics.component.html',
  styleUrl: './topics.component.css',
})
export class TopicsPage implements OnDestroy {
  @ViewChild(EditTopicComponent) editTopic?: EditTopicComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Topic[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  columns: Column[] = [
    {
      field: 'name',
      header: 'Name',
      width: '600px',
      useHyperlink: true,
      action: (data: Topic) => {
        this.editTopic?.editTopic(data.topicId);
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

  constructor(private topicsStore: TopicsStore) {
    this.subscribeTopics();
    this.subscribeTopicChanges();
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
        this.dataSource = this.dataSource?.filter((x) => x.topicId != entry.id);
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

  loadMore(): void {
    this.topicsStore.loadTopics(this.dataSource?.length ?? 0, 25);
  }

  addTopic(): void {
    this.editTopic?.editTopic(0);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
