import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryNew } from './inventory-new';

describe('InventoryNew', () => {
  let component: InventoryNew;
  let fixture: ComponentFixture<InventoryNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryNew);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
