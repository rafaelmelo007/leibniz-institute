import { Component, Input, OnInit } from '@angular/core';
import { EntityType } from '../domain/entity-type';
import { RelationshipsService } from '../../services/relationships.service';
import { RelationshipListItem } from '../domain/relationship-list-item';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-references',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-references.component.html',
  styleUrl: './edit-references.component.css',
})
export class EditReferencesComponent implements OnInit {
  @Input() type?: EntityType;
  @Input() id?: number;

  selectedType = '';
  itemName = '';
  selectedId?: number = undefined;

  items?: RelationshipListItem[];
  searchResults?: RelationshipListItem[];
  searchSub?: Subscription;

  constructor(private relationshipsService: RelationshipsService) {}

  ngOnInit(): void {
    this.relationshipsService
      .loadRelationships(this.type!, this.id!)
      .subscribe((res) => {
        this.items = res.data;
      });
  }

  addItem(): void {
    const item = this.searchResults?.find((x) => x.id == this.selectedId);
    if (!item) return;

    if (!this.items) {
      this.items = [];
    }

    this.searchResults = [];
    this.itemName = '';
    this.selectedType = '';

    this.items?.push(item);
  }

  removeItem(item: RelationshipListItem): void {
    this.items = this.items?.filter(
      (x) => x.typeId !== item.typeId || x.id !== item.id
    );
  }

  searchItems(): void {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
    this.searchSub = this.relationshipsService
      .lookupEntities(<EntityType>this.selectedType, this.itemName)
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
