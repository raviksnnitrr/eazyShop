import { TestBed } from '@angular/core/testing';

import { EazyShopFormService } from './eazy-shop-form.service';

describe('EazyShopFormService', () => {
  let service: EazyShopFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EazyShopFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
