import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemporalDistanceComponent } from './temporal-distance.component';

describe('TemporalDistanceComponent', () => {
  let component: TemporalDistanceComponent;
  let fixture: ComponentFixture<TemporalDistanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemporalDistanceComponent ]
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
