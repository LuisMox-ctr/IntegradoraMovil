import { TestBed } from '@angular/core/testing';

import { GameLauncher } from './game-launcher';

describe('GameLauncher', () => {
  let service: GameLauncher;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameLauncher);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
