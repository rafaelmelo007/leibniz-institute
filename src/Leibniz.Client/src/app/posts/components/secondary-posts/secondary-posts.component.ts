import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
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
import { DropdownComponent } from '../../../common/components/dropdown/dropdown.component';
import utils from '../../../common/services/utils';

@Component({
  selector: 'app-secondary-posts',
  standalone: true,
  imports: [
    EditPostComponent,
    EntityBadgeComponent,
    CommonModule,
    InfiniteScrollComponent,
    DropdownComponent,
  ],
  templateUrl: './secondary-posts.component.html',
  styleUrl: './secondary-posts.component.css',
})
export class SecondaryPostsComponent implements OnDestroy, OnChanges {
  @ViewChild(EditPostComponent) editPost?: EditPostComponent;
  dataSource?: Post[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() type?: EntityType;
  @Input() id?: number;
  @Input() filterType?: EntityType;
  @Input() filterId?: number;
  count?: number;
  reachedEnd = false;

  actions = [
    {
      label: 'Copy To Clipboard',
      icon: 'fa fa-clipboard',
      action: (data: Post) => {
        utils.copyToClipboard(
          data.title + '\n' + data.content + '\n' + data.author
        );
      },
    },
    {
      label: 'Edit Post',
      icon: 'fa fa-edit',
      action: (data: Post) => {
        this.editPost?.editPost(data.postId);
      },
    },
    {
      label: 'Remove Post',
      icon: 'fa fa-remove',
      action: (data: Post) => {
        this.deletePost(data.postId);
      },
    },
  ];

  constructor(private postsStore: PostsStore) {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.loadData();
    }
  }

  loadData(): void {
    this.dataSource = [];

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

    this.loadMore();
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
    this.destroyed$?.next(true);
    this.destroyed$?.complete();
  }
}
