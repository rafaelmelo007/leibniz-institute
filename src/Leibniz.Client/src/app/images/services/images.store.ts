import { Injectable } from '@angular/core';
import { ErrorHandlerService } from '../../common/services/error-handler.service';
import { MessagesService } from '../../common/services/messages.service';
import { ImagesService } from './images.service';
import { EntityType } from '../../relationships/domain/entity-type';
import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';
import { ChangedEntity } from '../../common/domain/changed-entity';
import { RefItem } from '../../common/domain/ref-item';

@Injectable({
  providedIn: 'root',
})
export class ImagesStore {
  constructor(
    private imagesService: ImagesService,
    private errorHandlerService: ErrorHandlerService,
    private messagesService: MessagesService
  ) {}

  private imageExistsSubject = new BehaviorSubject<{
    ref?: RefItem;
    exists: boolean;
  }>({ ref: undefined, exists: false });
  imageExists$: Observable<{
    ref?: RefItem;
    exists: boolean;
  }> = this.imageExistsSubject.asObservable();

  getImageUrl(
    type: EntityType,
    id: number,
    queryStringToken: string,
    maxWidth?: number,
    maxHeight?: number
  ): string {
    return this.imagesService.getImageUrl(
      type,
      id,
      queryStringToken,
      maxWidth,
      maxHeight
    );
  }

  imageExists(type: EntityType, id: number, queryStringToken: string): void {
    const result = this.imagesService
      .imageExists(type, id, queryStringToken)
      .pipe(
        catchError((err) => {
          this.errorHandlerService.onError(err);
          return of(false);
        })
      )
      .subscribe((exists) => {
        this.imageExistsSubject.next({ ref: { type: type, id: id }, exists });
      });
  }

  uploadImage(
    type: EntityType,
    id: number,
    file: File,
    queryStringToken: string
  ): void {
    this.imagesService
      .uploadImage(type, id, file, queryStringToken)
      .subscribe(() => {
        this.messagesService.success(
          'The image was uploaded successfully',
          'Image added'
        );
        this.imageExistsSubject.next({
          ref: { type: type, id: id },
          exists: true,
        });
      });
  }

  removeImage(type: EntityType, id: number, queryStringToken: string): void {
    this.imagesService.removeImage(type, id, queryStringToken).subscribe(() => {
      this.messagesService.success(
        'The image was removed successfully',
        'Image deleted'
      );
      this.imageExistsSubject.next({
        ref: { type: type, id: id },
        exists: false,
      });
    });
  }
}
