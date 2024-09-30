import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReferencesComponent } from './edit-references.component';

describe('EditReferencesComponent', () => {
  let component: EditReferencesComponent;
  let fixture: ComponentFixture<EditReferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditReferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
