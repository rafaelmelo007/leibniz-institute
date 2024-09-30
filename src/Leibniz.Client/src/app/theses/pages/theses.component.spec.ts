import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThesesComponent } from './theses.component';

describe('ThesesComponent', () => {
  let component: ThesesComponent;
  let fixture: ComponentFixture<ThesesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThesesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThesesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
