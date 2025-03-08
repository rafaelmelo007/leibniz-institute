import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { EditThesisComponent } from '../edit-thesis/edit-thesis.component';
import { Thesis } from '../../domain/thesis';
import { ThesesStore } from '../../services/theses.store';
import { NewlineToBrPipe } from '../../../common/pipes/newline-to-br.pipe';
import { ImageBoxComponent } from '../../../common/components/image-box/image-box.component';
import { CommonModule } from '@angular/common';
import { ReplaySubject, takeUntil } from 'rxjs';

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
export class ThesisSplashComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(EditThesisComponent) editThesis?: EditThesisComponent;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() thesisId: number = 0;
  thesis?: Thesis | null;

  constructor(private thesesStore: ThesesStore) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['thesisId']) {
      this.loadData();
    }
  }

  loadData(): void {
    this.thesis = null;
    this.thesesStore
      .getThesis(this.thesisId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((thesis) => {
        this.thesis = thesis;
      });
  }

  edit(): void {
    this.editThesis?.editThesis(this.thesisId);
  }

  ngOnDestroy(): void {
    this.destroyed$?.next(true);
    this.destroyed$?.complete();
  }
}
