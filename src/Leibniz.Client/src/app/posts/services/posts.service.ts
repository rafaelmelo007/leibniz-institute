import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { Post } from '../domain/post';
import { ResultSet } from '../../common/domain/result-set';
import { EntityType } from '../../relationships/domain/entity-type';
import utils from '../../common/services/utils';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  constructor(private http: HttpClient) {}

  listPosts(
    index: number,
    limit: number,
    query: string
  ): Observable<ResultSet<Post>> {
    const result = this.http
      .get<ResultSet<Post>>(
        `${appSettings.baseUrl}/posts/list-posts?Index=${index}&Limit=${limit}&Query=${query}`
      )
      .pipe(map((res) => res));
    return result;
  }

  loadPosts(
    index: number,
    limit: number,
    type: EntityType,
    id: number,
    primary: boolean,
    filterType?: EntityType,
    filterId?: number
  ): Observable<ResultSet<Post>> {
    let url = `${
      appSettings.baseUrl
    }/posts/search-posts?Index=${index}&Limit=${limit}&Type=${utils.toTypeId(
      type
    )}&Id=${id}&Primary=${primary}`;
    if (filterType != null) {
      url += `&FilterType=${utils.toTypeId(filterType)}&FilterId=${filterId}`;
    }
    const result = this.http.get<ResultSet<Post>>(url).pipe(map((res) => res));
    return result;
  }

  getPost(postId: number): Observable<Post> {
    const result = this.http
      .get<{ post: Post }>(
        `${appSettings.baseUrl}/posts/get-post?PostId=${postId}`
      )
      .pipe(map((res) => res.post));
    return result;
  }

  addManyPosts(type: EntityType, id: number, content: string): Observable<number[]> {
    const result = this.http
      .post<{ postIds: number[] }>(
        `${appSettings.baseUrl}/posts/create-batch-posts`,
        { type, id, content }
      )
      .pipe(map((res) => res.postIds));
    return result;
  }

  addPost(post: Post): Observable<number> {
    const result = this.http
      .post<{ postId: number }>(
        `${appSettings.baseUrl}/posts/create-post`,
        post
      )
      .pipe(map((res) => res.postId));
    return result;
  }

  updatePost(post: Post): Observable<number> {
    const result = this.http
      .put<number>(`${appSettings.baseUrl}/posts/update-post`, post)
      .pipe(map((res) => res));
    return result;
  }

  deletePost(postId: number): Observable<number> {
    const result = this.http
      .delete<number>(
        `${appSettings.baseUrl}/posts/remove-post?PostId=${postId}`
      )
      .pipe(map((res) => res));
    return result;
  }
}
