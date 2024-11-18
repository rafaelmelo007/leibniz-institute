import { AfterViewInit, Component, Input } from '@angular/core';
import { EntityType } from '../../../relationships/domain/entity-type';
import { AuthService } from '../../../account/services/auth.service';
import { ImagesStore } from '../../../images/services/images.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-box.component.html',
  styleUrl: './image-box.component.css',
})
export class ImageBoxComponent implements AfterViewInit {
  @Input() type?: EntityType;
  @Input() id?: number;

  queryStringToken?: string | null;
  imageUrl?: string | null;
  maxImageWidth = 120 * 3;
  maxImageHeight = 140 * 3;

  constructor(
    private authService: AuthService,
    private imagesStore: ImagesStore
  ) {}

  ngAfterViewInit(): void {
    this.queryStringToken = this.authService.getQueryStringToken();

    if (!this.type || !this.id || !this.queryStringToken) return;

    this.imageUrl = this.imagesStore.getImageUrl(
      this.type,
      this.id,
      this.queryStringToken,
      this.maxImageWidth,
      this.maxImageHeight
    );
  }
}
