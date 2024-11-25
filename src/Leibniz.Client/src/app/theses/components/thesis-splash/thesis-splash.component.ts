import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { EditThesisComponent } from '../edit-thesis/edit-thesis.component';
import { Thesis } from '../../domain/thesis';
import { ThesesStore } from '../../services/theses.store';
import { NewlineToBrPipe } from '../../../common/pipes/newline-to-br.pipe';
import { ImageBoxComponent } from '../../../common/components/image-box/image-box.component';
import { EditAuthorComponent } from '../../../authors/components/edit-author/edit-author.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thesis-splash',
  standalone: true,
  imports: [
    CommonModule,
    NewlineToBrPipe,
    ImageBoxComponent,
    EditThesisComponent,
  ],
  templateUrl: './thesis-splash.component.html',
  styleUrl: './thesis-splash.component.css',
})
export class ThesisSplashComponent implements OnInit {
  @ViewChild(EditThesisComponent) editThesis?: EditThesisComponent;
  @Input() thesisId: number = 0;
  thesis?: Thesis | null;

  constructor(private thesesStore: ThesesStore) {}

  ngOnInit(): void {
    this.thesesStore.getThesis(this.thesisId).subscribe((thesis) => {
      this.thesis = thesis;
    });
  }

  edit(): void {
    this.editThesis?.editThesis(this.thesisId);
  }
}
