import { TestBed } from '@angular/core/testing';

import { SpellcheckerService } from '../spellchecker.service';

describe('SpellcheckerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpellcheckerService = TestBed.get(SpellcheckerService);
    expect(service).toBeTruthy();
  });
});
