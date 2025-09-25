import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProfessionService } from './profession.service';
import { Profession } from '../models/form-data.interface';

// Helper functions to reduce nesting
function verifyProfessionStructure(professions: Profession[]): void {
  expect(professions.length).toBeGreaterThan(0);
  const firstProfession = professions[0];
  expect(firstProfession.id).toBeDefined();
  expect(firstProfession.nome).toBeDefined();
  expect(typeof firstProfession.id).toBe('string');
  expect(typeof firstProfession.nome).toBe('string');
}

function verifyRequiredProfessions(professions: Profession[]): void {
  const requiredProfessions = [
    'Desenvolvedor Front-end',
    'Desenvolvedor Back-end', 
    'Analista de Sistemas'
  ];

  requiredProfessions.forEach(professionName => {
    const found = professions.some(p => p.nome === professionName);
    expect(found).withContext(`Should include profession: ${professionName}`).toBe(true);
  });
}

function verifyUniqueness(professions: Profession[]): void {
  const ids = new Set<string>();
  const names = new Set<string>();
  
  professions.forEach(profession => {
    expect(ids.has(profession.id)).withContext(`Duplicate ID: ${profession.id}`).toBe(false);
    expect(names.has(profession.nome)).withContext(`Duplicate name: ${profession.nome}`).toBe(false);
    ids.add(profession.id);
    names.add(profession.nome);
  });
  
  expect(ids.size).toBe(professions.length);
  expect(names.size).toBe(professions.length);
}

function verifyApiDelay(professions: Profession[], startTime: number): void {
  const endTime = Date.now();
  const elapsed = endTime - startTime;
  
  expect(elapsed).toBeGreaterThanOrEqual(790);
  expect(professions).toBeDefined();
  expect(professions.length).toBeGreaterThan(0);
}

function verifyDataStructure(professions: Profession[]): void {
  expect(professions.length).toBe(10);
  expect(professions[0].id).toBe('1');
  expect(professions[0].nome).toBe('Desenvolvedor Front-end');
  expect(professions[9].id).toBe('10');
  expect(professions[9].nome).toBe('Tech Lead');
}

describe('ProfessionService', () => {
  let service: ProfessionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProfessionService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProfessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });



  describe('getProfessions', () => {
    it('should return list of professions', (done) => {
      const expectedProfessions: Profession[] = [
        { id: '1', nome: 'Desenvolvedor Front-end' },
        { id: '2', nome: 'Desenvolvedor Back-end' },
        { id: '3', nome: 'Analista de Sistemas' },
        { id: '4', nome: 'Gerente de Projetos' },
        { id: '5', nome: 'Designer UX/UI' },
        { id: '6', nome: 'Analista de Dados' },
        { id: '7', nome: 'Arquiteto de Software' },
        { id: '8', nome: 'DevOps Engineer' },
        { id: '9', nome: 'Product Manager' },
        { id: '10', nome: 'Tech Lead' }
      ];

      service.getProfessions().subscribe(professions => {
        expect(professions).toEqual(expectedProfessions);
        expect(professions.length).toBe(10);
        done();
      });
    });

    it('should return professions with correct structure', (done) => {
      service.getProfessions().subscribe(professions => {
        verifyProfessionStructure(professions);
        done();
      });
    });

    it('should include specific professions', (done) => {
      service.getProfessions().subscribe(professions => {
        verifyRequiredProfessions(professions);
        done();
      });
    });

    it('should have unique profession IDs and names', (done) => {
      service.getProfessions().subscribe(professions => {
        verifyUniqueness(professions);
        done();
      });
    });

    it('should simulate API delay', (done) => {
      const startTime = Date.now();

      service.getProfessions().subscribe(professions => {
        verifyApiDelay(professions, startTime);
        done();
      });
    });

    it('should return Observable', () => {
      const result = service.getProfessions();
      expect(result.subscribe).toBeDefined();
    });
  });

  describe('Profession data validation', () => {
    it('should have valid data structure', (done) => {
      service.getProfessions().subscribe(professions => {
        verifyDataStructure(professions);
        done();
      });
    });
  });
});