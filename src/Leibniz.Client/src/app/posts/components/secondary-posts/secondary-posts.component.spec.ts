import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondaryPostsComponent } from './secondary-posts.component';

describe('SecondaryPostsComponent', () => {
  let component: SecondaryPostsComponent;
  let fixture: ComponentFixture<SecondaryPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecondaryPostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecondaryPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
