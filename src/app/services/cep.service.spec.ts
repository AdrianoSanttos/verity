import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CepService } from './cep.service';
import { CepResponse } from '../models/form-data.interface';

describe('CepService', () => {
  let service: CepService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CepService]
    });
    service = TestBed.inject(CepService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAddressByCep', () => {
    it('should return São Paulo address for CEP starting with 01', (done) => {
      const cep = '01234-567';
      const expectedResponse: CepResponse = {
        endereco: 'Rua Exemplo 01',
        bairro: 'Bairro 23',
        cidade: 'São Paulo',
        estado: 'SP'
      };

      service.getAddressByCep(cep).subscribe(response => {
        expect(response).toEqual(expectedResponse);
        done();
      });
    });

    it('should return Rio de Janeiro address for CEP starting with 02', (done) => {
      const cep = '02345-678';
      const expectedResponse: CepResponse = {
        endereco: 'Rua Exemplo 02',
        bairro: 'Bairro 34',
        cidade: 'Rio de Janeiro',
        estado: 'RJ'
      };

      service.getAddressByCep(cep).subscribe(response => {
        expect(response).toEqual(expectedResponse);
        done();
      });
    });

    it('should return Belo Horizonte address for CEP starting with 03', (done) => {
      const cep = '03456-789';
      const expectedResponse: CepResponse = {
        endereco: 'Rua Exemplo 03',
        bairro: 'Bairro 45',
        cidade: 'Belo Horizonte',
        estado: 'MG'
      };

      service.getAddressByCep(cep).subscribe(response => {
        expect(response).toEqual(expectedResponse);
        done();
      });
    });

    it('should return Porto Alegre address for CEP starting with 04', (done) => {
      const cep = '04567-890';
      const expectedResponse: CepResponse = {
        endereco: 'Rua Exemplo 04',
        bairro: 'Bairro 56',
        cidade: 'Porto Alegre',
        estado: 'RS'
      };

      service.getAddressByCep(cep).subscribe(response => {
        expect(response).toEqual(expectedResponse);
        done();
      });
    });

    it('should return default Curitiba address for unknown CEP prefix', (done) => {
      const cep = '99999-999';
      const expectedResponse: CepResponse = {
        endereco: 'Rua Exemplo 99',
        bairro: 'Bairro 99',
        cidade: 'Curitiba',
        estado: 'PR'
      };

      service.getAddressByCep(cep).subscribe(response => {
        expect(response).toEqual(expectedResponse);
        done();
      });
    });

    it('should handle CEP without mask', (done) => {
      const cep = '01234567';
      const expectedResponse: CepResponse = {
        endereco: 'Rua Exemplo 01',
        bairro: 'Bairro 23',
        cidade: 'São Paulo',
        estado: 'SP'
      };

      service.getAddressByCep(cep).subscribe(response => {
        expect(response).toEqual(expectedResponse);
        done();
      });
    });

    it('should handle CEP with extra characters', (done) => {
      const cep = 'ABC01234-567XYZ';
      const expectedResponse: CepResponse = {
        endereco: 'Rua Exemplo 01',
        bairro: 'Bairro 23',
        cidade: 'São Paulo',
        estado: 'SP'
      };

      service.getAddressByCep(cep).subscribe(response => {
        expect(response).toEqual(expectedResponse);
        done();
      });
    });

    it('should simulate API delay', (done) => {
      const cep = '01234-567';
      const startTime = Date.now();

      service.getAddressByCep(cep).subscribe(response => {
        const endTime = Date.now();
        const elapsed = endTime - startTime;
        
        // Should take at least close to 1000ms (allowing for some variance)
        expect(elapsed).toBeGreaterThanOrEqual(990);
        expect(response).toBeDefined();
        done();
      });
    });
  });

  it('should map prefix 05 to default Curitiba', (done) => {
    const cep = '05123-456';
    
    service.getAddressByCep(cep).subscribe(response => {
      expect(response.cidade).toBe('Curitiba');
      expect(response.estado).toBe('PR');
      done();
    });
  });
});