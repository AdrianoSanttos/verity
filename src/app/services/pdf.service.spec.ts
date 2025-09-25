import { TestBed } from '@angular/core/testing';
import { PdfService } from './pdf.service';
import { FormData } from '../models/form-data.interface';

describe('PdfService', () => {
  let service: PdfService;

  const mockFormData: FormData = {
    personalData: {
      nomeCompleto: 'João Silva',
      dataNascimento: '15081990',
      cpf: '12345678901',
      telefone: '11999999999'
    },
    residentialInfo: {
      endereco: 'Rua das Flores, 123',
      bairro: 'Centro',
      cep: '12345-678',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    professionalInfo: {
      profissao: 'Desenvolvedor',
      empresa: 'Tech Company',
      salario: 5000
    },
    currentStep: 3
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PdfService]
    });
    service = TestBed.inject(PdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Private formatting methods', () => {
    describe('formatDate', () => {
      it('should format date from ddmmyyyy format', () => {
        const result = service['formatDate']('15081990');
        expect(result).toBe('15/08/1990');
      });

      it('should keep formatted date unchanged', () => {
        const result = service['formatDate']('15/08/1990');
        expect(result).toBe('15/08/1990');
      });

      it('should convert yyyy-mm-dd to dd/mm/yyyy', () => {
        const result = service['formatDate']('1990-08-15');
        expect(result).toBe('15/08/1990');
      });

      it('should handle empty date', () => {
        const result = service['formatDate']('');
        expect(result).toBe('');
      });

      it('should handle invalid date', () => {
        const result = service['formatDate']('invalid');
        expect(result).toBe('invalid');
      });

      it('should validate date ranges', () => {
        const invalidDate = service['formatDate']('32131990'); // Invalid day/month
        expect(invalidDate).toBe('32131990');
        
        const validDate = service['formatDate']('15081990');
        expect(validDate).toBe('15/08/1990');
      });

      it('should return date string as is when already formatted', () => {
        const formattedDate = '25/12/2023';
        const result = service['formatDate'](formattedDate);
        expect(result).toBe(formattedDate);
        expect(result).toBeTruthy();
      });

      it('should return slash formatted date unchanged', () => {
        const dateWithSlash = '10/05/1985';
        
        expect(dateWithSlash.includes('/')).toBeTruthy();
        
        // Verifica que a string não tem 8 dígitos quando limpa
        const cleanDate = dateWithSlash.replace(/\D/g, '');
        expect(cleanDate.length).toBe(8); // vai ter 8 dígitos, então vai tentar o primeiro if
        
        // Mas vamos usar uma data que tenha slash e seja inválida no formato ddmmyyyy
        const dateWithSlashInvalid = '99/99/1985';
        expect(dateWithSlashInvalid.includes('/')).toBeTruthy();
        
        const result = service['formatDate'](dateWithSlashInvalid);

        expect(result).toBe(dateWithSlashInvalid);
      });
    });

    describe('formatCPF', () => {
      it('should format CPF with mask', () => {
        const result = service['formatCPF']('12345678901');
        expect(result).toBe('123.456.789-01');
      });

      it('should keep already formatted CPF', () => {
        const result = service['formatCPF']('123.456.789-01');
        expect(result).toBe('123.456.789-01');
      });

      it('should handle empty CPF', () => {
        const result = service['formatCPF']('');
        expect(result).toBe('');
      });

      it('should handle invalid CPF length', () => {
        const result = service['formatCPF']('123456');
        expect(result).toBe('123456');
      });
    });

    describe('formatPhone', () => {
      it('should format 11-digit mobile phone', () => {
        const result = service['formatPhone']('11999999999');
        expect(result).toBe('(11) 99999-9999');
      });

      it('should format 10-digit landline phone', () => {
        const result = service['formatPhone']('1199999999');
        expect(result).toBe('(11) 9999-9999');
      });

      it('should keep already formatted phone', () => {
        const result = service['formatPhone']('(11) 99999-9999');
        expect(result).toBe('(11) 99999-9999');
      });

      it('should handle empty phone', () => {
        const result = service['formatPhone']('');
        expect(result).toBe('');
      });

      it('should handle invalid phone length', () => {
        const result = service['formatPhone']('123');
        expect(result).toBe('123');
      });
    });

    describe('formatSalary', () => {
      it('should format numeric salary', () => {
        const result = service['formatSalary'](5000);
        expect(result).toBe('5.000,00');
      });

      it('should format string salary', () => {
        const result = service['formatSalary']('5000');
        expect(result).toBe('5.000,00');
      });

      it('should handle zero salary', () => {
        const result = service['formatSalary'](0);
        expect(result).toBe('0,00');
      });

      it('should handle empty salary', () => {
        const result = service['formatSalary']('');
        expect(result).toBe('');
      });

      it('should handle null/undefined salary', () => {
        const result1 = service['formatSalary'](null as any);
        const result2 = service['formatSalary'](undefined as any);
        expect(result1).toBe('');
        expect(result2).toBe('');
      });

      it('should handle invalid salary string', () => {
        const result = service['formatSalary']('invalid');
        expect(result).toBe('');
      });

      it('should format salary with Brazilian formatting', () => {
        const result = service['formatSalary'](123456.789);
        expect(result).toBe('123.456,79');
      });
    });
  });

  describe('generatePDF', () => {
    it('should execute without errors', () => {
      expect(() => service.generatePDF(mockFormData)).not.toThrow();
    });

    it('should accept valid form data', () => {
      const result = service.generatePDF(mockFormData);
      expect(result).toBeUndefined(); // Method returns void
    });
  });
});