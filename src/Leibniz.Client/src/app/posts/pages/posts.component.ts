import { Component, OnDestroy, ViewChild } from '@angular/core';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { Post } from '../domain/post';
import { PostsStore } from '../services/posts.store';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import { CommonModule } from '@angular/common';
import { EditPostComponent } from '../components/edit-post/edit-post.component';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ImagesStore } from '../../images/services/images.store';
import { AuthService } from '../../account/services/auth.service';
import { InfiniteScrollComponent } from '../../common/components/infinite-scroll/infinite-scroll.component';
import { EntityBadgeComponent } from '../../shared/components/entity-badge/entity-badge.component';
import { FormsModule } from '@angular/forms';
import { ExpandableTextComponent } from '../../common/components/expandable-text/expandable-text.component';
import { DropdownComponent } from '../../common/components/dropdown/dropdown.component';
import { PageTitleComponent } from "../../common/components/page-title/page-title.component";
import utils from '../../common/services/utils';


@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    LoadingComponent,
    CommonModule,
    FormsModule,
    EditPostComponent,
    InfiniteScrollComponent,
    EntityBadgeComponent,
    ExpandableTextComponent,
    DropdownComponent,
    PageTitleComponent
],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css',
})
export class PostsPage implements OnDestroy {
  @ViewChild(EditPostComponent) editPost?: EditPostComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Post[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

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
      label: 'Copy To Clipboard',
      icon: 'fa fa-clipboard',
      action: (data: Post) => {
        utils.copyToClipboard(data.title + '\n' + data.content + '\n' + data.author);
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

  count?: number;
  loading?: boolean;
  queryStringToken: string | null;

  constructor(
    public postsStore: PostsStore,
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
    this.postsStore.listPosts(this.dataSource?.length ?? 0, 10);
  }

  loadDeepSearch(): void {
    this.dataSource = [];
    this.postsStore.listPosts(this.dataSource?.length ?? 0, 50);
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

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
