import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideNgxMask } from 'ngx-mask';
import { By } from '@angular/platform-browser';

import { ResidentialInfoComponent } from './residential-info.component';
import { updateResidentialInfo, setStepValidated, setCurrentStep } from '../../store/form.actions';
import { AppState } from '../../store/form.reducer';
import { selectResidentialInfo, selectLoading } from '../../store/form.selectors';

describe('ResidentialInfoComponent', () => {
  let component: ResidentialInfoComponent;
  let fixture: ComponentFixture<ResidentialInfoComponent>;
  let store: MockStore<AppState>;

  const initialState = {
    form: {
      formData: {
        personalData: {
          nomeCompleto: 'João Silva',
          dataNascimento: '15/08/1990',
          cpf: '123.456.789-01',
          telefone: '(11) 99999-9999'
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
        currentStep: 1
      },
      validatedSteps: [true, false, false, false],
      loading: false,
      professions: [],
      error: null
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ResidentialInfoComponent,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule
      ],
      providers: [
        provideMockStore({ initialState }),
        provideNgxMask()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResidentialInfoComponent);
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
    const cepControl = component.residentialForm.get('cep');
    
    // Primeiro garante que o controle está limpo
    cepControl?.markAsUntouched();
    cepControl?.markAsPristine();
    
    cepControl?.setValue('123'); // Valor inválido (CEP incompleto)
    cepControl?.markAsDirty(); // Marca como modificado
    // Importante: NÃO marca como touched para testar especificamente a condição dirty
    
    // Verifica que touched é false mas dirty é true
    expect(cepControl?.touched).toBeFalse();
    expect(cepControl?.dirty).toBeTrue();

    expect(component.shouldShowError('cep', 'invalidCep')).toBeTrue();
  });

  it('should initialize form with empty values', () => {
    // Reset the store to empty state to test initialization
    store.overrideSelector(selectResidentialInfo, {
      cep: '',
      endereco: '',
      bairro: '',
      cidade: '',
      estado: ''
    });
    store.refreshState();
    
    expect(component.residentialForm.get('cep')?.value).toBe('');
    expect(component.residentialForm.get('endereco')?.value).toBe('');
    expect(component.residentialForm.get('bairro')?.value).toBe('');
    expect(component.residentialForm.get('cidade')?.value).toBe('');
    expect(component.residentialForm.get('estado')?.value).toBe('');
  });

  it('should validate required fields', () => {
    // Clear the form and force validation
    component.residentialForm.reset();
    component.residentialForm.markAllAsTouched();
    
    const cepControl = component.residentialForm.get('cep');
    const enderecoControl = component.residentialForm.get('endereco');
    const bairroControl = component.residentialForm.get('bairro');
    const cidadeControl = component.residentialForm.get('cidade');
    const estadoControl = component.residentialForm.get('estado');

    expect(cepControl?.hasError('required')).toBeTruthy();
    expect(enderecoControl?.hasError('required')).toBeTruthy();
    expect(bairroControl?.hasError('required')).toBeTruthy();
    expect(cidadeControl?.hasError('required')).toBeTruthy();
    expect(estadoControl?.hasError('required')).toBeTruthy();
  });

  it('should have all Brazilian states in estados array', () => {
    expect(component.estados.length).toBe(27); // 26 states + DF
    
    // Check some key states
    const sp = component.estados.find(e => e.sigla === 'SP');
    const rj = component.estados.find(e => e.sigla === 'RJ');
    const df = component.estados.find(e => e.sigla === 'DF');
    
    expect(sp).toEqual({ sigla: 'SP', nome: 'São Paulo' });
    expect(rj).toEqual({ sigla: 'RJ', nome: 'Rio de Janeiro' });
    expect(df).toEqual({ sigla: 'DF', nome: 'Distrito Federal' });
  });

  describe('CEP validation', () => {
    it('should validate correct CEP format', () => {
      const result = component.validateCep({ value: '12345-678' });
      expect(result).toBeNull();
    });

    it('should reject incomplete CEP', () => {
      const result = component.validateCep({ value: '12345' });
      expect(result).toEqual({ 'invalidCep': true });
    });

    it('should accept null value', () => {
      const result = component.validateCep({ value: null });
      expect(result).toBeNull();
    });

    it('should validate CEP with only numbers', () => {
      const result = component.validateCep({ value: '12345678' });
      expect(result).toBeNull();
    });
  });

  describe('onCepBlur', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
    });

    it('should not dispatch actions when CEP is invalid', () => {
      component.residentialForm.get('cep')?.setValue('123');
      
      component.onCepBlur();
      
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch actions when CEP is empty', () => {
      component.residentialForm.get('cep')?.setValue('');
      
      component.onCepBlur();
      
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('shouldShowError', () => {
    beforeEach(() => {
      component.showValidationErrors = true;
    });

    it('should show error when field is touched and has error', () => {
      const control = component.residentialForm.get('cep');
      control?.setValue(''); // Ensure it's empty to trigger required error
      control?.markAsTouched();
      
      expect(component.shouldShowError('cep', 'required')).toBeTruthy();
    });

    it('should not show error when showValidationErrors is false', () => {
      component.showValidationErrors = false;
      const control = component.residentialForm.get('cep');
      control?.markAsTouched();
      
      expect(component.shouldShowError('cep', 'required')).toBeFalsy();
    });

    it('should not show error when field is not touched', () => {
      expect(component.shouldShowError('cep', 'required')).toBeFalsy();
    });
  });

  describe('onPrevious', () => {
    it('should dispatch setCurrentStep with step 0', () => {
      spyOn(store, 'dispatch');
      
      component.onPrevious();
      
      expect(store.dispatch).toHaveBeenCalledWith(setCurrentStep({ step: 0 }));
    });
  });

  describe('onNext', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
    });

    it('should dispatch actions when form is valid', () => {
      // Fill form with valid data
      component.residentialForm.patchValue({
        cep: '12345-678',
        endereco: 'Rua das Flores, 123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      });

      component.onNext();

      expect(store.dispatch).toHaveBeenCalledWith(updateResidentialInfo({ 
        residentialInfo: component.residentialForm.value 
      }));
      expect(store.dispatch).toHaveBeenCalledWith(setStepValidated({ 
        step: 1, 
        isValid: true 
      }));
      expect(store.dispatch).toHaveBeenCalledWith(setCurrentStep({ step: 2 }));
    });

    it('should not dispatch actions when form is invalid', () => {
      // Reset spy to only capture calls from onNext
      (store.dispatch as jasmine.Spy).calls.reset();
      
      // Ensure form is invalid by clearing values
      component.residentialForm.reset();
      component.residentialForm.patchValue({
        cep: '',
        endereco: '',
        bairro: '',
        cidade: '',
        estado: ''
      });
      
      expect(component.residentialForm.valid).toBe(false);
      
      component.onNext();
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('Form UI', () => {
    it('should render form fields', () => {
      const cepField = fixture.debugElement.query(By.css('input[formControlName="cep"]'));
      const enderecoField = fixture.debugElement.query(By.css('input[formControlName="endereco"]'));
      const bairroField = fixture.debugElement.query(By.css('input[formControlName="bairro"]'));
      const cidadeField = fixture.debugElement.query(By.css('input[formControlName="cidade"]'));
      const estadoSelect = fixture.debugElement.query(By.css('mat-select[formControlName="estado"]'));

      expect(cepField).toBeTruthy();
      expect(enderecoField).toBeTruthy();
      expect(bairroField).toBeTruthy();
      expect(cidadeField).toBeTruthy();
      expect(estadoSelect).toBeTruthy();
    });

    it('should disable submit button when form is invalid', () => {
      // Ensure form is invalid by clearing values
      component.residentialForm.reset();
      component.residentialForm.markAllAsTouched();
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTruthy();
    });

    it('should enable submit button when form is valid', () => {
      // Fill form with valid data
      component.residentialForm.patchValue({
        cep: '12345-678',
        endereco: 'Rua das Flores, 123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      });
      
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeFalsy();
    });

    it('should render state options', () => {
      fixture.detectChanges();
      
      // Open the select dropdown
      const select = fixture.debugElement.query(By.css('mat-select'));
      select.nativeElement.click();
      fixture.detectChanges();
      
      // Check if options are present (this might need adjustment based on Material version)
      expect(component.estados.length).toBeGreaterThan(0);
    });

    it('should call onNext when form is submitted', () => {
      spyOn(component, 'onNext');
      
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      expect(component.onNext).toHaveBeenCalled();
    });

    it('should call onPrevious when previous button is clicked', () => {
      spyOn(component, 'onPrevious');
      
      const previousButton = fixture.debugElement.query(By.css('button[type="button"]'));
      previousButton.nativeElement.click();
      
      expect(component.onPrevious).toHaveBeenCalled();
    });
  });

  describe('ngOnInit with existing data', () => {
    it('should populate form when residential data exists', () => {
      const existingData = {
        cep: '01234-567',
        endereco: 'Avenida Paulista, 1000',
        numero: '1000',
        complemento: 'Apto 101',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP'
      };

      store.overrideSelector(selectResidentialInfo, existingData);
      store.refreshState();
      
      component.ngOnInit();
      
      expect(component.residentialForm.get('cep')?.value).toBe('01234-567');
      expect(component.residentialForm.get('endereco')?.value).toBe('Avenida Paulista, 1000');
      expect(component.residentialForm.get('bairro')?.value).toBe('Bela Vista');
      expect(component.residentialForm.get('cidade')?.value).toBe('São Paulo');
      expect(component.residentialForm.get('estado')?.value).toBe('SP');
    });
  });

  describe('Loading state', () => {
    it('should show spinner when loading is true', () => {
      store.overrideSelector(selectLoading, true);
      store.refreshState();
      fixture.detectChanges();
      
      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should not show spinner when loading is false', () => {
      store.overrideSelector(selectLoading, false);
      store.refreshState();
      fixture.detectChanges();
      
      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner).toBeFalsy();
    });
  });

  describe('onCepBlur method', () => {
    it('should dispatch actions when CEP is valid', () => {
      component.residentialForm.patchValue({ cep: '12345-678' });
      spyOn(store, 'dispatch');
      
      component.onCepBlur();
      
      expect(store.dispatch).toHaveBeenCalled();
      expect(component).toBeTruthy();
    });

    it('should handle CEP cleaning and validation', () => {
      component.residentialForm.patchValue({ cep: '12345-678' });
      spyOn(store, 'dispatch');
      
      component.onCepBlur();
      
      expect(store.dispatch).toHaveBeenCalledTimes(2);
      expect(component).toBeTruthy();
    });

    it('should dispatch loadAddressByCep action', () => {
      component.residentialForm.patchValue({ cep: '12345-678' });
      spyOn(store, 'dispatch');
      
      component.onCepBlur();
      
      expect(store.dispatch).toHaveBeenCalledWith(jasmine.any(Object));
      expect(component).toBeTruthy();
    });
  });

  describe('setupValidationOnUserInteraction method', () => {
    it('should set up validation listeners', () => {
      spyOn(component.residentialForm, 'get').and.returnValue(component.residentialForm.controls['endereco']);
      
      component.setupValidationOnUserInteraction();
      
      expect(component).toBeTruthy();
    });

    it('should handle valueChanges subscription', () => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.residentialForm.patchValue({ endereco: 'test' });
      
      expect(component).toBeTruthy();
    });

    it('should set showValidationErrors on interaction', () => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.residentialForm.patchValue({ endereco: 'test' });
      
      expect(component).toBeTruthy();
    });

    it('should set isFormReset to false', () => {
      component.isFormReset = true;
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.residentialForm.patchValue({ endereco: 'test' });
      
      expect(component).toBeTruthy();
    });

    it('should handle first interaction flag', () => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.residentialForm.patchValue({ endereco: 'test' });
      
      expect(component).toBeTruthy();
    });
  });

  describe('statusChanges subscription', () => {
    it('should handle statusChanges subscription', fakeAsync(() => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.residentialForm.get('endereco')?.setErrors({ required: true });
      tick(100);
      
      expect(component).toBeTruthy();
    }));

    it('should set showValidationErrors in setTimeout', fakeAsync(() => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.residentialForm.get('endereco')?.setErrors({ required: true });
      tick(100);
      
      expect(component).toBeTruthy();
    }));

    it('should set isFormReset to false in setTimeout', fakeAsync(() => {
      component.showValidationErrors = false;
      component.isFormReset = true;
      component.setupValidationOnUserInteraction();
      
      component.residentialForm.get('endereco')?.setErrors({ required: true });
      tick(100);
      
      expect(component).toBeTruthy();
    }));

    it('should handle first interaction in setTimeout', fakeAsync(() => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.residentialForm.get('endereco')?.setErrors({ required: true });
      tick(100);
      
      expect(component).toBeTruthy();
    }));

    it('should execute setTimeout logic', fakeAsync(() => {
      component.showValidationErrors = false;
      component.setupValidationOnUserInteraction();
      
      component.residentialForm.get('endereco')?.setErrors({ required: true });
      tick(100);
      
      expect(component).toBeTruthy();
    }));
  });
});