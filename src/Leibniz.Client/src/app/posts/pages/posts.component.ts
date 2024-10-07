import { Component, OnDestroy, ViewChild } from '@angular/core';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { Post } from '../domain/post';
import { PostsStore } from '../services/posts.store';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import { CommonModule } from '@angular/common';
import { EditPostComponent } from '../components/edit-post.component';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ImagesStore } from '../../images/services/images.store';
import { AuthService } from '../../account/services/auth.service';
import { InfiniteScrollComponent } from '../../common/components/infinite-scroll/infinite-scroll.component';
import { EntityBadgeComponent } from '../../common/components/entity-badge/entity-badge.component';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    LoadingComponent,
    GridTableComponent,
    CommonModule,
    EditPostComponent,
    InfiniteScrollComponent,
    EntityBadgeComponent,
  ],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css',
})
export class PostsPage implements OnDestroy {
  @ViewChild(EditPostComponent) editPost?: EditPostComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Post[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  query = '';

  maxImageWidth = 120;
  maxImageHeight = 140;

  columns: Column[] = [
    {
      field: 'imageFileName',
      header: '',
      width: '130px',
      textAlign: 'center',
      useImage: true,
      maxImageWidth: this.maxImageWidth,
      maxImageHeight: this.maxImageHeight,
    },
    {
      field: 'title',
      header: 'Title',
      width: '280px',
      useHyperlink: true,
      action: (data: Post) => {
        this.editPost?.editPost(data.postId);
      },
    },
    {
      field: 'content',
      header: 'Content',
      width: '500px',
    },
    {
      field: 'author',
      header: 'Author',
      width: '220px',
    },
    {
      field: 'refs',
      header: 'Tags',
      width: '220px',
    },
  ];

  actions = [
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
        if (
          !confirm(
            'You are about to delete this post. Do you want to continue?'
          )
        )
          return;
        this.postsStore.deletePost(data.postId);
      },
    },
  ];

  count?: number;
  loading?: boolean;
  queryStringToken: string | null;

  constructor(
    private postsStore: PostsStore,
    private imagesStore: ImagesStore,
    private authService: AuthService
  ) {
    this.subscribePosts();
    this.subscribePostChanges();
    this.subscribeImageChanges();

    this.queryStringToken = this.authService.getQueryStringToken();
  }

  subscribePosts(): void {
    const loading$ = this.postsStore.loading$;
    loading$.pipe(takeUntil(this.destroyed$)).subscribe((loading) => {
      this.grid?.setLoading(loading);
    });

    const posts$ = this.postsStore.posts$;
    posts$.pipe(takeUntil(this.destroyed$)).subscribe((posts) => {
      this.loading = !posts;

      if (!posts || posts.index == 0) {
        this.dataSource = [];
      }
      if (!posts) {
        return;
      }
      this.dataSource = [...this.dataSource!, ...posts.data];
      this.count = posts.count;
    });
  }

  subscribePostChanges(): void {
    const changes$ = this.postsStore.changes$;
    changes$.pipe(takeUntil(this.destroyed$)).subscribe((entry) => {
      if (entry?.changeType == 'deleted') {
        this.dataSource = this.dataSource?.filter(
          (x) => x.postId != entry.ref.id
        );
        this.count = (this.count ?? 0) - 1;
      }
      if (entry?.changeType == 'added') {
        this.dataSource = [];
        this.loadMore();
      }
      if (entry?.changeType == 'updated') {
        this.dataSource = this.dataSource?.map((x) => {
          if (x.postId == entry.data?.postId) {
            x.title = entry.data.title;
            x.content = entry.data.content;
            x.author = entry.data.author;
            x.reference = entry.data.reference;
            x.page = entry.data.page;
          }
          return x;
        });
      }
    });
  }

  subscribeImageChanges(): void {
    const imageExists$ = this.imagesStore.imageExists$;
    imageExists$.pipe(takeUntil(this.destroyed$)).subscribe((res) => {
      const exists = res.exists;

      this.dataSource?.forEach((post) => {
        if (res.ref?.type != 'post' || res.ref.id != post.postId) return;
        if (!this.queryStringToken) return;

        if (exists && post.imageFileName) return;
        if (!exists && !post.imageFileName) return;

        post.imageFileName = exists
          ? this.imagesStore.getImageUrl(
              res.ref.type,
              res.ref.id,
              this.queryStringToken,
              this.maxImageWidth,
              this.maxImageHeight
            )
          : null;
      });
    });
  }

  loadMore(): void {
    this.postsStore.loadPosts(this.dataSource?.length ?? 0, 10, this.query);
  }

  addPost(): void {
    this.editPost?.editPost(0);
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
