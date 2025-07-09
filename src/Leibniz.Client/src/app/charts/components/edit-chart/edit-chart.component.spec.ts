import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChartComponent } from './edit-chart.component';

describe('EditChartComponent', () => {
  let component: EditChartComponent;
  let fixture: ComponentFixture<EditChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
