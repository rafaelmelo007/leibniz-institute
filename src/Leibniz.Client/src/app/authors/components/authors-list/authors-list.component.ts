import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { EntityType } from '../../../relationships/domain/entity-type';
import { EditAuthorComponent } from '../edit-author/edit-author.component';
import { Author } from '../../domain/author';
import { ReplaySubject, takeUntil } from 'rxjs';
import { AuthorsStore } from '../../services/authors.store';

@Component({
  selector: 'app-authors-list',
  standalone: true,
  imports: [],
  templateUrl: './authors-list.component.html',
  styleUrl: './authors-list.component.css',
})
export class AuthorsListComponent implements OnDestroy, AfterViewInit {
  @ViewChild(EditAuthorComponent) editAuthor?: EditAuthorComponent;
  dataSource?: Author[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() type?: EntityType;
  @Input() id?: number;
  count?: number;
  @Output() selectAuthor = new EventEmitter();

  constructor(private authorsStore: AuthorsStore) {
    this.authorsStore.primaryAuthors$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((authors) => {
        if (!authors || authors.index == 0) {
          this.dataSource = [];
        }
        if (!authors) {
          return;
        }
        this.dataSource = [...this.dataSource!, ...authors.data];
        this.count = authors.count;
      });
  }

  ngAfterViewInit(): void {
    if (!this.type || !this.id) return;

    this.authorsStore.loadAuthors(
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
