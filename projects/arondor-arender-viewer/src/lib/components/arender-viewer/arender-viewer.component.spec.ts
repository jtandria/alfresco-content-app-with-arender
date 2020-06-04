import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArenderViewerComponent } from './arender-viewer.component';

describe('ArenderViewerComponent', () => {
  let component: ArenderViewerComponent;
  let fixture: ComponentFixture<ArenderViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArenderViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArenderViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
