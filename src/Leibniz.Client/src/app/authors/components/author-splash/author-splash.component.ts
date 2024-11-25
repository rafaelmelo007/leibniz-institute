import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { EditAuthorComponent } from '../edit-author/edit-author.component';
import { AuthorsStore } from '../../services/authors.store';
import { Author } from '../../domain/author';
import { NewlineToBrPipe } from '../../../common/pipes/newline-to-br.pipe';
import { ImageBoxComponent } from '../../../common/components/image-box/image-box.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-author-splash',
  standalone: true,
  imports: [
    CommonModule,
    NewlineToBrPipe,
    ImageBoxComponent,
    EditAuthorComponent,
  ],
  templateUrl: './author-splash.component.html',
  styleUrl: './author-splash.component.css',
})
export class AuthorSplashComponent implements OnInit {
  @ViewChild(EditAuthorComponent) editAuthor?: EditAuthorComponent;
  @Input() authorId: number = 0;
  author?: Author | null;

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
