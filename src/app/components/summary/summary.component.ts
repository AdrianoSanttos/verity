import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';

import { FormData } from '../../models/form-data.interface';
import { AppState } from '../../store/form.reducer';
import { selectFormData } from '../../store/form.selectors';
import { setCurrentStep, resetForm } from '../../store/form.actions';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [
    AsyncPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent {
  formData$: Observable<FormData>;

  constructor(
    private readonly store: Store<AppState>,
    private readonly pdfService: PdfService
  ) {
    this.formData$ = this.store.select(selectFormData);
  }

  formatSalary(salary: number | string): string {
    if (!salary || salary === 0 || salary === '') {
      return 'R$ 0,00';
    }
    
    const numericSalary = typeof salary === 'string' ? parseFloat(salary) : salary;
    
    if (isNaN(numericSalary)) {
      return 'R$ 0,00';
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericSalary);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    // Remove tudo que não é dígito
    const cleanDate = dateString.replace(/\D/g, '');
    
    // Se tem 8 dígitos (ddmmaaaa ou aaaammdd)
    if (cleanDate.length === 8) {
      // Tenta diferentes formatos
      const day = cleanDate.substring(0, 2);
      const month = cleanDate.substring(2, 4);
      const year = cleanDate.substring(4, 8);
      
      // Verifica se é um formato válido (dia <= 31, mês <= 12)
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      
      if (dayNum <= 31 && monthNum <= 12 && monthNum >= 1) {
        return `${day}/${month}/${year}`;
      }
    }
    
    // Se já estiver no formato dd/mm/yyyy, retorna como está
    if (dateString.includes('/')) {
      return dateString;
    }
    
    // Se estiver no formato yyyy-mm-dd, converte para dd/mm/yyyy
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    
    return dateString;
  }

  formatCPF(cpf: string): string {
    if (!cpf) return '';
    
    // Remove tudo que não é dígito
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Aplica a máscara xxx.xxx.xxx-xx
    if (cleanCPF.length === 11) {
      return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return cpf;
  }

  formatPhone(phone: string): string {
    if (!phone) return '';
    
    // Remove tudo que não é dígito
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Aplica a máscara (xx) xxxxx-xxxx para celular ou (xx) xxxx-xxxx para fixo
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  }

  onEdit(): void {
    this.store.dispatch(setCurrentStep({ step: 0 }));
  }

  onNewForm(): void {
    // Reset form - o resetForm já define currentStep como 0 no initialState
    this.store.dispatch(resetForm());
  }

  onExportPdf(): void {
    this.formData$.pipe(
      take(1) // Garante que só executa uma vez
    ).subscribe(data => {
      if (data?.personalData && data?.residentialInfo && data?.professionalInfo) {
        this.pdfService.generatePDF(data);
      }
    });
  }
}