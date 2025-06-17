import { Component, Input } from '@angular/core';
import { EntityType } from '../../../relationships/domain/entity-type';

@Component({
    selector: 'app-chronology',
    imports: [],
    templateUrl: './chronology.component.html',
    styleUrl: './chronology.component.css'
})
export class ChronologyComponent {
  @Input() type?: EntityType;
  @Input() id?: number;

}
