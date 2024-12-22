import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBatchPostsComponent } from './add-batch-posts.component';

describe('AddBatchPostsComponent', () => {
  let component: AddBatchPostsComponent;
  let fixture: ComponentFixture<AddBatchPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBatchPostsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBatchPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
