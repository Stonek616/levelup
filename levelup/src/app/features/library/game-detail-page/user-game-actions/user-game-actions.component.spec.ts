import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGameActionsComponent } from './user-game-actions.component';

describe('UserGameActionsComponent', () => {
  let component: UserGameActionsComponent;
  let fixture: ComponentFixture<UserGameActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserGameActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserGameActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
