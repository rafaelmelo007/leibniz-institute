import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { appSettings } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImagesService {
  constructor(private http: HttpClient) {}

  getImage(fileName: string): Observable<Blob> {
    return this.http.get(
      `${appSettings.baseUrl}/images/get-image?ImageFileName=${fileName}`,
      { responseType: 'blob' }
    );
  }
}
