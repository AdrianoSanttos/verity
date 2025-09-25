import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { By } from '@angular/platform-browser';

import { SummaryComponent } from './summary.component';
import { setCurrentStep, resetForm } from '../../store/form.actions';
import { AppState } from '../../store/form.reducer';
import { PdfService } from '../../services/pdf.service';
import { FormData } from '../../models/form-data.interface';
import { selectFormData } from '../../store/form.selectors';

describe('SummaryComponent', () => {
  let component: SummaryComponent;
  let fixture: ComponentFixture<SummaryComponent>;
  let store: MockStore<AppState>;
  let pdfService: jasmine.SpyObj<PdfService>;

  const mockFormData: FormData = {
    personalData: {
      nomeCompleto: 'João Silva',
      dataNascimento: '15/08/1990',
      cpf: '123.456.789-01',
      telefone: '(11) 99999-9999'
    },
    residentialInfo: {
      cep: '12345-678',
      endereco: 'Rua das Flores, 123',
      bairro: 'Centro',
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

  const initialState = {
    form: {
      formData: mockFormData,
      validatedSteps: [true, true, true, false],
      loading: false,
      professions: [],
      error: null
    }
  };

  beforeEach(async () => {
    const pdfServiceSpy = jasmine.createSpyObj('PdfService', ['generatePDF']);

    await TestBed.configureTestingModule({
      imports: [
        SummaryComponent,
        NoopAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule
      ],
      providers: [
        provideMockStore({ initialState }),
        { provide: PdfService, useValue: pdfServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    pdfService = TestBed.inject(PdfService) as jasmine.SpyObj<PdfService>;
    
    // Mock the selector
    store.overrideSelector(selectFormData, mockFormData);
    store.refreshState();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Data formatting', () => {
    describe('formatSalary', () => {
      it('should format numeric salary correctly', () => {
        const result = component.formatSalary(5000);
        expect(result).toContain('R$');
        expect(result).toContain('5.000,00');
      });

      it('should format string salary correctly', () => {
        const result = component.formatSalary('5000');
        expect(result).toContain('R$');
        expect(result).toContain('5.000,00');
      });

      it('should handle zero salary', () => {
        const result = component.formatSalary(0);
        expect(result).toBe('R$ 0,00');
      });

      it('should handle empty salary', () => {
        const result = component.formatSalary('');
        expect(result).toBe('R$ 0,00');
      });

      it('should handle invalid salary', () => {
        const result = component.formatSalary('invalid');
        expect(result).toBe('R$ 0,00');
      });
    });

    describe('formatDate', () => {
      it('should format date in ddmmyyyy format', () => {
        const result = component.formatDate('15081990');
        expect(result).toBe('15/08/1990');
      });

      it('should keep date already formatted', () => {
        const result = component.formatDate('15/08/1990');
        expect(result).toBe('15/08/1990');
      });

      it('should convert yyyy-mm-dd to dd/mm/yyyy', () => {
        const result = component.formatDate('1990-08-15');
        expect(result).toBe('15/08/1990');
      });

      it('should handle empty date', () => {
        const result = component.formatDate('');
        expect(result).toBe('');
      });

      it('should handle invalid date format', () => {
        const result = component.formatDate('invalid');
        expect(result).toBe('invalid');
      });

      it('should return formatted date string as is', () => {
        const formattedDate = '31/12/2023';
        const result = component.formatDate(formattedDate);
        expect(result).toBe(formattedDate);
        expect(result).toBeTruthy();
      });

      it('should return date with slash format unchanged', () => {
        const dateWithSlash = '15/08/1990';
        
        expect(dateWithSlash.includes('/')).toBeTruthy();
        
        // Verifica que a string não tem 8 dígitos quando limpa
        const cleanDate = dateWithSlash.replace(/\D/g, '');
        expect(cleanDate.length).toBe(8); // vai ter 8 dígitos, então vai tentar o primeiro if
        
        // Mas vamos usar uma data que tenha slash e seja inválida no formato ddmmyyyy
        const dateWithSlashInvalid = '99/99/1990';
        expect(dateWithSlashInvalid.includes('/')).toBeTruthy();
        
        const result = component.formatDate(dateWithSlashInvalid);
        
        expect(result).toBe(dateWithSlashInvalid);
      });
    });

    describe('formatCPF', () => {
      it('should format CPF correctly', () => {
        const result = component.formatCPF('12345678901');
        expect(result).toBe('123.456.789-01');
      });

      it('should keep already formatted CPF', () => {
        const result = component.formatCPF('123.456.789-01');
        expect(result).toBe('123.456.789-01');
      });

      it('should handle empty CPF', () => {
        const result = component.formatCPF('');
        expect(result).toBe('');
      });

      it('should handle invalid CPF length', () => {
        const result = component.formatCPF('123456');
        expect(result).toBe('123456');
      });
    });

    describe('formatPhone', () => {
      it('should format 11-digit phone (mobile)', () => {
        const result = component.formatPhone('11999999999');
        expect(result).toBe('(11) 99999-9999');
      });

      it('should format 10-digit phone (landline)', () => {
        const result = component.formatPhone('1199999999');
        expect(result).toBe('(11) 9999-9999');
      });

      it('should keep already formatted phone', () => {
        const result = component.formatPhone('(11) 99999-9999');
        expect(result).toBe('(11) 99999-9999');
      });

      it('should handle empty phone', () => {
        const result = component.formatPhone('');
        expect(result).toBe('');
      });

      it('should handle invalid phone length', () => {
        const result = component.formatPhone('123456');
        expect(result).toBe('123456');
      });
    });
  });

  describe('User interactions', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
    });

    describe('onEdit', () => {
      it('should dispatch setCurrentStep with step 0', () => {
        component.onEdit();
        expect(store.dispatch).toHaveBeenCalledWith(setCurrentStep({ step: 0 }));
      });

      it('should call onEdit when edit button is clicked', async () => {
        spyOn(component, 'onEdit');
        
        // Aguarda a renderização completa do template
        await fixture.whenStable();
        fixture.detectChanges();
        
        const editButton = fixture.debugElement.query(By.css('button[aria-label="Editar informações"]'));
        expect(editButton).not.toBeNull();
        
        editButton.nativeElement.click();
        
        expect(component.onEdit).toHaveBeenCalled();
      });
    });

    describe('onNewForm', () => {
      it('should dispatch resetForm', () => {
        component.onNewForm();
        expect(store.dispatch).toHaveBeenCalledWith(resetForm());
      });

      it('should call onNewForm when new form button is clicked', () => {
        spyOn(component, 'onNewForm');
        
        const newFormButton = fixture.debugElement.query(By.css('button[aria-label="Criar novo formulário"]'));
        newFormButton.nativeElement.click();
        
        expect(component.onNewForm).toHaveBeenCalled();
      });
    });

    describe('onExportPdf', () => {
      it('should call pdfService.generatePDF with form data', () => {
        component.onExportPdf();
        
        expect(pdfService.generatePDF).toHaveBeenCalledWith(mockFormData);
      });

      it('should not call pdfService.generatePDF with incomplete data', () => {
        // Override selector to return null (no data)
        store.overrideSelector(selectFormData, null as any);
        store.refreshState();
        
        // Reset spy to capture only calls from onExportPdf
        (pdfService.generatePDF as jasmine.Spy).calls.reset();
        
        component.onExportPdf();
        
        expect(pdfService.generatePDF).not.toHaveBeenCalled();
      });

      it('should call onExportPdf when export button is clicked', () => {
        spyOn(component, 'onExportPdf');
        
        const exportButton = fixture.debugElement.query(By.css('button[aria-label="Exportar dados para PDF"]'));
        exportButton.nativeElement.click();
        
        expect(component.onExportPdf).toHaveBeenCalled();
      });
    });
  });

  describe('Template rendering', () => {
    it('should display personal data', async () => {
      await fixture.whenStable();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('João Silva');
      expect(compiled.textContent).toContain('Dados Pessoais');
    });

    it('should display residential data', async () => {
      await fixture.whenStable();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('12345-678');
      expect(compiled.textContent).toContain('Informações Residenciais');
    });

    it('should display professional data', async () => {
      await fixture.whenStable();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Desenvolvedor');
      expect(compiled.textContent).toContain('Informações Profissionais');
    });

    it('should render all action buttons', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      expect(buttons.length).toBe(3);
      
      const editButton = buttons.find(btn => btn.nativeElement.textContent.includes('Editar'));
      const newFormButton = buttons.find(btn => btn.nativeElement.textContent.includes('Novo Formulário'));
      const exportButton = buttons.find(btn => btn.nativeElement.textContent.includes('Exportar PDF'));
      
      expect(editButton).toBeTruthy();
      expect(newFormButton).toBeTruthy();
      expect(exportButton).toBeTruthy();
    });

    it('should display section icons', () => {
      const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
      
      // Should have icons for: person, home, work, edit, add, download
      expect(icons.length).toBeGreaterThanOrEqual(6);
      
      const personIcon = icons.find(icon => icon.nativeElement.textContent === 'person');
      const homeIcon = icons.find(icon => icon.nativeElement.textContent === 'home');
      const workIcon = icons.find(icon => icon.nativeElement.textContent === 'work');
      
      expect(personIcon).toBeTruthy();
      expect(homeIcon).toBeTruthy();
      expect(workIcon).toBeTruthy();
    });
  });

  describe('Observable handling', () => {
    it('should handle formData$ observable', () => {
      let formData: FormData | undefined;
      component.formData$.subscribe(data => formData = data);
      
      expect(formData).toEqual(mockFormData);
    });

    it('should not render content when formData$ is null', () => {
      store.overrideSelector(selectFormData, null as any);
      store.refreshState();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      // Check that personal data is not rendered
      expect(compiled.textContent).not.toContain('João Silva');
      expect(compiled.textContent).not.toContain('Desenvolvedor');
    });
  });
});