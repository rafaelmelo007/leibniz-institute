import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Topic } from '../../domain/topic';
import { EditTopicComponent } from '../edit-topic/edit-topic.component';
import { TopicsStore } from '../../services/topics.store';
import { ImageBoxComponent } from '../../../shared/components/image-box/image-box.component';
import { NewlineToBrPipe } from '../../../common/pipes/newline-to-br.pipe';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-topic-splash',
    imports: [
        CommonModule,
        ImageBoxComponent,
        EditTopicComponent,
        NewlineToBrPipe,
    ],
    templateUrl: './topic-splash.component.html',
    styleUrl: './topic-splash.component.css'
})
export class TopicSplashComponent implements OnInit {
  @ViewChild(EditTopicComponent) editTopic?: EditTopicComponent;
  @Input() topicId: number = 0;
  topic?: Topic | null;

  constructor(private topicsStore: TopicsStore) {}

  ngOnInit(): void {
    this.topicsStore.getTopic(this.topicId).subscribe((topic) => {
      this.topic = topic;
    });
  }

  edit(): void {
    this.editTopic?.editTopic(this.topicId);
  }
}
