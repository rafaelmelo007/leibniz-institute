import { AfterViewInit, Component, Input } from '@angular/core';
import { EntityType } from '../../../relationships/components/domain/entity-type';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldValidationErrorsComponent } from '../../../common/components/field-validation-errors/field-validation-errors.component';
import { ImagesStore } from '../../services/images.store';
import { AuthService } from '../../../account/services/auth.service';

@Component({
  selector: 'app-edit-image',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FieldValidationErrorsComponent,
  ],
  templateUrl: './edit-image.component.html',
  styleUrl: './edit-image.component.css',
})
export class EditImageComponent implements AfterViewInit {
  @Input() type?: EntityType;
  @Input() id?: number;
  imageUrl?: string;
  queryStringToken?: string | null;

  constructor(
    private imagesStore: ImagesStore,
    private authService: AuthService
  ) {
    const changes$ = this.imagesStore.changes$;
    changes$.subscribe((res) => {
      if (
        res?.changeType == 'deleted' &&
        res.data?.type == this.type &&
        res.data?.id == this.id
      ) {
        this.imageUrl = undefined;
      } else if (
        res?.changeType == 'added' &&
        res.data?.type == this.type &&
        res.data?.id == this.id
      ) {
        if (!this.type || !this.id || !this.queryStringToken) return;
        this.imageUrl = this.imagesStore.getImageUrl(
          this.type,
          this.id,
          this.queryStringToken
        );
      }
    });
  }

  ngAfterViewInit(): void {
    this.queryStringToken = this.authService.getQueryStringToken();

    if (!this.type || !this.id || !this.queryStringToken) return;

    this.imageUrl = this.imagesStore.getImageUrl(
      this.type,
      this.id,
      this.queryStringToken
    );
  }

  uploadFile(event: any) {
    if (!event.target.files.length) return;

    const file: File = event.target.files[0];
    if (file) {
      this.uploadFileInternal(file);
    }
  }

  uploadFileInternal(file: File) {
    if (!this.type || !this.id) return;

    const queryStringToken = this.authService.getQueryStringToken();
    if (!queryStringToken) return;

    this.imagesStore.uploadImage(this.type, this.id, file, queryStringToken);
  }

  removeImage(): void {
    if (!this.type || !this.id || !this.queryStringToken) return;

    this.imagesStore.removeImage(this.type, this.id, this.queryStringToken);
  }
}