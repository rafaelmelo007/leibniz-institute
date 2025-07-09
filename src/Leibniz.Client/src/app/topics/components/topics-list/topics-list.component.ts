import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { filter, ReplaySubject, takeUntil } from 'rxjs';
import { EditTopicComponent } from '../edit-topic/edit-topic.component';
import { Topic } from '../../domain/topic';
import { EntityType } from '../../../relationships/domain/entity-type';
import { TopicsStore } from '../../services/topics.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topics-list',
  imports: [EditTopicComponent],
  templateUrl: './topics-list.component.html',
  styleUrl: './topics-list.component.css',
})
export class TopicsListComponent implements OnDestroy, OnInit, OnChanges {
  @ViewChild(EditTopicComponent) editTopic?: EditTopicComponent;
  dataSource?: Topic[];
  private destroyed$ = new ReplaySubject<boolean>(1);
  @Input() type?: EntityType;
  @Input() id?: number;
  count?: number;
  @Output() selectTopic = new EventEmitter();

  constructor(private topicsStore: TopicsStore, private router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.loadData();
    }
  }

  loadData(): void {
    this.dataSource = [];

    this.topicsStore.primaryTopics$
      .pipe(
        filter((x) => x?.type == this.type && x?.id == this.id),
        takeUntil(this.destroyed$)
      )
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

    if (!this.type || !this.id) return;

    this.topicsStore.loadTopics(
      this.dataSource?.length ?? 0,
      10,
      this.type,
      this.id,
      true
    );
  }

  edit(topicId: number): void {
    this.editTopic?.editTopic(topicId);
  }

  navigate(topicId: number): void {
    this.router.navigate([`/pages/topics/${topicId}`]);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
