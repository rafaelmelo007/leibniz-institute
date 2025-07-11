import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { NetworkComponent } from '../../../network/components/network/network.component';
import { NodesService } from '../../services/nodes.service';
import { FieldValidationErrorsComponent } from '../../../common/components/field-validation-errors/field-validation-errors.component';
import { EditReferencesComponent } from '../../../relationships/components/edit-references/edit-references.component';
import { NetworkNode } from '../../../network/domain/network-node';
import { Node } from '../../domain/node';

@Component({
  selector: 'app-node-view',
  standalone: true,
  imports: [
    CommonModule,
    NetworkComponent,
    FieldValidationErrorsComponent,
    EditReferencesComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './node-view.component.html',
  styleUrl: './node-view.component.css',
})
export class NodeViewComponent implements AfterViewInit {
  @ViewChild(EditReferencesComponent) editReferences?: EditReferencesComponent;
  @ViewChild('chart') chart!: NetworkComponent;

  @Input() nodeId?: number;
  @Input() nodeName?: string;

  private activeNodeId?: number;

  breadcrumbs: NetworkNode[] = [];

  editNodeForm = new FormGroup({
    nodeId: new FormControl<number>(0),
    name: new FormControl<string>('', Validators.required),
    content: new FormControl<string>(''),
  });

  constructor(
    private nodesService: NodesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.activeNodeId = this.nodeId;
    const rootNode: NetworkNode = {
      id: this.activeNodeId ?? -1,
      label: this.nodeName ?? 'Root',
      x: 0,
      y: 0,
      fixed: false,
    };

    this.breadcrumbs = [rootNode];

    this.openChart(rootNode, true);
  }

  public navigateToBreadcrumb(index: number): void {
    const targetNode = this.breadcrumbs[index];

    this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
    this.chart.selectedNode = null;

    this.editReferences?.openReferences('chart', targetNode.id);

    this.openChart(targetNode, index == 0);
  }

  public enableDeleteNodeKey(enabled: boolean): void {
    this.chart.deleteEnabled = enabled;

    const updateNodeId = this.activeNodeId ?? -1;

    this.nodesService
      .updateNodeChart({
        nodeId: updateNodeId,
        chartData: this.chart.graphJson,
      })
      .subscribe();
  }

  deleteNode(node: NetworkNode): void {
    if (node.id > 0) {
      this.nodesService.deleteNodeBranch(node.id).subscribe();
    }
    this.editNodeForm.patchValue({ name: '' });
    this.updateChartInDatabase();
  }

  private previousNode?: NetworkNode | null;

  selectNode(node: NetworkNode | null): void {
    if (node == this.previousNode) return;

    if (!node) {
      this.editNodeForm.patchValue({
        nodeId: -1,
        name: '',
      });
      this.editReferences?.openReferences('chart', -1);
      this.previousNode = node;
      return;
    }

    this.editNodeForm.patchValue({
      nodeId: node.id,
      name: node.label,
    });

    this.editReferences?.openReferences('chart', node.id);

    this.previousNode = node;

    this.updateChartInDatabase();
  }

  updateChartInDatabase(): void {
    const updateNodeId = this.activeNodeId ?? -1;

    this.nodesService
      .updateNodeChart({
        nodeId: updateNodeId,
        chartData: this.chart.graphJson,
      })
      .subscribe();
  }

  openChart(rootNode: NetworkNode, isRoot: boolean): void {
    this.loadNodeAndChart(rootNode, undefined, isRoot, true);
  }

  createOrOpenChildNode(
    childNode: NetworkNode | null,
    openChart: boolean = true,
    onResult?: (res: Node) => void
  ): void {
    if (!childNode) return;

    this.loadNodeAndChart(
      childNode,
      this.activeNodeId,
      false,
      openChart,
      onResult
    );
  }

  private loadNodeAndChart(
    node: NetworkNode,
    parentNodeId: number | undefined,
    isRoot: boolean,
    openChart: boolean,
    onResult?: (res: Node) => void
  ): void {
    this.editNodeForm.patchValue({ name: '' });

    this.nodesService
      .getOrAddNode({
        nodeId: node.id,
        name: node.label,
        parentNodeId,
      })
      .subscribe((res) => {
        const newChartData = res.chartData ?? '{ "nodes": [] }';

        // Executa o callback se fornecido
        if (onResult && res) {
          onResult(res);
        }

        if (!isRoot && this.chart.selectedNode) {
          if (openChart) {
            this.breadcrumbs.push(this.chart.selectedNode);
          }
          this.chart.updateNodeId(res.nodeId);

          const previousNodeId = this.activeNodeId ?? -1;

          this.nodesService
            .updateNodeChart({
              nodeId: previousNodeId,
              chartData: this.chart.graphJson,
            })
            .subscribe(() => {
              if (openChart) {
                this.chart.graphJson = newChartData;
                this.cdr.detectChanges();
              }
            });
        } else {
          if (openChart) {
            this.chart.graphJson = newChartData;
          }

          if (isRoot) {
            this.breadcrumbs = [{ ...node, id: res.nodeId }];
          } else if (!res.parentNodeId && this.breadcrumbs.length) {
            this.breadcrumbs[0].id = res.nodeId;
          }
        }

        this.activeNodeId = res.nodeId;

        if (openChart) {
          this.cdr.detectChanges();
        }
      });
  }

  saveReferences(): void {
    if (!this.chart.selectedNode && this.nodeId) {
      this.editReferences?.saveReferences(this.nodeId);
      return;
    }

    this.createOrOpenChildNode(this.chart.selectedNode, false, (res) => {
      this.editReferences?.saveReferences(this.chart.selectedNode?.id);
    });
  }

  updateNodeLabel(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.chart.updateNodeLabelText(target.value);
  }
}
