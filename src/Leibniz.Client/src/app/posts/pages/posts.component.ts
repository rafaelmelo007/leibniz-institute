import { Component, ViewChild } from '@angular/core';
import {
  Column,
  GridTableComponent,
} from '../../common/components/grid-table/grid-table.component';
import { Post } from '../domain/post';
import { PostsStore } from '../services/posts.store';
import { LoadingComponent } from '../../common/components/loading/loading.component';
import { CommonModule } from '@angular/common';
import { EditPostComponent } from '../components/edit-post.component';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    LoadingComponent,
    GridTableComponent,
    CommonModule,
    EditPostComponent,
  ],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.css',
})
export class PostsPage {
  @ViewChild(EditPostComponent) editPost?: EditPostComponent;
  @ViewChild(GridTableComponent) grid?: GridTableComponent;
  dataSource?: Post[];
  query = '';

  columns: Column[] = [
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

  constructor(private postsStore: PostsStore) {
    const posts$ = this.postsStore.posts$;
    posts$.subscribe((posts) => {
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

  loadMore(): void {
    this.postsStore.loadPosts(this.dataSource?.length ?? 0, 10, this.query);
  }

  loadDeepSearch(query: string): void {
    this.query = query;
    this.dataSource = [];
    this.postsStore.loadPosts(this.dataSource?.length ?? 0, 10, this.query);
  }

  addPost(): void {
    this.editPost?.editPost(0);
  }
}
