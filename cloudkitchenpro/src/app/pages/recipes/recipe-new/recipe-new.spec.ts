import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeNew } from './recipe-new';

describe('RecipeNew', () => {
  let component: RecipeNew;
  let fixture: ComponentFixture<RecipeNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeNew);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
