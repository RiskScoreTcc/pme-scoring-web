import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Occurrences } from './occurrences';

describe('Occurrences', () => {
  let component: Occurrences;
  let fixture: ComponentFixture<Occurrences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Occurrences],
    }).compileComponents();

    fixture = TestBed.createComponent(Occurrences);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
