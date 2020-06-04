import { TestBed } from '@angular/core/testing';

import { ArenderService } from './arender.service';

describe('ArenderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ArenderService = TestBed.get(ArenderService);
    expect(service).toBeTruthy();
  });
});
