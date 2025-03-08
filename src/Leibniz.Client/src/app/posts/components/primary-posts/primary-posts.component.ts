import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { EntityType } from '../../../relationships/domain/entity-type';
import { PostsStore } from '../../services/posts.store';
import { Post } from '../../domain/post';
import { filter, ReplaySubject, takeUntil } from 'rxjs';
import { EditPostComponent } from '../edit-post/edit-post.component';
import { DropdownComponent } from '../../../common/components/dropdown/dropdown.component';
import utils from '../../../common/services/utils';

@Component({
  selector: 'app-primary-posts',
  standalone: true,
  imports: [EditPostComponent, DropdownComponent],
  templateUrl: './primary-posts.component.html',
  styleUrl: './primary-posts.component.css',
})
export class PrimaryPostsComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(EditPostComponent) editPost?: EditPostComponent;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  @Input() type?: EntityType;
  @Input() id?: number;

  isExpanded = false;

  dataSource?: Post[];

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

  constructor(private postsStore: PostsStore) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.loadData();
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.dataSource = [];

    this.postsStore.primaryPosts$
      .pipe(
        filter((x) => x?.type == this.type && x?.id == this.id),
        takeUntil(this.destroyed$)
      )
      .subscribe((posts) => {
        this.dataSource = posts?.data;
      });

    if (!this.type || !this.id) return;

    this.postsStore.loadPosts(0, 3, this.type, this.id, true);
  }

  editPostLink(postId: number): void {
    this.editPost?.editPost(postId);
  }

  deletePost(postId: number): void {
    if (!confirm('You are about to delete this post. Do you want to continue?'))
      return;
    this.postsStore.deletePost(postId);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
