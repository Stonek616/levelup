import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsPreviewComponent } from './collections-preview.component';

describe('CollectionsPreviewComponent', () => {
  let component: CollectionsPreviewComponent;
  let fixture: ComponentFixture<CollectionsPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionsPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionsPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
