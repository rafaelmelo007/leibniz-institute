import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThesisSplashComponent } from './thesis-splash.component';

describe('ThesisSplashComponent', () => {
  let component: ThesisSplashComponent;
  let fixture: ComponentFixture<ThesisSplashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThesisSplashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThesisSplashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
