import {Component, AfterViewInit, ViewChild, ElementRef, Input, OnInit, SimpleChange, OnChanges} from '@angular/core';
import skels from './skels.json';
import {PoseKeypoints} from '../../model/pose/pose-keypoints.model';

@Component({
  selector: 'pose-svg',
  templateUrl: './pose-svg.component.html'
})
export class PoseSvgComponent implements OnChanges {

  @ViewChild('pose') private pose: ElementRef;
  @Input('poseData') public poseData: PoseKeypoints;
  @Input('mode') public mode: string;
  @Input('width') public width: number;
  @Input('height') public height: number;
  @Input('nodeColor') public nodeColor = "white";
  @Input('nodeActiveColor') public nodeActiveColor = "yellow";
  @Input('nodeRadius') public nodeRadius = 4;
  @Input('nodeActiveRadius') public nodeActiveRadius = 7;
  @Input('edgeColor') public edgeColor = "white";
  @Input('edgeActiveColor') public edgeActiveColor = "yellow";
  @Input('edgeWidth') public edgeWidth = 1;
  @Input('edgeActiveWidth') public edgeActiveWidth = 3;
  public skelType: any;
  public nodes: any[];
  public edges: any[];

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (changes.hasOwnProperty('mode')) {
      this.buildGraph();
    }
  }

  buildGraph() {
    const body25Hands = skels['BODY_25_HANDS'];
    this.skelType = skels[this.mode];
    this.nodes = [];
    for (const kpIdx of Array(body25Hands.max_kp).keys()) {
      const kp = this.poseData.keypoints[kpIdx];
      const drawable = kp[2] > 0;
      const active = this.skelType.digraph.hasOwnProperty(kpIdx.toString());
      this.nodes.push({kp, drawable, active});
    }
    this.edges = [];
    for (const [k, vs] of Object.entries(body25Hands.graph)) {
      const kNum = parseInt(k, 10);
      for (const v of vs) {
        const start = this.poseData.keypoints[kNum];
        const end = this.poseData.keypoints[v];
        const drawable = start[2] > 0 && end[2] > 0;
        const active = (
          drawable &&
          this.skelType.digraph.hasOwnProperty(k) &&
          this.skelType.digraph[k].indexOf(v) !== -1
        );
        this.edges.push({start, end, drawable, active});
      }
    }
  }
}
