import { Component } from '@angular/core';
import { PageTitleComponent } from "../../../common/components/page-title/page-title.component";
import { NodeViewComponent } from "../../components/node-view/node-view.component";

@Component({
  selector: 'app-nodes',
  imports: [PageTitleComponent, NodeViewComponent],
  templateUrl: './nodes.component.html',
  styleUrl: './nodes.component.css'
})
export class NodesComponent {

}
