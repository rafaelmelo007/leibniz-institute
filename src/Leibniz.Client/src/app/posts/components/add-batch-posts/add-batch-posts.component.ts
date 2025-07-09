import { Component } from '@angular/core';
import { PostsStore } from '../../services/posts.store';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EntityType } from '../../../relationships/domain/entity-type';
import { DialogWindowComponent } from '../../../common/components/dialog-window/dialog-window.component';
import { CommonModule } from '@angular/common';
import { FieldValidationErrorsComponent } from '../../../common/components/field-validation-errors/field-validation-errors.component';

@Component({
  selector: 'app-add-batch-posts',
  imports: [
    DialogWindowComponent,
    CommonModule,
    ReactiveFormsModule,
    FieldValidationErrorsComponent,
  ],
  templateUrl: './add-batch-posts.component.html',
  styleUrl: './add-batch-posts.component.css',
})
export class AddBatchPostsComponent {
  type?: EntityType;
  id?: number;
  showWindow = false;

  editForm = new FormGroup({
    content: new FormControl('', [Validators.required]),
  });

  constructor(private postsStore: PostsStore) {}

  show(type: EntityType, id: number): void {
    this.type = type;
    this.id = id;
    this.showWindow = true;
  }

  addManyPosts(): void {
    if (!this.type || !this.id) return;

    this.editForm.markAllAsTouched();
    if (!this.editForm.valid) return;

    const { content } = this.editForm.value;
    if (!content) return;

    this.postsStore.addManyPosts(this.type, this.id, content);
  }
}
