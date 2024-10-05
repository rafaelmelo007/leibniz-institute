import { Component, ViewChild } from '@angular/core';
import { Link } from '../domain/link';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LinksStore } from '../services/links.store';
import { FieldValidationErrorsComponent } from '../../common/components/field-validation-errors/field-validation-errors.component';
import { DialogWindowComponent } from '../../common/components/dialog-window/dialog-window.component';
import { CommonModule } from '@angular/common';
import { EditTabType } from '../../relationships/components/domain/edit-tab-type';
import { EditReferencesComponent } from "../../relationships/components/edit-references/edit-references.component";
import { MenuOption } from '../../common/domain/menu-option';
import { TabsComponent } from "../../common/components/tabs/tabs.component";
import { EditImageComponent } from "../../images/components/edit-image/edit-image.component";

@Component({
  selector: 'app-edit-link',
  standalone: true,
  imports: [
    FieldValidationErrorsComponent,
    DialogWindowComponent,
    CommonModule,
    ReactiveFormsModule,
    EditReferencesComponent,
    TabsComponent,
    EditImageComponent
],
  templateUrl: './edit-link.component.html',
  styleUrl: './edit-link.component.css',
})
export class EditLinkComponent {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;
  
  linkId = 0;
  showEdit = false;
  selectedTab: EditTabType = 'DETAIL';

  editForm = new FormGroup({
    linkId: new FormControl(0, []),
    name: new FormControl('', [Validators.required]),
    content: new FormControl('', []),
    url: new FormControl('', [Validators.required]),
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

  constructor(private linksStore: LinksStore) {}

  editLink(linkId: number): void {
    this.showEdit = true;
    this.linkId = linkId;

    if (linkId == 0) {
      const link = {
        linkId: 0,
        name: '',
        url: '',
        content: '',
      } as Link;
      this.editForm.patchValue(link);
      return;
    }

    this.linksStore.getLink(linkId).subscribe((link) => {
      if (!link) return;
      this.editForm.patchValue(link);
    });
  }

  saveLink(): void {
    this.editForm.markAllAsTouched();
    if (!this.editForm.valid) return;

    const formValue = this.editForm.value as Link;
    if (formValue.linkId) {
      this.linksStore.updateLink(formValue);
    } else {
      this.linksStore.addLink(formValue);
    }
    this.editReferences?.saveReferences();
    this.showEdit = false;
  }
}
