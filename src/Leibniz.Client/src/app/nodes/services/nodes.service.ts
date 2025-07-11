import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { appSettings } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { Node } from '../domain/node';

@Injectable({
  providedIn: 'root',
})
export class NodesService {
  constructor(private http: HttpClient) {}

  getOrAddNode(node: {
    nodeId: number;
    name: string;
    parentNodeId: number | undefined;
  }): Observable<Node> {
    const result = this.http
      .post<Node>(`${appSettings.baseUrl}/nodes/get-or-add-node`, node)
      .pipe(map((res) => res));
    return result;
  }

  updateNodeChart(node: {
    nodeId: number;
    chartData: string;
  }): Observable<Node> {
    const result = this.http
      .put<Node>(`${appSettings.baseUrl}/nodes/update-chart`, node)
      .pipe(map((res) => res));
    return result;
  }

  deleteNodeBranch(nodeId: number): Observable<boolean> {
    const result = this.http
      .delete<boolean>(
        `${appSettings.baseUrl}/nodes/delete-node-branch?NodeId=${nodeId}`
      )
      .pipe(map((res) => res));
    return result;
  }
}
