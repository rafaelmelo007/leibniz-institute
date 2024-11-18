import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainPostsComponent } from './main-posts.component';

describe('MainPostsComponent', () => {
  let component: MainPostsComponent;
  let fixture: ComponentFixture<MainPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainPostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
