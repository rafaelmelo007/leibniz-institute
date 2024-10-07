import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityType } from '../../relationships/components/domain/entity-type';
import { appSettings } from '../../../environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  constructor(private http: HttpClient) {}

  imageExists(
    type: EntityType,
    id: number,
    queryStringToken: string
  ): Observable<boolean> {
    const result = this.http
      .get<{ exists: boolean }>(
        `${appSettings.baseUrl}/images/image-exists-by-ref?Type=${this.toTypeId(
          type
        )}&Id=${id}&QueryStringToken=${queryStringToken}`
      )
      .pipe(map((res) => res.exists));
    return result;
  }

  getImageUrl(
    type: EntityType,
    id: number,
    queryStringToken: string,
    maxWidth?: number,
    maxHeight?: number
  ): string {
    const url = `${
      appSettings.baseUrl
    }/images/get-image-by-ref?Type=${this.toTypeId(
      type
    )}&Id=${id}&QueryStringToken=${queryStringToken}&Width=${
      maxWidth !== undefined ? maxWidth : ''
    }&Height=${maxHeight !== undefined ? maxHeight : ''}`;

    return url;
  }

  uploadImage(
    type: EntityType,
    id: number,
    file: File,
    queryStringToken: string
  ): Observable<boolean> {
    const url = `${
      appSettings.baseUrl
    }/images/upload-image-by-ref?Type=${this.toTypeId(
      type
    )}&Id=${id}&QueryStringToken=${queryStringToken}`;

    const formData: FormData = new FormData();
    formData.append('file', file);

    const result = this.http
      .post<{ success: boolean }>(url, formData)
      .pipe(map((res) => res.success));

    return result;
  }

  removeImage(
    type: EntityType,
    id: number,
    queryStringToken: string
  ): Observable<boolean> {
    const url = `${
      appSettings.baseUrl
    }/images/remove-image-by-ref?Type=${this.toTypeId(
      type
    )}&Id=${id}&QueryStringToken=${queryStringToken}`;

    const result = this.http
      .delete<{ success: boolean }>(url)
      .pipe(map((res) => res.success));

    return result;
  }

  toTypeId(type: string) {
    switch (type) {
      case 'post':
        return 1;
      case 'link':
        return 2;
      case 'area':
        return 3;
      case 'author':
        return 4;
      case 'book':
        return 5;
      case 'period':
        return 6;
      case 'thesis':
        return 7;
      case 'topic':
        return 8;
      case 'unknown':
        return 9;
    }
    return 9;
  }

  toEntityType(type: number): EntityType {
    switch (type) {
      case 1:
        return 'post';
      case 2:
        return 'link';
      case 3:
        return 'area';
      case 4:
        return 'author';
      case 5:
        return 'book';
      case 6:
        return 'period';
      case 7:
        return 'thesis';
      case 8:
        return 'topic';
      case 9:
        return 'unknown';
    }
    return 'unknown';
  }
}
