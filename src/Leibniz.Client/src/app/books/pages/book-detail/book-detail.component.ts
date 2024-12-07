import { Component, ViewChild } from '@angular/core';
import { BookSplashComponent } from '../../components/book-splash/book-splash.component';
import { ActivatedRoute } from '@angular/router';
import { PrimaryPostsComponent } from '../../../posts/components/primary-posts/primary-posts.component';
import { SecondaryPostsComponent } from '../../../posts/components/secondary-posts/secondary-posts.component';
import { ChronologyComponent } from '../../../periods/components/chronology/chronology.component';
import { AuthorsListComponent } from '../../../authors/components/authors-list/authors-list.component';
import { ThesisListComponent } from '../../../theses/components/thesis-list/thesis-list.component';
import { EntityType } from '../../../relationships/domain/entity-type';
import { TopicsListComponent } from "../../../topics/components/topics-list/topics-list.component";
import { LinksListComponent } from "../../../links/components/links-list/links-list.component";

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [
    BookSplashComponent,
    PrimaryPostsComponent,
    SecondaryPostsComponent,
    ChronologyComponent,
    AuthorsListComponent,
    ThesisListComponent,
    TopicsListComponent,
    LinksListComponent
],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.css',
})
export class BookDetailPage {
  @ViewChild(SecondaryPostsComponent) SecondaryPostsComponent?: SecondaryPostsComponent;
  bookId: number = 0;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe((params) => {
      this.bookId = parseInt(params.get('id') ?? '-1');
    });
  }

  applyFilter(type: EntityType, id: number): void {
    this.SecondaryPostsComponent?.applyFilter(type, id);
  }
}
