import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TesteComponente } from './teste-componente';

describe('TesteComponente', () => {
  let component: TesteComponente;
  let fixture: ComponentFixture<TesteComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TesteComponente],
    }).compileComponents();

    fixture = TestBed.createComponent(TesteComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
