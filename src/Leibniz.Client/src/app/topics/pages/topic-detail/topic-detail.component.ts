import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SecondaryPostsComponent } from '../../../posts/components/secondary-posts/secondary-posts.component';
import { EntityType } from '../../../relationships/domain/entity-type';
import { PrimaryPostsComponent } from '../../../posts/components/primary-posts/primary-posts.component';
import { AuthorsListComponent } from '../../../authors/components/authors-list/authors-list.component';
import { ThesisListComponent } from '../../../theses/components/thesis-list/thesis-list.component';
import { TopicsListComponent } from '../../components/topics-list/topics-list.component';
import { LinksListComponent } from '../../../links/components/links-list/links-list.component';
import { TopicSplashComponent } from '../../components/topic-splash/topic-splash.component';

@Component({
  selector: 'app-topic-detail',
  imports: [
    PrimaryPostsComponent,
    SecondaryPostsComponent,
    AuthorsListComponent,
    ThesisListComponent,
    TopicsListComponent,
    LinksListComponent,
    TopicSplashComponent,
  ],
  templateUrl: './topic-detail.component.html',
  styleUrl: './topic-detail.component.css',
})
export class TopicDetailPage {
  @ViewChild(SecondaryPostsComponent)
  SecondaryPostsComponent?: SecondaryPostsComponent;
  topicId = 0;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      this.topicId = parseInt(params.get('id') ?? '-1');
    });
  }

  applyFilter(type: EntityType, id: number): void {
    this.SecondaryPostsComponent?.applyFilter(type, id);
  }
}
