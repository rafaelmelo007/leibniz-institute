import { Component, ViewChild } from '@angular/core';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { CommonModule } from '@angular/common';
import { Topic } from '../domain/topic';
import { TopicsStore } from '../services/topics.store';
import { EditTopicComponent } from '../components/edit-topic.component';

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
export class TopicsPage {
  @ViewChild(EditTopicComponent) editTopic?: EditTopicComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Topic[];

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
    const topics$ = this.topicsStore.topics$;
    topics$.subscribe((topics) => {
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

  loadMore(): void {
    this.topicsStore.loadTopics(this.dataSource?.length ?? 0, 25);
  }

  addTopic(): void {
    this.editTopic?.editTopic(0);
  }
}
