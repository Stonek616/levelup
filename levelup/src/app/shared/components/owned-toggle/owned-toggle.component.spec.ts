import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnedToggleComponent } from './owned-toggle.component';

describe('OwnedToggleComponent', () => {
  let component: OwnedToggleComponent;
  let fixture: ComponentFixture<OwnedToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnedToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnedToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
