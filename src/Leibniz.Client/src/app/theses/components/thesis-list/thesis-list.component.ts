import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { EditThesisComponent } from '../edit-thesis/edit-thesis.component';
import { Thesis } from '../../domain/thesis';
import { filter, ReplaySubject, takeUntil } from 'rxjs';
import { EntityType } from '../../../relationships/domain/entity-type';
import { ThesesStore } from '../../services/theses.store';
import { Router } from '@angular/router';

@Component({
    selector: 'app-thesis-list',
    imports: [EditThesisComponent],
    templateUrl: './thesis-list.component.html',
    styleUrl: './thesis-list.component.css'
})
export class ThesisListComponent implements OnDestroy, OnInit, OnChanges {
  @ViewChild(EditThesisComponent) editThesis?: EditThesisComponent;
  dataSource?: Thesis[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() type?: EntityType;
  @Input() id?: number;
  count?: number;
  @Output() selectThesis = new EventEmitter();

  constructor(private thesesStore: ThesesStore, private router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.loadData();
    }
  }

  loadData(): void {
    this.dataSource = [];

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

    if (!this.type || !this.id) return;

    this.thesesStore.loadTheses(
      this.dataSource?.length ?? 0,
      10,
      this.type,
      this.id,
      true
    );
  }

  edit(thesisId: number): void {
    this.editThesis?.editThesis(thesisId);
  }

  navigate(thesisId: number): void {
    this.router.navigate([`/pages/theses/${thesisId}`]);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
