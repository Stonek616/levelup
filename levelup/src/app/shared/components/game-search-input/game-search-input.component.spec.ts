import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSearchInputComponent } from './game-search-input.component';

describe('GameSearchInputComponent', () => {
  let component: GameSearchInputComponent;
  let fixture: ComponentFixture<GameSearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSearchInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameSearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
