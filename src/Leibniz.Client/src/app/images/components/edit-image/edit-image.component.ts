import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { EntityType } from '../../../relationships/domain/entity-type';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImagesStore } from '../../services/images.store';
import { AuthService } from '../../../account/services/auth.service';
import { ReplaySubject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-edit-image',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
    ],
    templateUrl: './edit-image.component.html',
    styleUrl: './edit-image.component.css'
})
export class EditImageComponent implements AfterViewInit, OnDestroy {
  @Input() type?: EntityType;
  @Input() id?: number;
  imageUrl?: string;
  queryStringToken?: string | null;
  exists = false;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private imagesStore: ImagesStore,
    private authService: AuthService
  ) {
    this.subscribeImageExists();
  }

  ngAfterViewInit(): void {
    this.queryStringToken = this.authService.getQueryStringToken();

    if (!this.type || !this.id || !this.queryStringToken) return;

    this.imageUrl = this.imagesStore.getImageUrl(
      this.type,
      this.id,
      this.queryStringToken
    );

    this.imagesStore.imageExists(this.type, this.id, this.queryStringToken);
  }

  subscribeImageExists(): void {
    const exists$ = this.imagesStore.imageExists$;
    exists$.pipe(takeUntil(this.destroyed$)).subscribe((res) => {
      this.exists = res.exists;
    });
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

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
