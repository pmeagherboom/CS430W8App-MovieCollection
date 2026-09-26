import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditMediaPage } from './edit-media.page';

describe('EditMediaPage', () => {
  let component: EditMediaPage;
  let fixture: ComponentFixture<EditMediaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMediaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
