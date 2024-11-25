import { Component, ViewChild } from '@angular/core';
import { OtherPostsComponent } from '../../../posts/components/other-posts/other-posts.component';
import { ActivatedRoute } from '@angular/router';
import { EntityType } from '../../../relationships/domain/entity-type';
import { MainPostsComponent } from "../../../posts/components/main-posts/main-posts.component";
import { AuthorsListComponent } from "../../../authors/components/authors-list/authors-list.component";
import { ThesisListComponent } from "../../components/thesis-list/thesis-list.component";
import { TopicsListComponent } from "../../../topics/components/topics-list/topics-list.component";
import { LinksListComponent } from "../../../links/components/links-list/links-list.component";
import { ThesisSplashComponent } from "../../components/thesis-splash/thesis-splash.component";

@Component({
  selector: 'app-thesis-detail',
  standalone: true,
  imports: [MainPostsComponent, OtherPostsComponent, AuthorsListComponent, ThesisListComponent, TopicsListComponent, LinksListComponent, ThesisSplashComponent],
  templateUrl: './thesis-detail.component.html',
  styleUrl: './thesis-detail.component.css'
})
export class ThesisDetailPage {
  @ViewChild(OtherPostsComponent) otherPostsComponent?: OtherPostsComponent;
  thesisId: number = 0;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      this.thesisId = parseInt(params.get('id') ?? '-1');
    });
  }

  applyFilter(type: EntityType, id: number): void {
    this.otherPostsComponent?.applyFilter(type, id);
  }
}
