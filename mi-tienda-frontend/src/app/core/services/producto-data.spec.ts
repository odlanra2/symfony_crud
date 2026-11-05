import { TestBed } from '@angular/core/testing';

import { ProductoData } from './producto-data';

describe('ProductoData', () => {
  let service: ProductoData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductoData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
