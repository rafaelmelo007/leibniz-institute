import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EntityType } from '../../relationships/domain/entity-type';
import { appSettings } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import utils from '../../common/services/utils';

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
        `${appSettings.baseUrl}/images/image-exists-by-ref?Type=${utils.toTypeId(
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
    }/images/get-image-by-ref?Type=${utils.toTypeId(
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
    }/images/upload-image-by-ref?Type=${utils.toTypeId(
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
    }/images/remove-image-by-ref?Type=${utils.toTypeId(
      type
    )}&Id=${id}&QueryStringToken=${queryStringToken}`;

    const result = this.http
      .delete<{ success: boolean }>(url)
      .pipe(map((res) => res.success));

    return result;
  }
}
