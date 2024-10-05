import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenuOption } from '../../domain/menu-option';

export interface Column {
  field: string;
  header: string;
  width: string;
  useHyperlink?: boolean;
  action?: (...args: any[]) => any;
  badgeConditions?: Record<string, string>;
  useBadge?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  sortColumn?: boolean;
  sortDirection?: 'asc' | 'desc';
  useGroupByFilter?: boolean;
  filterValue?: string;
  useImage?: boolean;
  maxImageWidth?: number;
  maxImageHeight?: number;
}

@Component({
  selector: 'app-grid-table',
  standalone: true,
  imports: [CommonModule, DropdownComponent, RouterLink, FormsModule],
  templateUrl: './grid-table.component.html',
  styleUrls: ['./grid-table.component.css'],
})
export class GridTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() dataSource?: any[];
  @Input() actions?: MenuOption[];
  @Input() actionsLabel?: string;
  @Input() columns: Column[] = [];
  @Input() searchTerm = '';
  @Input() showSearch = true;
  @Input() useInfiniteScroll = true;
  @Output() loadMore = new EventEmitter<void>();
  @Output() runDeepSearch = new EventEmitter<string>();
  searching = false;

  filteredData: any[] = [];

  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  groupByColumn?: Column | null;

  @ViewChildren('columnHeader') columnHeaders!: QueryList<ElementRef>;
  @ViewChild('lastRow') lastRow!: ElementRef;
  loading?: boolean;

  constructor(private decimalPipe: DecimalPipe) {}

  ngOnChanges(): void {
    this.filteredData = this.dataSource || [];
    if (
      !this.sortColumn &&
      this.filteredData &&
      this.columns.find((x) => x.sortColumn)
    ) {
      const sortedCol = this.columns.find((x) => x.sortColumn);
      this.sortData(sortedCol!.field);
    }
  }

  ngOnInit() {
    this.filteredData = this.dataSource || [];
    this.checkAndSortPredefinedColumn();
  }

  ngAfterViewInit() {
    if (!this.useInfiniteScroll) return;

    this.checkElementVisibility();
  }

  checkElementVisibility() {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        this.loadMore.emit();
      });
    });

    observer.observe(this.lastRow.nativeElement);
  }

  checkAndSortPredefinedColumn() {
    setTimeout(() => {
      const sortedCol = this.columns.find((col) => col.sortColumn);
      if (sortedCol) {
        this.sortData(
          sortedCol.field,
          sortedCol.sortDirection == 'desc' ? 'asc' : 'desc'
        );
      }
    }, 600);
  }

  filterData() {
    if (this.dataSource) {
      this.filteredData = this.dataSource.filter((item) => {
        const matchesSearchTerm =
          !this.searchTerm ||
          this.columns.some((column) =>
            item[column.field]
              ?.toString()
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase())
          );

        const matchesFilter = this.columns.every((column) => {
          if (column.useGroupByFilter && column.filterValue) {
            return item[column.field] === column.filterValue;
          }
          return true;
        });

        return matchesSearchTerm && matchesFilter;
      });
    }
  }

  getUniqueValues(field: string): string[] {
    const uniqueValues = new Set(
      this.dataSource?.map((item) => item[field]) || []
    );
    return Array.from(uniqueValues);
  }

  evaluateCondition(condition: string, value: any): boolean {
    const sanitizedCondition = condition.replace(
      'value',
      JSON.stringify(value)
    );

    try {
      return new Function('return ' + sanitizedCondition)();
    } catch (e) {
      console.error('Error evaluating condition:', e);
      return false;
    }
  }

  getFormattedValue(value: any, column: Column): string {
    const field = column.field;
    if (typeof value === 'number' && field.indexOf('price') !== -1) {
      return this.decimalPipe.transform(value, '1.2-2') || '';
    }

    if (column.useImage && !!value) {
      return `${value}&width=${column.maxImageWidth}&height=${column.maxImageHeight}`;
    }

    if (typeof value == 'string') return value.replace(/\n/g, '<br />');
    return value?.toString();
  }

  getBadgeClass(value: any, column: Column): string {
    if (!column.badgeConditions) return '';

    for (const [condition, badgeClass] of Object.entries(
      column.badgeConditions
    )) {
      try {
        const result = this.evaluateCondition(condition, value);
        if (result) {
          return badgeClass;
        }
      } catch (e) {
        console.error(`Error evaluating condition: ${condition}`, e);
      }
    }
    return '';
  }

  clickLink(row: any, column: Column): void {
    if (column.useHyperlink && column.action) {
      column.action(row);
    }
  }

  sortData(columnField: string, sortDir?: 'asc' | 'desc') {
    if (this.filteredData) {
      const direction =
        sortDir ?? this.sortColumn === columnField
          ? this.sortDirection === 'asc'
            ? 'desc'
            : 'asc'
          : 'asc';

      this.filteredData.sort((a, b) => {
        const aValue = a[columnField];
        const bValue = b[columnField];
        return (aValue > bValue ? 1 : -1) * (direction === 'asc' ? 1 : -1);
      });

      this.sortColumn = columnField;
      this.sortDirection = direction;
    }
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
  }

  deepSearch(): void {
    this.runDeepSearch.emit(this.searchTerm);
  }
}
