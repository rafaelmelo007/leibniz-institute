import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimaryPostsComponent } from './primary-posts.component';

describe('PrimaryPostsComponent', () => {
  let component: PrimaryPostsComponent;
  let fixture: ComponentFixture<PrimaryPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimaryPostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrimaryPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
