import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Profession } from '../models/form-data.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfessionService {

  constructor(private readonly http: HttpClient) {}

  getProfessions(): Observable<Profession[]> {
    // Simulando uma API mockada com lista de profissões
    const mockProfessions: Profession[] = [
      { id: '1', nome: 'Desenvolvedor Front-end' },
      { id: '2', nome: 'Desenvolvedor Back-end' },
      { id: '3', nome: 'Analista de Sistemas' },
      { id: '4', nome: 'Gerente de Projetos' },
      { id: '5', nome: 'Designer UX/UI' },
      { id: '6', nome: 'Analista de Dados' },
      { id: '7', nome: 'Arquiteto de Software' },
      { id: '8', nome: 'DevOps Engineer' },
      { id: '9', nome: 'Product Manager' },
      { id: '10', nome:'Tech Lead' }
    ];

    // Simula delay de requisição
    return of(mockProfessions).pipe(delay(800));
  }
}