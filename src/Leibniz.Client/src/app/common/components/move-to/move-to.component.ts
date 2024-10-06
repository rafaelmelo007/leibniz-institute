import { AfterViewInit, Component, Input } from '@angular/core';
import { EntityType } from '../../../relationships/components/domain/entity-type';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RelationshipsService } from '../../../relationships/services/relationships.service';

@Component({
  selector: 'app-move-to',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './move-to.component.html',
  styleUrl: './move-to.component.css',
})
export class MoveToComponent implements AfterViewInit {
  @Input() type?: EntityType;
  @Input() id?: number;

  fromType?: EntityType;
  toType?: EntityType;

  constructor(private relationshipsService: RelationshipsService) {}

  ngAfterViewInit(): void {
    this.fromType = this.type;
  }

  moveTo(): void {
    if (!this.fromType || !this.toType || !this.id) return;

    this.relationshipsService.moveTo(this.fromType, this.id, this.toType);
  }
}
