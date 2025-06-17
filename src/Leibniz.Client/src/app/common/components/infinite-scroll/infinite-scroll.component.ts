import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
    selector: 'app-infinite-scroll',
    imports: [],
    templateUrl: './infinite-scroll.component.html',
    styleUrl: './infinite-scroll.component.css'
})
export class InfiniteScrollComponent implements AfterViewInit {
  @ViewChild('lastRow') lastRow!: ElementRef;
  @Output() loadMore = new EventEmitter<void>();

  ngAfterViewInit() {
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
}
