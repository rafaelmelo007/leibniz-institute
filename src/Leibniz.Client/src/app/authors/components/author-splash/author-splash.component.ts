import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { EditAuthorComponent } from '../edit-author/edit-author.component';
import { AuthorsStore } from '../../services/authors.store';
import { Author } from '../../domain/author';
import { NewlineToBrPipe } from '../../../common/pipes/newline-to-br.pipe';
import { ImageBoxComponent } from '../../../common/components/image-box/image-box.component';
import { CommonModule } from '@angular/common';
import { AddBatchPostsComponent } from "../../../posts/components/add-batch-posts/add-batch-posts.component";
import { MenuOption } from '../../../common/domain/menu-option';
import { EditPostComponent } from "../../../posts/components/edit-post/edit-post.component";
import { DropdownComponent } from "../../../common/components/dropdown/dropdown.component";

@Component({
  selector: 'app-author-splash',
  standalone: true,
  imports: [
    CommonModule,
    NewlineToBrPipe,
    ImageBoxComponent,
    EditAuthorComponent,
    AddBatchPostsComponent,
    EditPostComponent,
    DropdownComponent
],
  templateUrl: './author-splash.component.html',
  styleUrl: './author-splash.component.css',
})
export class AuthorSplashComponent implements OnInit {
  @ViewChild(EditAuthorComponent) editAuthor?: EditAuthorComponent;
  @ViewChild(EditPostComponent) editPost?: EditPostComponent;
  @ViewChild(AddBatchPostsComponent) addBatchPosts?: AddBatchPostsComponent;
  @Input() authorId: number = 0;
  author?: Author | null;
  menuList?: MenuOption[] = [
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

  ngOnInit(): void {
    this.authorsStore.getAuthor(this.authorId).subscribe((author) => {
      this.author = author;
    });
  }

  edit(): void {
    this.editAuthor?.editAuthor(this.authorId);
  }
}
