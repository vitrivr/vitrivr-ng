import {Component, AfterViewInit, ViewChild, ElementRef, Input, OnInit, SimpleChange, OnChanges} from '@angular/core';
import skels from './skels.json';
import {PoseKeypoints} from '../../model/pose/pose-keypoints.model';
import {SkelSpec} from './skel-spec';

@Component({
  selector: 'pose-svg',
  templateUrl: './pose-svg.component.html'
})
export class PoseSvgComponent implements OnChanges {

  @ViewChild('pose') private pose: ElementRef;
  @Input('poseData') public poseData: PoseKeypoints;
  @Input('mode') public mode: SkelSpec;
  @Input('width') public width: number;
  @Input('height') public height: number;
  @Input('nodeColor') public nodeColor = 'white';
  @Input('nodeActiveColor') public nodeActiveColor = 'yellow';
  @Input('nodeRadius') public nodeRadius = 4;
  @Input('nodeActiveRadius') public nodeActiveRadius = 7;
  @Input('edgeColor') public edgeColor = 'white';
  @Input('edgeActiveColor') public edgeActiveColor = 'yellow';
  @Input('edgeWidth') public edgeWidth = 1;
  @Input('edgeActiveWidth') public edgeActiveWidth = 3;
  public nodes: any[];
  public edges: any[];

  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (changes.hasOwnProperty('mode')) {
      this.buildGraph();
    }
  }

  buildGraph() {
    const body25Hands = SkelSpec.get('BODY_25_HANDS');
    this.nodes = [];
    for (const kpIdx of body25Hands.nodes) {
      const kp = this.poseData.keypoints[kpIdx];
      const drawable = kp[2] > 0;
      const active = this.mode ? this.mode.hasKpIdx(kpIdx) : false;
      this.nodes.push({kp, drawable, active});
    }
    this.edges = [];
    for (const [k, v] of body25Hands.edges) {
      const start = this.poseData.keypoints[k];
      const end = this.poseData.keypoints[v];
      const drawable = start[2] > 0 && end[2] > 0;
      const active = drawable && (this.mode ? this.mode.hasEdge(k, v) : false);
      this.edges.push({start, end, drawable, active});
    }
  }
}
