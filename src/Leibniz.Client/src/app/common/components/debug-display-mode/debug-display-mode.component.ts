import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-breakpoint-indicator',
  standalone: true,
  template: `
    <div id="breakpoint-indicator">
      Current Breakpoint: <span>{{ breakpoint }}</span>
    </div>
  `,
  styles: [
    `
      #breakpoint-indicator {
        font-size: 1.2rem;
        font-weight: bold;
        padding: 10px;
      }
    `,
  ],
})
export class BreakpointIndicatorComponent implements OnInit, OnDestroy {
  breakpoint: string = '';
  private resizeListener: (() => void) | null = null;

  ngOnInit() {
    this.updateBreakpoint();
    this.resizeListener = () => this.updateBreakpoint();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  } 

  private updateBreakpoint() {
    const width = window.innerWidth;
    if (width < 576) this.breakpoint = 'xs';
    else if (width < 768) this.breakpoint = 'sm';
    else if (width < 992) this.breakpoint = 'md';
    else if (width < 1200) this.breakpoint = 'lg';
    else if (width < 1400) this.breakpoint = 'xl';
    else this.breakpoint = 'xxl';
  }
}
