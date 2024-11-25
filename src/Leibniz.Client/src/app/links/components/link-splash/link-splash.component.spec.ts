import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkSplashComponent } from './link-splash.component';

describe('LinkSplashComponent', () => {
  let component: LinkSplashComponent;
  let fixture: ComponentFixture<LinkSplashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkSplashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkSplashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
