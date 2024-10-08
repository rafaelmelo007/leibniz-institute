import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAreaComponent } from './edit-area.component';

describe('EditAreaComponent', () => {
  let component: EditAreaComponent;
  let fixture: ComponentFixture<EditAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAreaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
