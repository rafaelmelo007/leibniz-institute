import { Component, ViewChild } from '@angular/core';
import { SecondaryPostsComponent } from '../../../posts/components/secondary-posts/secondary-posts.component';
import { ActivatedRoute } from '@angular/router';
import { EntityType } from '../../../relationships/domain/entity-type';
import { PrimaryPostsComponent } from "../../../posts/components/primary-posts/primary-posts.component";
import { AuthorsListComponent } from "../../components/authors-list/authors-list.component";
import { ThesisListComponent } from "../../../theses/components/thesis-list/thesis-list.component";
import { TopicsListComponent } from "../../../topics/components/topics-list/topics-list.component";
import { LinksListComponent } from "../../../links/components/links-list/links-list.component";
import { AuthorSplashComponent } from "../../components/author-splash/author-splash.component";

@Component({
  selector: 'app-author-detail',
  standalone: true,
  imports: [PrimaryPostsComponent, SecondaryPostsComponent, AuthorsListComponent, ThesisListComponent, TopicsListComponent, LinksListComponent, AuthorSplashComponent],
  templateUrl: './author-detail.component.html',
  styleUrl: './author-detail.component.css'
})
export class AuthorDetailPage {
  @ViewChild(SecondaryPostsComponent) SecondaryPostsComponent?: SecondaryPostsComponent;
  authorId: number = 0;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      this.authorId = parseInt(params.get('id') ?? '-1');
    });
  }

  applyFilter(type: EntityType, id: number): void {
    this.SecondaryPostsComponent?.applyFilter(type, id);
  }
}
