import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { NetworkNode } from '../../domain/network-node';
import { NetworkEdge } from '../../domain/network-edge';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './network.component.html',
  styleUrl: './network.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NetworkComponent),
      multi: true,
    },
  ],
})
export class NetworkComponent implements AfterViewInit, ControlValueAccessor {
  @ViewChild('networkContainer') container!: ElementRef;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  nodes: NetworkNode[] = [];

  edges: NetworkEdge[] = [];

  private initialGraphJson: string | null = null;
  private initialized = false;
  private _graphJson = '';
  private graphJsonChangeSubject = new Subject<void>();

  network: any;
  selectedNode: NetworkNode | null = null;
  viewMode: 'graph' | 'json' = 'graph';

  nodesDS: any;
  edgesDS: any;

  @Input() editable: boolean = false;
  @Input() showEditForm: boolean = true;
  @Input() deleteEnabled: boolean = true;
  @Output() graphJsonChange = new EventEmitter<string>();
  @Output() nodeClick = new EventEmitter<NetworkNode | null>();
  @Output() nodeDoubleClick = new EventEmitter<NetworkNode | null>();
  @Output() nodeDelete = new EventEmitter<NetworkNode>();

  constructor(private cdr: ChangeDetectorRef) {
    this.graphJsonChangeSubject.pipe(debounceTime(300)).subscribe(() => {
      this.emitGraphJsonChange();
    });
  }

  ngAfterViewInit(): void {
    this.initialized = true;
    if (this.initialGraphJson !== null) {
      this.graphJson = this.initialGraphJson;
      this.initialGraphJson = null;
    } else {
      this.redraw();
    }
  }

  redraw(): void {
    const container = this.container.nativeElement;
    this.nodesDS = new (window as any).vis.DataSet(this.nodes);
    this.edgesDS = new (window as any).vis.DataSet(this.edges);

    const data = { nodes: this.nodesDS, edges: this.edgesDS };
    const options = {
      interaction: {
        dragNodes: this.editable,
        dragView: true,
        zoomView: true,
        hover: true,
        navigationButtons: true,
      },
      physics: { enabled: false },
      edges: {
        arrows: { to: { enabled: true, scaleFactor: 0.5 } },
        smooth: false,
      },
    };

    this.network = new (window as any).vis.Network(container, data, options);
    this.cdr.detectChanges();

    const onAfterDrawing = () => {
      if (this.nodes.length > 0) {
        this.network.fit({ animation: false });
      } else {
        this.network.moveTo({ position: { x: 0, y: 0 }, animation: false });
      }
      this.network.off('afterDrawing', onAfterDrawing);
    };

    this.network.once('afterDrawing', onAfterDrawing);

    this.network.on('click', (params: any) => {
      if (params.nodes.length > 0) {
        const node = this.nodesDS.get(params.nodes[0]);
        this.selectedNode = this.nodes.find((x) => x.id === node.id) ?? null;
      } else {
        this.selectedNode = null;
      }
      this.cdr.detectChanges();
      this.nodeClick.emit(this.selectedNode);
    });

    this.network.on('doubleClick', (params: any) => {
      let selectNode = null;
      if (params.nodes.length > 0) {
        const node = this.nodesDS.get(params.nodes[0]);
        selectNode = this.nodes.find((x) => x.id === node.id) ?? null;
      }
      this.nodeDoubleClick.emit(selectNode);
    });

    this.network.on('dragEnd', (params: any) => {
      if (!params.nodes) return;

      params.nodes.forEach((nodeId: number) => {
        const pos = this.network.getPositions([nodeId])[nodeId];
        const index = this.nodes.findIndex((n) => n.id === nodeId);
        if (index !== -1) {
          this.nodes[index].x = pos.x;
          this.nodes[index].y = pos.y;
        }
      });
      this.graphJsonChangeSubject.next();
      this.cdr.detectChanges();

      if (params.nodes.length > 0) {
        const node = this.nodesDS.get(params.nodes[0]);
        const nodeDragged = this.nodes.find((x) => x.id === node.id) ?? null;
        this.nodeClick.emit(nodeDragged!);
      }
    });
  }

  updateNodeId(id: number): void {
    if (!this.selectedNode) return;
    const index = this.nodes.findIndex((n) => n.id === this.selectedNode!.id);
    if (index !== -1) {
      this.nodes[index].id = id;
      this.selectedNode.id = id;
      this.nodesDS.update(this.nodes[index]);
      this.graphJsonChangeSubject.next();
    }
  }

  updateNodeLabelText(text: string): void {
    if (!this.selectedNode) return;
    const index = this.nodes.findIndex((n) => n.id === this.selectedNode!.id);
    if (index !== -1) {
      this.nodes[index].label = text;
      this.selectedNode.label = text;
      this.nodesDS.update(this.nodes[index]);
      this.graphJsonChangeSubject.next();
    }
  }

  updateNodeLabel(): void {
    if (!this.selectedNode) return;
    const index = this.nodes.findIndex((n) => n.id === this.selectedNode!.id);
    if (index !== -1) {
      this.nodes[index].label = this.selectedNode.label;
      this.nodesDS.update(this.nodes[index]);
      this.graphJsonChangeSubject.next();
    }
  }

  addElement(type: string, linked: boolean = false): void {
    if (!this.editable) return;

    const minId = this.nodes.reduce((min, n) => Math.min(min, n.id), 0);
    const id = minId - 1;

    // Define propriedades básicas do novo nó
    let node: NetworkNode = {
      id,
      label: '',
      x: 0,
      y: 0,
      fixed: false,
      shape: 'ellipse',
    };

    // Configura o nó conforme o tipo
    switch (type) {
      case 'task':
        node.label = 'New Task';
        node.shape = 'box';
        break;
      case 'note':
        node.label = 'New Note';
        node.shape = 'box';
        node.color = { background: '#fff7a8', border: '#e1c542' };
        node.font = { color: '#5a5a00', size: 14 };
        node.widthConstraint = { maximum: 200 };
        break;
      case 'decision':
        node.label = 'Decision';
        node.shape = 'diamond';
        node.color = { background: '#e6f2ff', border: '#0066cc' };
        break;
      case 'process':
        node.label = 'Process';
        node.shape = 'box';
        node.color = { background: '#d0f0c0', border: '#339933' };
        break;
      case 'input':
        node.label = 'Input';
        node.shape = 'ellipse';
        node.color = { background: '#ffe0cc', border: '#ff6600' };
        break;
      case 'output':
        node.label = 'Output';
        node.shape = 'ellipse';
        node.color = { background: '#ccffe0', border: '#00cc66' };
        break;
      default:
        node.label = 'New Node';
    }

    if (linked && this.selectedNode) {
      const fromId = this.selectedNode.id;
      const pos = this.network.getPositions([fromId])[fromId];
      node.x = pos.x + 100;
      node.y = pos.y;
      this.nodes.push(node);
      this.edges.push({ from: fromId, to: node.id });
    } else {
      node.x = 0;
      node.y = 0;
      this.nodes.push(node);
    }

    this.redraw();
    this.selectedNode = node;
  }

  deleteSelectedNode(): void {
    if (!this.editable || !this.selectedNode) return;

    const deletedNode = this.selectedNode;
    const nodeId = this.selectedNode.id;
    this.nodes = this.nodes?.filter((n) => n.id !== nodeId);
    this.edges = this.edges?.filter(
      (e) => e.from !== nodeId && e.to !== nodeId
    );
    this.selectedNode = null;
    this.redraw();
    this.graphJsonChangeSubject.next();

    this.nodeDelete.emit(deletedNode);
  }

  showView(mode: 'graph' | 'json'): void {
    this.viewMode = mode;
  }

  @Input()
  get graphJson(): string {
    return JSON.stringify({ nodes: this.nodes, edges: this.edges }, null, 2);
  }

  set graphJson(value: string) {
    this._graphJson = value;
    try {
      const parsed = value ? JSON.parse(value) : { nodes: [], edges: [] };
      this.nodes = parsed.nodes;
      this.edges = parsed.edges;
      if (this.initialized) {
        this.redraw();
      }
      /*setTimeout(() => {
        this.network.stabilize();
      }, 400);*/
      this.onChange(value);
    } catch (e) {
      console.warn('Invalid JSON:', e);
    }
  }

  private emitGraphJsonChange(): void {
    const value = this.graphJson;
    this.graphJsonChange.emit(value);
    this.onChange(value);
  }

  downloadAsJPG(): void {
    const canvas = this.container.nativeElement.querySelector(
      'canvas'
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const whiteCanvas = document.createElement('canvas');
    whiteCanvas.width = canvas.width;
    whiteCanvas.height = canvas.height;

    const ctx = whiteCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, whiteCanvas.width, whiteCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    const imageData = whiteCanvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a');
    link.href = imageData;
    link.download = 'network.jpg';
    link.click();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.editable || !this.deleteEnabled) return;

    if ((event.key === 'Delete' || event.key === 'Del') && this.selectedNode) {
      this.deleteSelectedNode();
      event.preventDefault();
    }
  }

  writeValue(value: any): void {
    if (value !== undefined) {
      this.graphJson =
        typeof value === 'string' ? value : JSON.stringify(value);
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}
}
