import { Component, OnDestroy, ViewChild } from '@angular/core';
import { DialogWindowComponent } from '../../common/components/dialog-window/dialog-window.component';
import { CommonModule } from '@angular/common';
import { FieldValidationErrorsComponent } from '../../common/components/field-validation-errors/field-validation-errors.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Post } from '../domain/post';
import { PostsStore } from '../services/posts.store';
import { TabsComponent } from '../../common/components/tabs/tabs.component';
import { MenuOption } from '../../common/domain/menu-option';
import { EditReferencesComponent } from '../../relationships/components/edit-references/edit-references.component';
import { EditTabType } from '../../relationships/components/domain/edit-tab-type';
import { EditImageComponent } from '../../images/components/edit-image/edit-image.component';
import { MoveToComponent } from '../../common/components/move-to/move-to.component';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [
    DialogWindowComponent,
    CommonModule,
    ReactiveFormsModule,
    FieldValidationErrorsComponent,
    TabsComponent,
    EditReferencesComponent,
    EditImageComponent,
    MoveToComponent,
  ],
  templateUrl: './edit-Post.component.html',
  styleUrl: './edit-Post.component.css',
})
export class EditPostComponent implements OnDestroy {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;

  postId = 0;
  showEdit = false;
  selectedTab: EditTabType = 'DETAIL';
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  editForm = new FormGroup({
    postId: new FormControl(0, []),
    title: new FormControl('', [Validators.required]),
    content: new FormControl('', []),
    author: new FormControl('', [Validators.required]),
    bookId: new FormControl(0, []),
    page: new FormControl(0, []),
    reference: new FormControl('', []),
  });

  tabs: MenuOption[] = [
    {
      label: 'Details',
      icon: 'fa fa-window-maximize',
      selected: true,
      action: () => {
        this.selectedTab = 'DETAIL';
      },
    },
    {
      label: 'References',
      icon: 'fa fa-link',
      selected: true,
      action: () => {
        this.selectedTab = 'REFERENCES';
      },
    },
    {
      label: 'Image',
      icon: 'fa fa-image',
      selected: true,
      action: () => {
        this.selectedTab = 'IMAGE';
      },
    },
    {
      label: 'Move To',
      icon: 'fa fa-arrows',
      selected: true,
      action: () => {
        this.selectedTab = 'MOVE_TO';
      },
    },
  ];

  constructor(private postsStore: PostsStore) {}

  editPost(postId: number): void {
    this.showEdit = true;
    this.postId = postId;

    if (postId == 0) {
      const post = {
        postId: 0,
        title: '',
        author: '',
        content: '',
      } as Post;
      this.tabs = this.tabs.filter(
        (x) => x.label !== 'Image' && x.label !== 'Move To'
      );
      this.editForm.patchValue(post);
      return;
    }

    this.postsStore.getPost(postId).subscribe((post) => {
      if (!post) return;
      this.editForm.patchValue(post);
    });
  }

  savePost(): void {
    this.editForm.markAllAsTouched();
    if (!this.editForm.valid) return;

    const formValue = this.editForm.value as Post;
    if (formValue.postId) {
      this.postsStore.updatePost(formValue);
      this.editReferences?.saveReferences();
      this.showEdit = false;
    } else {
      this.postsStore.changes$
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res) => {
          if (res?.changeType !== 'added' || res.ref.type !== 'post') return;

          this.editReferences?.saveReferences(res?.ref.id);
          this.ngOnDestroy();
          this.showEdit = false;
        });
      this.postsStore.addPost(formValue);
    }
  }

  getFilteredTabs(): MenuOption[] {
    return this.postId == 0
      ? this.tabs.filter((x) => x.label !== 'Image' && x.label !== 'Move To')
      : this.tabs;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
