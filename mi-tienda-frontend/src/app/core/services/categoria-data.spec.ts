import { TestBed } from '@angular/core/testing';

import { CategoriaData } from './categoria-data';

describe('CategoriaData', () => {
  let service: CategoriaData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoriaData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
