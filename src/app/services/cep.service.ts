import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CepResponse } from '../models/form-data.interface';

@Injectable({
  providedIn: 'root'
})
export class CepService {

  constructor(private readonly http: HttpClient) {}

  getAddressByCep(cep: string): Observable<CepResponse> {
    // Simulando uma API mockada
    const cleanCep = cep.replace(/[^\d]/g, '');
    const prefix = cleanCep.substring(0, 2);
    
    let cidade = 'Curitiba';
    let estado = 'PR';
    
    switch (prefix) {
      case '01':
        cidade = 'São Paulo';
        estado = 'SP';
        break;
      case '02':
        cidade = 'Rio de Janeiro';
        estado = 'RJ';
        break;
      case '03':
        cidade = 'Belo Horizonte';
        estado = 'MG';
        break;
      case '04':
        cidade = 'Porto Alegre';
        estado = 'RS';
        break;
    }
    
    // Mocked response CEPs
    const mockResponse: CepResponse = {
      endereco: `Rua Exemplo ${prefix}`,
      bairro: `Bairro ${cleanCep.substring(2, 4)}`,
      cidade: cidade,
      estado: estado
    };

    // Simula delay de requisição
    return of(mockResponse).pipe(delay(1000));
  }
}