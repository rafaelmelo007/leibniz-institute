import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { EditAuthorComponent } from '../edit-author/edit-author.component';
import { AuthorsStore } from '../../services/authors.store';
import { Author } from '../../domain/author';
import { ImageBoxComponent } from '../../../shared/components/image-box/image-box.component';
import { CommonModule } from '@angular/common';
import { AddBatchPostsComponent } from '../../../posts/components/add-batch-posts/add-batch-posts.component';
import { MenuOption } from '../../../common/domain/menu-option';
import { EditPostComponent } from '../../../posts/components/edit-post/edit-post.component';
import { DropdownComponent } from '../../../common/components/dropdown/dropdown.component';
import { ExpandableTextComponent } from '../../../common/components/expandable-text/expandable-text.component';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-author-splash',
  standalone: true,
  imports: [
    CommonModule,
    ImageBoxComponent,
    EditAuthorComponent,
    AddBatchPostsComponent,
    EditPostComponent,
    DropdownComponent,
    ExpandableTextComponent,
  ],
  templateUrl: './author-splash.component.html',
  styleUrl: './author-splash.component.css',
})
export class AuthorSplashComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(EditAuthorComponent) editAuthor?: EditAuthorComponent;
  @ViewChild(EditPostComponent) editPost?: EditPostComponent;
  @ViewChild(AddBatchPostsComponent) addBatchPosts?: AddBatchPostsComponent;
  @Input() authorId: number = 0;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  author?: Author | null;
  menuList?: MenuOption[] = [
    {
      label: 'Edit Author',
      icon: 'fa fa-edit',
      action: () => {
        this.editAuthor?.editAuthor(this.authorId);
      },
    },
    {
      label: 'Add Single Post',
      icon: 'fa fa-comment',
      action: () => {
        this.editPost?.editPost(0, 'author', this.authorId);
      },
    },
    {
      label: 'Add Many Posts',
      icon: 'fa fa-comments',
      action: () => {
        this.addBatchPosts?.show('author', this.authorId);
      },
    },
  ];

  constructor(private authorsStore: AuthorsStore) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['authorId']) {
      this.loadData();
    }
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.author = null;
    this.authorsStore
      .getAuthor(this.authorId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((author) => {
        this.author = author;
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
