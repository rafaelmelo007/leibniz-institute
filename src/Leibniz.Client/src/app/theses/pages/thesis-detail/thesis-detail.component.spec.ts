import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThesisDetailComponent } from './thesis-detail.component';

describe('ThesisDetailComponent', () => {
  let component: ThesisDetailComponent;
  let fixture: ComponentFixture<ThesisDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThesisDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThesisDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
