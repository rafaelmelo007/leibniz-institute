import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { EntityType } from '../../../relationships/domain/entity-type';
import { PostsStore } from '../../services/posts.store';
import { Post } from '../../domain/post';
import { filter, ReplaySubject, takeUntil } from 'rxjs';
import { EditPostComponent } from "../edit-post/edit-post.component";

@Component({
  selector: 'app-primary-posts',
  standalone: true,
  imports: [EditPostComponent],
  templateUrl: './primary-posts.component.html',
  styleUrl: './primary-posts.component.css',
})
export class PrimaryPostsComponent implements AfterViewInit, OnDestroy {
  @ViewChild(EditPostComponent) editPost?: EditPostComponent;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  @Input() type?: EntityType;
  @Input() id?: number;

  isExpanded = false;

  dataSource?: Post[];

  constructor(private postsStore: PostsStore) {
    this.postsStore.primaryPosts$
      .pipe(
        filter((x) => x?.type == this.type && x?.id == this.id),
        takeUntil(this.destroyed$)
      )
      .subscribe((posts) => {
        this.dataSource = posts?.data;
      });
  }

  ngAfterViewInit(): void {
    if (!this.type || !this.id) return;

    this.postsStore.loadPosts(0, 3, this.type, this.id, true);
  }

  editPostLink(postId: number): void {
    this.editPost?.editPost(postId);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
