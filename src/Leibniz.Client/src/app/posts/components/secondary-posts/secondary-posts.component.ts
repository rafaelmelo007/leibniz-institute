import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { EntityType } from '../../../relationships/domain/entity-type';
import { Post } from '../../domain/post';
import { PostsStore } from '../../services/posts.store';
import { EditPostComponent } from '../edit-post/edit-post.component';
import { EntityBadgeComponent } from '../../../common/components/entity-badge/entity-badge.component';
import { CommonModule } from '@angular/common';
import { InfiniteScrollComponent } from '../../../common/components/infinite-scroll/infinite-scroll.component';
import { filter, ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-secondary-posts',
  standalone: true,
  imports: [
    EditPostComponent,
    EntityBadgeComponent,
    CommonModule,
    InfiniteScrollComponent,
  ],
  templateUrl: './secondary-posts.component.html',
  styleUrl: './secondary-posts.component.css',
})
export class SecondaryPostsComponent implements OnDestroy {
  @ViewChild(EditPostComponent) editPost?: EditPostComponent;
  dataSource?: Post[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() type?: EntityType;
  @Input() id?: number;
  @Input() filterType?: EntityType;
  @Input() filterId?: number;
  count?: number;
  reachedEnd = false;

  constructor(private postsStore: PostsStore) {
    this.postsStore.secondaryPosts$
      .pipe(
        filter(
          (x) =>
            x?.type == this.type &&
            x?.id == this.id &&
            x?.filterType == this.filterType &&
            x?.filterId == this.filterId
        ),
        takeUntil(this.destroyed$)
      )
      .subscribe((posts) => {
        if (!posts || posts.index == 0) {
          this.dataSource = [];
        }
        if (!!posts && posts.count == 0) {
          this.reachedEnd = true;
        } else {
          this.reachedEnd = false;
        }
        if (!posts) {
          return;
        }
        this.dataSource = [...this.dataSource!, ...posts.data];
        this.count = posts.count;
      });
  }

  loadMore(): void {
    if (!this.type || !this.id) return;

    this.postsStore.loadPosts(
      this.dataSource?.length ?? 0,
      10,
      this.type,
      this.id,
      false,
      this.filterType,
      this.filterId
    );
  }

  applyFilter(filterType: EntityType, filterId: number): void {
    if (!this.type || !this.id) return;

    this.dataSource = [];
    this.filterType = filterType;
    this.filterId = filterId;

    this.reachedEnd = false;

    this.loadMore();
  }

  addPost(): void {
    this.editPost?.editPost(0);
  }

  deletePost(postId: number): void {
    if (!confirm('You are about to delete this post. Do you want to continue?'))
      return;
    this.postsStore.deletePost(postId);
  }

  editPostLink(postId: number): void {
    this.editPost?.editPost(postId);
  }

  encodeValue(value: string): string {
    return value.replace(/\n/g, '<br />');
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
