import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPeriodComponent } from './edit-period.component';

describe('EditPeriodComponent', () => {
  let component: EditPeriodComponent;
  let fixture: ComponentFixture<EditPeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPeriodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
