import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookSplashComponent } from './book-splash.component';

describe('BookSplashComponent', () => {
  let component: BookSplashComponent;
  let fixture: ComponentFixture<BookSplashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookSplashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookSplashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
