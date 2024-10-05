import { Component, ViewChild } from '@angular/core';
import { DialogWindowComponent } from '../../common/components/dialog-window/dialog-window.component';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FieldValidationErrorsComponent } from '../../common/components/field-validation-errors/field-validation-errors.component';
import { Topic } from '../domain/topic';
import { TopicsStore } from '../services/topics.store';
import { EditTabType } from '../../relationships/components/domain/edit-tab-type';
import { MenuOption } from '../../common/domain/menu-option';
import { EditReferencesComponent } from '../../relationships/components/edit-references/edit-references.component';
import { TabsComponent } from "../../common/components/tabs/tabs.component";
import { EditImageComponent } from "../../images/components/edit-image/edit-image.component";

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
    EditImageComponent
],
  templateUrl: './edit-topic.component.html',
  styleUrl: './edit-topic.component.css',
})
export class EditTopicComponent {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;
  
  topicId = 0;
  showEdit = false;
  selectedTab: EditTabType = 'DETAIL';

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
    } else {
      this.topicsStore.addTopic(formValue);
    }
    this.editReferences?.saveReferences();
    this.showEdit = false;
  }
}
