import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicSplashComponent } from './topic-splash.component';

describe('TopicSplashComponent', () => {
  let component: TopicSplashComponent;
  let fixture: ComponentFixture<TopicSplashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicSplashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicSplashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
