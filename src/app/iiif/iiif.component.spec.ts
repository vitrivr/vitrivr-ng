import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IiifComponent } from './iiif.component';

describe('IiifComponent', () => {
  let component: IiifComponent;
  let fixture: ComponentFixture<IiifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IiifComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IiifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
