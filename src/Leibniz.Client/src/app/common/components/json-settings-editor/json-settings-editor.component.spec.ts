import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonSettingsEditorComponent } from './json-settings-editor.component';

describe('JsonSettingsEditorComponent', () => {
  let component: JsonSettingsEditorComponent;
  let fixture: ComponentFixture<JsonSettingsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonSettingsEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonSettingsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
