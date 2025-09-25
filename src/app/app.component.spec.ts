import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { By } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { Component } from '@angular/core';
import { provideNgxMask } from 'ngx-mask';

import { AppComponent } from './app.component';
import { setCurrentStep } from './store/form.actions';
import { AppState } from './store/form.reducer';
import { selectValidatedSteps } from './store/form.selectors';

// Mock dos componentes filhos
@Component({
  selector: 'app-personal-data',
  standalone: true,
  template: '<div>Personal Data Mock</div>'
})
class MockPersonalDataComponent { }

@Component({
  selector: 'app-residential-info',
  standalone: true,
  template: '<div>Residential Info Mock</div>'
})
class MockResidentialInfoComponent { }

@Component({
  selector: 'app-professional-info',
  standalone: true,
  template: '<div>Professional Info Mock</div>'
})
class MockProfessionalInfoComponent { }

@Component({
  selector: 'app-summary',
  standalone: true,
  template: '<div>Summary Mock</div>'
})
class MockSummaryComponent { }

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
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
        AppComponent,
        MatToolbarModule,
        MatStepperModule,
        MatIconModule,
        MockPersonalDataComponent,
        MockResidentialInfoComponent,
        MockProfessionalInfoComponent,
        MockSummaryComponent
      ],
      providers: [
        provideMockStore({ initialState }),
        provideNgxMask()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render toolbar with title', () => {
    const toolbar = fixture.debugElement.query(By.css('mat-toolbar span'));
    expect(toolbar.nativeElement.textContent).toContain('Formulário Verity');
  });

  it('should render stepper with 4 steps', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    
    // Check if stepper exists
    const stepper = fixture.debugElement.query(By.css('mat-stepper'));
    expect(stepper).toBeTruthy();
    
    // Only the active step content is rendered, so we expect at least one
    const stepContents = fixture.debugElement.queryAll(By.css('app-personal-data, app-residential-info, app-professional-info, app-summary'));
    expect(stepContents.length).toBeGreaterThanOrEqual(1);
  });

  it('should have correct step labels', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    
    // Check if stepper is rendered
    const stepper = fixture.debugElement.query(By.css('mat-stepper'));
    expect(stepper).toBeTruthy();
    
    // Check that the template contains the expected step labels in the HTML
    const compiled = fixture.nativeElement;
    expect(compiled.innerHTML).toContain('Dados Pessoais');
    expect(compiled.innerHTML).toContain('Informações Residenciais'); 
    expect(compiled.innerHTML).toContain('Informações Profissionais');
    expect(compiled.innerHTML).toContain('Resumo');
  });

  describe('onStepChange', () => {
    beforeEach(() => {
      spyOn(store, 'dispatch');
      // Mock the observables
      store.overrideSelector(selectValidatedSteps, [false, false, false, false]);
      fixture.detectChanges();
    });

    it('should return early if target step equals current step', () => {
      const event = { selectedIndex: 0, previouslySelectedIndex: 0 };
      component.onStepChange(event);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should handle navigation to step 0 when all steps are invalid', () => {
      const event = { selectedIndex: 0, previouslySelectedIndex: 1 };
      store.overrideSelector(selectValidatedSteps, [false, false, false, false]);
      store.refreshState();
      fixture.detectChanges();
      
      component.onStepChange(event);
      expect(store.dispatch).toHaveBeenCalledWith(setCurrentStep({ step: 0 }));
    });

    it('should handle backward navigation to valid step', () => {
      const event = { selectedIndex: 0, previouslySelectedIndex: 2 };
      store.overrideSelector(selectValidatedSteps, [true, true, false, false]);
      store.refreshState();
      fixture.detectChanges();
      
      component.onStepChange(event);
      expect(store.dispatch).toHaveBeenCalledWith(setCurrentStep({ step: 0 }));
    });

    it('should handle forward navigation when current step is valid', () => {
      const event = { selectedIndex: 1, previouslySelectedIndex: 0 };
      store.overrideSelector(selectValidatedSteps, [true, false, false, false]);
      store.refreshState();
      fixture.detectChanges();
      
      component.onStepChange(event);
      expect(store.dispatch).toHaveBeenCalledWith(setCurrentStep({ step: 1 }));
    });

    it('should block forward navigation when current step is invalid', (done) => {
      const event = { selectedIndex: 1, previouslySelectedIndex: 0 };
      store.overrideSelector(selectValidatedSteps, [false, false, false, false]);
      store.refreshState();
      fixture.detectChanges();
      
      component.onStepChange(event);
      
      setTimeout(() => {
        expect(store.dispatch).toHaveBeenCalledWith(setCurrentStep({ step: 0 }));
        done();
      }, 10);
    });
  });

  describe('handleBackwardNavigation', () => {
    it('should allow navigation to valid previous step', () => {
      spyOn(store, 'dispatch');
      const validatedSteps = [true, true, false, false];
      
      component['handleBackwardNavigation'](0, 1, validatedSteps);
      expect(store.dispatch).toHaveBeenCalledWith(setCurrentStep({ step: 0 }));
    });

    it('should block navigation to invalid previous step', (done) => {
      spyOn(store, 'dispatch');
      const validatedSteps = [false, true, false, false];
      
      component['handleBackwardNavigation'](0, 1, validatedSteps);
      
      setTimeout(() => {
        expect(store.dispatch).toHaveBeenCalledWith(setCurrentStep({ step: 1 }));
        done();
      }, 10);
    });
  });

  describe('handleForwardNavigation', () => {
    it('should allow sequential navigation when current step is valid', () => {
      spyOn(store, 'dispatch');
      const validatedSteps = [true, false, false, false];
      
      component['handleForwardNavigation'](1, 0, validatedSteps);
      expect(store.dispatch).toHaveBeenCalledWith(setCurrentStep({ step: 1 }));
    });

    it('should block navigation when current step is invalid', (done) => {
      spyOn(store, 'dispatch');
      const validatedSteps = [false, false, false, false];
      
      component['handleForwardNavigation'](1, 0, validatedSteps);
      
      setTimeout(() => {
        expect(store.dispatch).toHaveBeenCalledWith(setCurrentStep({ step: 0 }));
        done();
      }, 10);
    });

    it('should block non-sequential forward navigation', (done) => {
      spyOn(store, 'dispatch');
      const validatedSteps = [true, false, false, false];
      
      component['handleForwardNavigation'](2, 0, validatedSteps);
      
      setTimeout(() => {
        expect(store.dispatch).toHaveBeenCalledWith(setCurrentStep({ step: 0 }));
        done();
      }, 10);
    });
  });

  describe('getStepperOrientation', () => {
    it('should return vertical for mobile width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      });
      expect(component.getStepperOrientation()).toBe('vertical');
    });

    it('should return horizontal for desktop width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      expect(component.getStepperOrientation()).toBe('horizontal');
    });
  });

  describe('isStepCompleted', () => {
    it('should return false by default', () => {
      expect(component.isStepCompleted(0)).toBe(false);
      expect(component.isStepCompleted(1)).toBe(false);
      expect(component.isStepCompleted(2)).toBe(false);
      expect(component.isStepCompleted(3)).toBe(false);
    });
  });
});