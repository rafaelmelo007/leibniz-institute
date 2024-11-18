import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Link } from '../../domain/link';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LinksStore } from '../../services/links.store';
import { FieldValidationErrorsComponent } from '../../../common/components/field-validation-errors/field-validation-errors.component';
import { DialogWindowComponent } from '../../../common/components/dialog-window/dialog-window.component';
import { CommonModule } from '@angular/common';
import { EditTabType } from '../../../relationships/domain/edit-tab-type';
import { EditReferencesComponent } from '../../../relationships/components/edit-references/edit-references.component';
import { MenuOption } from '../../../common/domain/menu-option';
import { TabsComponent } from '../../../common/components/tabs/tabs.component';
import { EditImageComponent } from '../../../images/components/edit-image/edit-image.component';
import { MoveToComponent } from '../../../common/components/move-to/move-to.component';
import { ReplaySubject, takeUntil } from 'rxjs';

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
    EditImageComponent,
    MoveToComponent,
  ],
  templateUrl: './edit-link.component.html',
  styleUrl: './edit-link.component.css',
})
export class EditLinkComponent implements OnDestroy {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;

  linkId = 0;
  showEdit = false;
  selectedTab: EditTabType = 'DETAIL';
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

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
    {
      label: 'Move To',
      icon: 'fa fa-arrows',
      selected: true,
      action: () => {
        this.selectedTab = 'MOVE_TO';
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
      this.tabs = this.tabs.filter(
        (x) => x.label !== 'Image' && x.label !== 'Move To'
      );
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
      this.editReferences?.saveReferences();
      this.showEdit = false;
    } else {
      this.linksStore.changes$
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res) => {
          if (res?.changeType !== 'added' || res.ref.type !== 'link') return;

          this.editReferences?.saveReferences(res?.ref.id);
          this.ngOnDestroy();
          this.showEdit = false;
        });
      this.linksStore.addLink(formValue);
    }
  }

  getFilteredTabs(): MenuOption[] {
    return this.linkId == 0
      ? this.tabs.filter((x) => x.label !== 'Image' && x.label !== 'Move To')
      : this.tabs;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
