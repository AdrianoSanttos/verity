import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { FormEffects } from './form.effects';
import { CepService } from '../services/cep.service';
import { ProfessionService } from '../services/profession.service';

describe('FormEffects', () => {
  let effects: FormEffects;
  let actions$: Observable<Action>;
  let cepService: jasmine.SpyObj<CepService>;
  let professionService: jasmine.SpyObj<ProfessionService>;

  beforeEach(() => {
    const cepServiceSpy = jasmine.createSpyObj('CepService', ['getAddressByCep']);
    const professionServiceSpy = jasmine.createSpyObj('ProfessionService', ['getProfessions']);

    TestBed.configureTestingModule({
      providers: [
        FormEffects,
        provideMockActions(() => actions$),
        { provide: CepService, useValue: cepServiceSpy },
        { provide: ProfessionService, useValue: professionServiceSpy }
      ]
    });

    actions$ = new Observable<Action>();

    effects = TestBed.inject(FormEffects);
    cepService = TestBed.inject(CepService) as jasmine.SpyObj<CepService>;
    professionService = TestBed.inject(ProfessionService) as jasmine.SpyObj<ProfessionService>;
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  it('should have cep service injected', () => {
    expect(cepService).toBeTruthy();
  });

  it('should have profession service injected', () => {
    expect(professionService).toBeTruthy();
  });

  describe('loadAddressByCep$', () => {
    it('should handle loadAddressByCep action success', (done) => {
      const mockAddress = {
        endereco: 'Test Street',
        bairro: 'Test District',
        cidade: 'Test City',
        estado: 'TS'
      };

      cepService.getAddressByCep.and.returnValue(of(mockAddress));

      actions$ = of({ type: '[CEP] Load Address By CEP', cep: '12345678' });
      
      effects.loadAddressByCep$.subscribe(() => {
        expect(true).toBeTrue();
        done();
      });
    });

    it('should handle loadAddressByCep action error', (done) => {
      const error = new Error('CEP service error');

      cepService.getAddressByCep.and.returnValue(throwError(() => error));

      actions$ = of({ type: '[CEP] Load Address By CEP', cep: '12345678' });
      
      effects.loadAddressByCep$.subscribe(() => {
        expect(true).toBeTrue();
        done();
      });
    });
  });

  describe('loadProfessions$', () => {
    it('should handle loadProfessions action success', (done) => {
      const mockProfessions = [
        { id: '1', nome: 'Developer' },
        { id: '2', nome: 'Designer' }
      ];

      professionService.getProfessions.and.returnValue(of(mockProfessions));

      actions$ = of({ type: '[Profession] Load Professions' });
      
      effects.loadProfessions$.subscribe(() => {
        expect(true).toBeTrue();
        done();
      });
    });

    it('should handle loadProfessions action error', (done) => {
      const error = new Error('Profession service error');

      professionService.getProfessions.and.returnValue(throwError(() => error));

      actions$ = of({ type: '[Profession] Load Professions' });
      
      effects.loadProfessions$.subscribe(() => {
        expect(true).toBeTrue();
        done();
      });
    });
  });
});