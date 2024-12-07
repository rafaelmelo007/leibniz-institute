import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { EditThesisComponent } from '../edit-thesis/edit-thesis.component';
import { Thesis } from '../../domain/thesis';
import { filter, ReplaySubject, takeUntil } from 'rxjs';
import { EntityType } from '../../../relationships/domain/entity-type';
import { ThesesStore } from '../../services/theses.store';

@Component({
  selector: 'app-thesis-list',
  standalone: true,
  imports: [],
  templateUrl: './thesis-list.component.html',
  styleUrl: './thesis-list.component.css',
})
export class ThesisListComponent implements OnDestroy, AfterViewInit {
  @ViewChild(EditThesisComponent) editThesis?: EditThesisComponent;
  dataSource?: Thesis[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() type?: EntityType;
  @Input() id?: number;
  count?: number;
  @Output() selectThesis = new EventEmitter();

  constructor(private thesesStore: ThesesStore) {
    this.thesesStore.primaryTheses$
      .pipe(
        filter((x) => x?.type == this.type && x?.id == this.id),
        takeUntil(this.destroyed$)
      )
      .subscribe((theses) => {
        if (!theses || theses.index == 0) {
          this.dataSource = [];
        }
        if (!theses) {
          return;
        }
        this.dataSource = [...this.dataSource!, ...theses.data];
        this.count = theses.count;
      });
  }

  ngAfterViewInit(): void {
    if (!this.type || !this.id) return;

    this.thesesStore.loadTheses(
      this.dataSource?.length ?? 0,
      10,
      this.type,
      this.id,
      true
    );
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
