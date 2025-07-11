import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EntityType } from '../../domain/entity-type';
import { RelationshipsService } from '../../services/relationships.service';
import { RelationshipListItem } from '../../domain/relationship-list-item';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-references',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-references.component.html',
  styleUrl: './edit-references.component.css',
})
export class EditReferencesComponent implements OnInit {
  @Input() type?: EntityType;
  @Input() id?: number;

  @Input() addType?: EntityType;
  @Input() addId?: number;
  @Output() changeList = new EventEmitter<boolean>();

  selectedType = '';
  itemName = '';
  selectedId?: number = undefined;
  isPrimary = false;
  loading = false;

  items?: RelationshipListItem[];
  searchResults?: RelationshipListItem[];
  searchSub?: Subscription;

  constructor(private relationshipsService: RelationshipsService) {}

  ngOnInit(): void {
    this.loading = true;
    this.openReferences(this.type!, this.id!, this.addType, this.addId);
  }

  openReferences(
    type: EntityType,
    id: number,
    addType?: EntityType,
    addId?: number
  ): void {
    this.items = [];
    this.relationshipsService
      .loadRelationships(type, id, addType, addId)
      .subscribe((res) => {
        this.items = res.data;
        this.loading = false;
      });
  }

  addItem(): void {
    const item = this.searchResults?.find((x) => x.id == this.selectedId);
    if (!item) return;

    if (!this.items) {
      this.items = [];
    }

    item.isPrimary = this.isPrimary;

    this.searchResults = [];
    this.itemName = '';
    this.selectedType = '';
    this.isPrimary = false;

    this.items?.push(item);

    this.changeList.emit(true);
  }

  removeItem(item: RelationshipListItem): void {
    this.items = this.items?.filter(
      (x) => x.type !== item.type || x.id !== item.id
    );
    this.changeList.emit(true);
  }

  searchItems(): void {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    this.searchSub = this.relationshipsService
      .lookupEntities(<EntityType>this.selectedType, this.itemName) // eslint-disable-line
      .subscribe((res) => {
        this.searchResults = res.data;
      });
  }

  saveReferences(id?: number): void {
    this.relationshipsService.saveRelationships(
      this.type!,
      id ?? this.id!,
      this.items ?? []
    );
  }
}
