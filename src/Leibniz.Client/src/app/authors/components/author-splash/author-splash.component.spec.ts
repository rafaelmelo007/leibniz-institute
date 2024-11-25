import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorSplashComponent } from './author-splash.component';

describe('AuthorSplashComponent', () => {
  let component: AuthorSplashComponent;
  let fixture: ComponentFixture<AuthorSplashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorSplashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorSplashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
