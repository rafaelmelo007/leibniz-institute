import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostSplashComponent } from './post-splash.component';

describe('PostSplashComponent', () => {
  let component: PostSplashComponent;
  let fixture: ComponentFixture<PostSplashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostSplashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostSplashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
