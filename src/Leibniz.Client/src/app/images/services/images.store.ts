import { Injectable } from '@angular/core';
import { ErrorHandlerService } from '../../common/services/error-handler.service';
import { MessagesService } from '../../common/services/messages.service';
import { ImagesService } from './images.service';
import { EntityType } from '../../relationships/components/domain/entity-type';
import { BehaviorSubject, Observable } from 'rxjs';
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

  private changesSubject = new BehaviorSubject<ChangedEntity<RefItem> | null>(
    null
  );
  changes$: Observable<ChangedEntity<RefItem> | null> =
    this.changesSubject.asObservable();

  getImageUrl(type: EntityType, id: number, queryStringToken: string): string {
    return this.imagesService.getImageUrl(type, id, queryStringToken);
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
        this.changesSubject.next({
          changeType: 'added',
          data: { type, id },
          id: id,
        });
      });
  }

  removeImage(type: EntityType, id: number, queryStringToken: string): void {
    this.imagesService.removeImage(type, id, queryStringToken).subscribe(() => {
      this.messagesService.success(
        'The image was removed successfully',
        'Image deleted'
      );
      this.changesSubject.next({
        changeType: 'deleted',
        data: { type, id },
        id: id,
      });
    });
  }
}
