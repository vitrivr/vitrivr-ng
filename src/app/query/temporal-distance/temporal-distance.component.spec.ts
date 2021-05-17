import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {TemporalDistanceComponent} from './temporal-distance.component';

describe('TemporalDistanceComponent', () => {
  let component: TemporalDistanceComponent;
  let fixture: ComponentFixture<TemporalDistanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TemporalDistanceComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemporalDistanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
