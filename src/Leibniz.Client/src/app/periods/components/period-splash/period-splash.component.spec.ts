import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodSplashComponent } from './period-splash.component';

describe('PeriodSplashComponent', () => {
  let component: PeriodSplashComponent;
  let fixture: ComponentFixture<PeriodSplashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodSplashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodSplashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
