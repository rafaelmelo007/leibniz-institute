import { Component, ViewChild } from '@angular/core';
import { OtherPostsComponent } from '../../../posts/components/other-posts/other-posts.component';
import { ActivatedRoute } from '@angular/router';
import { EntityType } from '../../../relationships/domain/entity-type';
import { MainPostsComponent } from "../../../posts/components/main-posts/main-posts.component";
import { AuthorsListComponent } from "../../components/authors-list/authors-list.component";
import { ThesisListComponent } from "../../../theses/components/thesis-list/thesis-list.component";
import { TopicsListComponent } from "../../../topics/components/topics-list/topics-list.component";
import { LinksListComponent } from "../../../links/components/links-list/links-list.component";

@Component({
  selector: 'app-author-detail',
  standalone: true,
  imports: [MainPostsComponent, OtherPostsComponent, AuthorsListComponent, ThesisListComponent, TopicsListComponent, LinksListComponent],
  templateUrl: './author-detail.component.html',
  styleUrl: './author-detail.component.css'
})
export class AuthorDetailPage {
  @ViewChild(OtherPostsComponent) otherPostsComponent?: OtherPostsComponent;
  authorId: number = 0;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      this.authorId = parseInt(params.get('id') ?? '-1');
    });
  }

  applyFilter(type: EntityType, id: number): void {
    this.otherPostsComponent?.applyFilter(type, id);
  }
}
