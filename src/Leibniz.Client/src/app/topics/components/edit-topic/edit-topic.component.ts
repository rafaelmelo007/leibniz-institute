import { Component, OnDestroy, ViewChild } from '@angular/core';
import { DialogWindowComponent } from '../../../common/components/dialog-window/dialog-window.component';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FieldValidationErrorsComponent } from '../../../common/components/field-validation-errors/field-validation-errors.component';
import { Topic } from '../../domain/topic';
import { TopicsStore } from '../../services/topics.store';
import { EditTabType } from '../../../relationships/domain/edit-tab-type';
import { MenuOption } from '../../../common/domain/menu-option';
import { EditReferencesComponent } from '../../../relationships/components/edit-references/edit-references.component';
import { TabsComponent } from '../../../common/components/tabs/tabs.component';
import { EditImageComponent } from '../../../images/components/edit-image/edit-image.component';
import { MoveToComponent } from '../../../common/components/move-to/move-to.component';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-topic',
  standalone: true,
  imports: [
    DialogWindowComponent,
    CommonModule,
    ReactiveFormsModule,
    FieldValidationErrorsComponent,
    EditReferencesComponent,
    TabsComponent,
    EditImageComponent,
    MoveToComponent,
  ],
  templateUrl: './edit-topic.component.html',
  styleUrl: './edit-topic.component.css',
})
export class EditTopicComponent implements OnDestroy {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;

  topicId = 0;
  showEdit = false;
  selectedTab: EditTabType = 'DETAIL';
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  editForm = new FormGroup({
    topicId: new FormControl(0, []),
    name: new FormControl('', [Validators.required]),
    content: new FormControl('', []),
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

  constructor(private topicsStore: TopicsStore) {}

  editTopic(topicId: number): void {
    this.showEdit = true;
    this.topicId = topicId;

    if (topicId == 0) {
      const topic = {
        topicId: 0,
        name: '',
        content: '',
      } as Topic;
      this.tabs = this.tabs.filter(
        (x) => x.label !== 'Image' && x.label !== 'Move To'
      );
      this.editForm.patchValue(topic);
      return;
    }

    this.topicsStore.getTopic(topicId).subscribe((topic) => {
      if (!topic) return;
      this.editForm.patchValue(topic);
    });
  }

  saveTopic(): void {
    this.editForm.markAllAsTouched();
    if (!this.editForm.valid) return;

    const formValue = this.editForm.value as Topic;
    if (formValue.topicId) {
      this.topicsStore.updateTopic(formValue);
      this.editReferences?.saveReferences();
      this.showEdit = false;
    } else {
      this.topicsStore.changes$
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res) => {
          if (res?.changeType !== 'added' || res.ref.type !== 'topic') return;

          this.editReferences?.saveReferences(res?.ref.id);
          this.ngOnDestroy();
          this.showEdit = false;
        });
      this.topicsStore.addTopic(formValue);
    }
  }

  getFilteredTabs(): MenuOption[] {
    return this.topicId == 0
      ? this.tabs.filter((x) => x.label !== 'Image' && x.label !== 'Move To')
      : this.tabs;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
