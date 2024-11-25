import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaSplashComponent } from './area-splash.component';

describe('AreaSplashComponent', () => {
  let component: AreaSplashComponent;
  let fixture: ComponentFixture<AreaSplashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaSplashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaSplashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
