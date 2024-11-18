import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditThesisComponent } from './edit-thesis.component';

describe('EditThesisComponent', () => {
  let component: EditThesisComponent;
  let fixture: ComponentFixture<EditThesisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditThesisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditThesisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
