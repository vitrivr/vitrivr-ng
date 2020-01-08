import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultSegmentPreviewTileComponent } from './result-segment-preview-tile.component';

describe('ResultSegmentPreviewTileComponent', () => {
  let component: ResultSegmentPreviewTileComponent;
  let fixture: ComponentFixture<ResultSegmentPreviewTileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultSegmentPreviewTileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultSegmentPreviewTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
