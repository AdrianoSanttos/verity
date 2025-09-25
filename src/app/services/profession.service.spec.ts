import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfessionService } from './profession.service';
import { Profession } from '../models/form-data.interface';

describe('ProfessionService', () => {
  let service: ProfessionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfessionService]
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
        expect(professions.length).toBeGreaterThan(0);
        const firstProfession = professions[0];
        expect(firstProfession.id).toBeDefined();
        expect(firstProfession.nome).toBeDefined();
        expect(typeof firstProfession.id).toBe('string');
        expect(typeof firstProfession.nome).toBe('string');
        done();
      });
    });

    it('should include specific professions', (done) => {
      service.getProfessions().subscribe(professions => {
        const hasDevFrontend = professions.some(p => p.nome === 'Desenvolvedor Front-end');
        const hasDevBackend = professions.some(p => p.nome === 'Desenvolvedor Back-end');
        const hasAnalyst = professions.some(p => p.nome === 'Analista de Sistemas');
        
        expect(hasDevFrontend).toBe(true);
        expect(hasDevBackend).toBe(true);
        expect(hasAnalyst).toBe(true);
        done();
      });
    });

    it('should have unique profession IDs and names', (done) => {
      service.getProfessions().subscribe(professions => {
        const ids = new Set();
        const names = new Set();
        
        let allIdsUnique = true;
        let allNamesUnique = true;
        
        for (const profession of professions) {
          if (ids.has(profession.id)) allIdsUnique = false;
          if (names.has(profession.nome)) allNamesUnique = false;
          ids.add(profession.id);
          names.add(profession.nome);
        }
        
        expect(allIdsUnique).toBe(true);
        expect(allNamesUnique).toBe(true);
        done();
      });
    });

    it('should simulate API delay', (done) => {
      const startTime = Date.now();

      service.getProfessions().subscribe(professions => {
        const endTime = Date.now();
        const elapsed = endTime - startTime;
        
        // Should take at least close to 800ms (allowing for some variance)
        expect(elapsed).toBeGreaterThanOrEqual(790);
        expect(professions).toBeDefined();
        expect(professions.length).toBeGreaterThan(0);
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
        expect(professions.length).toBe(10);
        expect(professions[0].id).toBe('1');
        expect(professions[0].nome).toBe('Desenvolvedor Front-end');
        expect(professions[9].id).toBe('10');
        expect(professions[9].nome).toBe('Tech Lead');
        done();
      });
    });
  });
});