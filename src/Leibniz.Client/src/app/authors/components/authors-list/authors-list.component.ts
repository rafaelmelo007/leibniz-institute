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
import { EntityType } from '../../../relationships/domain/entity-type';
import { EditAuthorComponent } from '../edit-author/edit-author.component';
import { Author } from '../../domain/author';
import { filter, ReplaySubject, takeUntil } from 'rxjs';
import { AuthorsStore } from '../../services/authors.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authors-list',
  standalone: true,
  imports: [EditAuthorComponent],
  templateUrl: './authors-list.component.html',
  styleUrl: './authors-list.component.css',
})
export class AuthorsListComponent implements OnDestroy, OnInit, OnChanges {
  @ViewChild(EditAuthorComponent) editAuthor?: EditAuthorComponent;
  dataSource?: Author[];
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @Input() type?: EntityType;
  @Input() id?: number;
  count?: number;
  loading = true;
  @Output() selectAuthor = new EventEmitter();

  constructor(private authorsStore: AuthorsStore, private router: Router) {}

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
    this.loading = true;

    if (this.destroyed$) {
      this.destroyed$.next(true);
      this.destroyed$.complete();
    }

    this.authorsStore.primaryAuthors$
      .pipe(
        filter((x) => x?.type == this.type && x?.id == this.id),
        takeUntil(this.destroyed$)
      )
      .subscribe((authors) => {
        if (!authors || authors.index == 0) {
          this.dataSource = [];
        }
        if (!authors) {
          return;
        }
        this.dataSource = [...this.dataSource!, ...authors.data];
        this.count = authors.count;
        this.loading = false;
      });

    if (!this.type || !this.id) return;

    this.authorsStore.loadAuthors(
      this.dataSource?.length ?? 0,
      10,
      this.type,
      this.id,
      true
    );
  }

  edit(authorId: number): void {
    this.editAuthor?.editAuthor(authorId);
  }

  navigate(authorId: number): void {
    this.router.navigate([`/pages/authors/${authorId}`]);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
