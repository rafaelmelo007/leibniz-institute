import { AfterViewInit, Component, Input } from '@angular/core';
import { EntityType } from '../../../relationships/domain/entity-type';
import { PostsStore } from '../../services/posts.store';
import { Post } from '../../domain/post';

@Component({
  selector: 'app-main-posts',
  standalone: true,
  imports: [],
  templateUrl: './main-posts.component.html',
  styleUrl: './main-posts.component.css',
})
export class MainPostsComponent implements AfterViewInit {
  @Input() type?: EntityType;
  @Input() id?: number;

  isExpanded = false;

  dataSource?: Post[];

  constructor(private postsStore: PostsStore) {
    this.postsStore.primaryPosts$.subscribe((posts) => {
      this.dataSource = posts?.data;
    });
  }

  ngAfterViewInit(): void {
    if (!this.type || !this.id) return;

    this.postsStore.loadPosts(0, 3, this.type, this.id, true);
  }
}
