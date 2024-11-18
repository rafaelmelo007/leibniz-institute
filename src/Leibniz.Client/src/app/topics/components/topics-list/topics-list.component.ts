import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { ReplaySubject, takeUntil } from 'rxjs';
import { EditTopicComponent } from '../edit-topic/edit-topic.component';
import { Topic } from '../../domain/topic';
import { EntityType } from '../../../relationships/domain/entity-type';
import { TopicsStore } from '../../services/topics.store';

@Component({
  selector: 'app-topics-list',
  standalone: true,
  imports: [],
  templateUrl: './topics-list.component.html',
  styleUrl: './topics-list.component.css'
})
export class TopicsListComponent implements OnDestroy, AfterViewInit {
  @ViewChild(EditTopicComponent) editTopic?: EditTopicComponent;
  dataSource?: Topic[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() type?: EntityType;
  @Input() id?: number;
  count?: number;
  @Output() selectTopic = new EventEmitter();

  constructor(private topicsStore: TopicsStore) {
    this.topicsStore.primaryTopics$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((topics) => {
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

  ngAfterViewInit(): void {
    if (!this.type || !this.id) return;

    this.topicsStore.loadTopics(
      this.dataSource?.length ?? 0,
      10,
      this.type,
      this.id,
      true
    );
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
