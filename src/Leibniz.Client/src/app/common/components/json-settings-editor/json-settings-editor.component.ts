import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-json-settings-editor',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './json-settings-editor.component.html',
  styleUrl: './json-settings-editor.component.css',
})
export class JsonSettingsEditorComponent implements OnChanges, OnInit {
  @Input() jsonString: string | null | undefined = ''; // Input property to receive the JSON string
  @Output() settingsChange = new EventEmitter<any>(); // Output property to emit the updated settings

  settingsForm: FormGroup = new FormGroup({}); // Form group for dynamic controls
  displayedFields?: string[];

  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialize the settingsForm in ngOnInit to ensure fb is initialized
    this.settingsForm = this.fb.group({});
    this.parseJsonAndCreateFormControls(this.jsonString ?? '');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.displayedFields) return;
    if (changes['jsonString'] && changes['jsonString'].currentValue) {
      this.parseJsonAndCreateFormControls(changes['jsonString'].currentValue);
    }
  }

  parseJsonAndCreateFormControls(jsonString: string): void {
    let jsonObject: any;

    try {
      if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
        jsonObject = JSON.parse(JSON.parse(jsonString)); // Parse the JSON string
      } else {
        jsonObject = JSON.parse(jsonString); // Parse the JSON string
      }
    } catch {
      console.error('Invalid JSON string');
      return;
    }

    if (
      !this.arraysAreEqual(this.displayedFields, Object.keys(jsonObject)) ||
      Object.keys(this.settingsForm.controls).length === 0
    ) {
      this.settingsForm = this.fb.group({}); // Reset the form group

      this.displayedFields = Object.keys(jsonObject);

      Object.keys(jsonObject).forEach((key) => {
        this.settingsForm.addControl(
          key,
          this.fb.control(jsonObject[key], Validators.required)
        );
      });

      this.cd.detectChanges();
    }

    this.settingsForm.valueChanges.subscribe((value) => {
      this.settingsChange.emit(value); // Emit the updated settings
    });
  }

  arraysAreEqual(arr1?: string[], arr2?: string[]) {
    if (!arr1) return false;
    if (!arr2) return false;

    // Step 1: Check if they have the same length
    if (arr1.length !== arr2.length) {
      return false;
    }

    // Step 2: Sort both arrays
    const sortedArr1 = arr1.slice().sort();
    const sortedArr2 = arr2.slice().sort();

    // Step 3: Compare each element
    for (let i = 0; i < sortedArr1.length; i++) {
      if (sortedArr1[i] !== sortedArr2[i]) {
        return false;
      }
    }

    // If all elements are equal, return true
    return true;
  }
}
