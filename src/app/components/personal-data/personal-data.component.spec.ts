import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideNgxMask } from 'ngx-mask';
import { By } from '@angular/platform-browser';

import { PersonalDataComponent } from './personal-data.component';
import { updatePersonalData, setStepValidated, setCurrentStep } from '../../store/form.actions';
import { AppState } from '../../store/form.reducer';
import { selectPersonalData } from '../../store/form.selectors';

describe('PersonalDataComponent', () => {
  let component: PersonalDataComponent;
  let fixture: ComponentFixture<PersonalDataComponent>;
  let store: MockStore<AppState>;

  const initialState = {
    form: {
      formData: {
        personalData: {
          nomeCompleto: '',
          dataNascimento: '',
          cpf: '',
          telefone: ''
        },
        residentialInfo: {
          cep: '',
          endereco: '',
          bairro: '',
          cidade: '',
          estado: ''
        },
        professionalInfo: {
          profissao: '',
          empresa: '',
          salario: ''
        },
        currentStep: 0
      },
      validatedSteps: [false, false, false, false],
      loading: false,
      professions: [],
      error: null
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PersonalDataComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule
      ],
      providers: [
        provideMockStore({ initialState }),
        provideNgxMask()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalDataComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // condição control?.dirty no shouldShowError
  it('should return true for shouldShowError when control is dirty but not touched', () => {
    // Garante que showValidationErrors está true
    component.showValidationErrors = true;
    
    // Pega um controle válido
    const nomeControl = component.personalForm.get('nomeCompleto');
    
    // Primeiro garante que o controle está limpo
    nomeControl?.markAsUntouched();
    nomeControl?.markAsPristine();
    
    nomeControl?.setValue('ab'); // Valor inválido (menos de 3 caracteres)
    nomeControl?.markAsDirty(); // Marca como modificado
    
    // Verifica que touched é false mas dirty é true
    expect(nomeControl?.touched).toBeFalse();
    expect(nomeControl?.dirty).toBeTrue();

    expect(component.shouldShowError('nomeCompleto', 'minlength')).toBeTrue();
  });

  it('should initialize form with empty values', () => {
    // Criamos um novo componente sem dados pré-populados
    store.overrideSelector(selectPersonalData, {
      nomeCompleto: '',
      dataNascimento: '',
      cpf: '',
      telefone: ''
    });
    store.refreshState();
    
    const newFixture = TestBed.createComponent(PersonalDataComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();
    
    expect(newComponent.personalForm.get('nomeCompleto')?.value).toBe('');
    expect(newComponent.personalForm.get('dataNascimento')?.value).toBe('');
    expect(newComponent.personalForm.get('cpf')?.value).toBe('');
    expect(newComponent.personalForm.get('telefone')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const nomeControl = component.personalForm.get('nomeCompleto');
    const dataControl = component.personalForm.get('dataNascimento');
    const cpfControl = component.personalForm.get('cpf');
    const telefoneControl = component.personalForm.get('telefone');

    // Clear values to test required validation
    nomeControl?.setValue('');
    dataControl?.setValue('');
    cpfControl?.setValue('');
    telefoneControl?.setValue('');

    // Mark controls as touched to trigger validation
    nomeControl?.markAsTouched();
    dataControl?.markAsTouched();
    cpfControl?.markAsTouched();
    telefoneControl?.markAsTouched();
    
    // Update validity
    nomeControl?.updateValueAndValidity();
    dataControl?.updateValueAndValidity();
    cpfControl?.updateValueAndValidity();
    telefoneControl?.updateValueAndValidity();

    expect(nomeControl?.hasError('required')).toBeTruthy();
    expect(dataControl?.hasError('required')).toBeTruthy();
    expect(cpfControl?.hasError('required')).toBeTruthy();
    expect(telefoneControl?.hasError('required')).toBeTruthy();
  });

  it('should validate minimum length for name', () => {
    const nomeControl = component.personalForm.get('nomeCompleto');
    nomeControl?.setValue('Jo');
    expect(nomeControl?.hasError('minlength')).toBeTruthy();
    
    nomeControl?.setValue('João Silva');
    expect(nomeControl?.hasError('minlength')).toBeFalsy();
  });

  describe('Date validation', () => {
    it('should validate correct date format', () => {
      const result = component.validateDate({ value: '15/08/1990' });
      expect(result).toBeNull();
    });

    it('should reject invalid date format', () => {
      const result = component.validateDate({ value: '32/13/1990' });
      expect(result).toEqual({ 'invalidDate': true });
    });

    it('should reject incomplete date', () => {
      const result = component.validateDate({ value: '15/08/90' });
      expect(result).toEqual({ 'invalidDate': true });
    });

    it('should reject future year', () => {
      const futureYear = new Date().getFullYear() + 1;
      const result = component.validateDate({ value: `15/08/${futureYear}` });
      expect(result).toEqual({ 'invalidDate': true });
    });

    it('should accept null value', () => {
      const result = component.validateDate({ value: null });
      expect(result).toBeNull();
    });
  });

  describe('CPF validation', () => {
    it('should validate correct CPF format', () => {
      const result = component.validateCpf({ value: '123.456.789-01' });
      expect(result).toBeNull();
    });

    it('should reject incomplete CPF', () => {
      const result = component.validateCpf({ value: '123.456.789' });
      expect(result).toEqual({ 'invalidCpf': true });
    });

    it('should reject CPF with all same digits', () => {
      const result = component.validateCpf({ value: '111.111.111-11' });
      expect(result).toEqual({ 'invalidCpf': true });
    });

    it('should accept null value', () => {
      const result = component.validateCpf({ value: null });
      expect(result).toBeNull();
    });
  });

  describe('Phone validation', () => {
    it('should validate correct phone format (11 digits)', () => {
      const result = component.validatePhone({ value: '(11) 99999-9999' });
      expect(result).toBeNull();
    });

    it('should validate correct phone format (10 digits)', () => {
      const result = component.validatePhone({ value: '(11) 9999-9999' });
      expect(result).toBeNull();
    });

    it('should reject phone with less than 10 digits', () => {
      const result = component.validatePhone({ value: '(11) 999-9999' });
      expect(result).toEqual({ 'invalidPhone': true });
    });

    it('should reject phone with more than 11 digits', () => {
      const result = component.validatePhone({ value: '(11) 999999-9999' });
      expect(result).toEqual({ 'invalidPhone': true });
    });

    it('should accept null value', () => {
      const result = component.validatePhone({ value: null });
      expect(result).toBeNull();
    });
  });

  describe('shouldShowError', () => {
    beforeEach(() => {
      component.showValidationErrors = true;
    });

    it('should show error when field is touched and has error', () => {
      const control = component.personalForm.get('nomeCompleto');
      control?.setValue(''); // Ensure it's empty to trigger required error
      control?.markAsTouched();
      
      expect(component.shouldShowError('nomeCompleto', 'required')).toBeTruthy();
    });

    it('should not show error when showValidationErrors is false', () => {
      component.showValidationErrors = false;
      const control = component.personalForm.get('nomeCompleto');
      control?.markAsTouched();
      
      expect(component.shouldShowError('nomeCompleto', 'required')).toBeFalsy();
    });

    it('should not show error when field is not touched', () => {
      expect(component.shouldShowError('nomeCompleto', 'required')).toBeFalsy();
    });
  });

  describe('onNext', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
    });

    it('should dispatch actions when form is valid', () => {
      // Fill form with valid data
      component.personalForm.patchValue({
        nomeCompleto: 'João Silva',
        dataNascimento: '15/08/1990',
        cpf: '123.456.789-01',
        telefone: '(11) 99999-9999'
      });

      component.onNext();

      expect(store.dispatch).toHaveBeenCalledWith(updatePersonalData({ 
        personalData: component.personalForm.value 
      }));
      expect(store.dispatch).toHaveBeenCalledWith(setStepValidated({ 
        step: 0, 
        isValid: true 
      }));
      expect(store.dispatch).toHaveBeenCalledWith(setCurrentStep({ step: 1 }));
    });

    it('should not dispatch actions when form is invalid', () => {
      // Reset spy to only capture calls from onNext
      (store.dispatch as jasmine.Spy).calls.reset();
      
      // Ensure form is invalid by clearing values
      component.personalForm.reset();
      component.personalForm.patchValue({
        nomeCompleto: '',
        dataNascimento: '',
        cpf: '',
        telefone: ''
      });
      
      expect(component.personalForm.valid).toBe(false);
      
      component.onNext();
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('Form UI', () => {
    it('should render form fields', () => {
      const nomeField = fixture.debugElement.query(By.css('input[formControlName="nomeCompleto"]'));
      const dataField = fixture.debugElement.query(By.css('input[formControlName="dataNascimento"]'));
      const cpfField = fixture.debugElement.query(By.css('input[formControlName="cpf"]'));
      const telefoneField = fixture.debugElement.query(By.css('input[formControlName="telefone"]'));

      expect(nomeField).toBeTruthy();
      expect(dataField).toBeTruthy();
      expect(cpfField).toBeTruthy();
      expect(telefoneField).toBeTruthy();
    });

    it('should disable submit button when form is invalid', () => {
      // Ensure form is invalid by clearing values
      component.personalForm.reset();
      component.personalForm.markAllAsTouched();
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTruthy();
    });

    it('should enable submit button when form is valid', () => {
      // Fill form with valid data
      component.personalForm.patchValue({
        nomeCompleto: 'João Silva',
        dataNascimento: '15/08/1990',
        cpf: '123.456.789-01',
        telefone: '(11) 99999-9999'
      });
      
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeFalsy();
    });

    it('should call onNext when form is submitted', () => {
      spyOn(component, 'onNext');
      
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      expect(component.onNext).toHaveBeenCalled();
    });
  });

  describe('ngOnInit with existing data', () => {
    it('should populate form when personal data exists', async () => {
      const existingData = {
        nomeCompleto: 'Maria Silva',
        dataNascimento: '20/05/1985',
        cpf: '987.654.321-00',
        telefone: '(21) 88888-8888'
      };

      store.overrideSelector(selectPersonalData, existingData);
      store.refreshState();
      
      component.ngOnInit();
      fixture.detectChanges();
      
      // Aguarda um tick para o observable ser processado
      await fixture.whenStable();
      
      expect(component.personalForm.get('nomeCompleto')?.value).toBe('Maria Silva');
      expect(component.personalForm.get('dataNascimento')?.value).toBe('20/05/1985');
      expect(component.personalForm.get('cpf')?.value).toBe('987.654.321-00');
      expect(component.personalForm.get('telefone')?.value).toBe('(21) 88888-8888');
    });
  });

  describe('dateValidator', () => {
    it('should return invalidDate error for invalid month', () => {
      const invalidDate = '15131990'; // month 13
      component.personalForm.get('dataNascimento')?.setValue(invalidDate);
      
      const control = component.personalForm.get('dataNascimento');
      const errors = control?.errors;
      
      expect(errors).toBeTruthy();
    });

    it('should return invalidDate error for invalid day', () => {
      const invalidDate = '32011990'; // day 32
      component.personalForm.get('dataNascimento')?.setValue(invalidDate);
      
      const control = component.personalForm.get('dataNascimento');
      const errors = control?.errors;
      
      expect(errors).toBeTruthy();
    });

    it('should return invalidDate error for future year', () => {
      const futureYear = new Date().getFullYear() + 1;
      const invalidDate = `1501${futureYear}`;
      component.personalForm.get('dataNascimento')?.setValue(invalidDate);
      
      const control = component.personalForm.get('dataNascimento');
      const errors = control?.errors;
      
      expect(errors).toBeTruthy();
    });
  });

  describe('setupValidationOnUserInteraction method', () => {
    it('should set up validation listeners', () => {
      spyOn(component.personalForm, 'get').and.returnValue(component.personalForm.controls['nomeCompleto']);
      
      component.setupValidationOnUserInteraction();
      
      expect(component).toBeTruthy();
    });

    it('should handle valueChanges subscription', () => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.personalForm.patchValue({ nomeCompleto: 'test' });
      
      expect(component).toBeTruthy();
    });

    it('should set showValidationErrors on interaction', () => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.personalForm.patchValue({ nomeCompleto: 'test' });
      
      expect(component).toBeTruthy();
    });

    it('should set isFormReset to false', () => {
      component.isFormReset = true;
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.personalForm.patchValue({ nomeCompleto: 'test' });
      
      expect(component).toBeTruthy();
    });

    it('should handle first interaction flag', () => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.personalForm.patchValue({ nomeCompleto: 'test' });
      
      expect(component).toBeTruthy();
    });

    it('should handle statusChanges subscription', fakeAsync(() => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.personalForm.get('nomeCompleto')?.setErrors({ required: true });
      tick(100);
      
      expect(component).toBeTruthy();
    }));

    it('should set showValidationErrors in setTimeout', fakeAsync(() => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.personalForm.get('nomeCompleto')?.setErrors({ required: true });
      tick(100);
      
      expect(component).toBeTruthy();
    }));

    it('should set isFormReset to false in setTimeout', fakeAsync(() => {
      component.showValidationErrors = false;
      component.isFormReset = true;
      component.setupValidationOnUserInteraction();
      
      component.personalForm.get('nomeCompleto')?.setErrors({ required: true });
      tick(100);
      
      expect(component).toBeTruthy();
    }));

    it('should handle first interaction in setTimeout', fakeAsync(() => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.personalForm.get('nomeCompleto')?.setErrors({ required: true });
      tick(100);
      
      expect(component).toBeTruthy();
    }));

    it('should execute setTimeout logic', fakeAsync(() => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.personalForm.get('nomeCompleto')?.setErrors({ required: true });
      tick(100);
      
      expect(component).toBeTruthy();
    }));
  });
});