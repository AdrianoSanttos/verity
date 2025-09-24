import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { NgxMaskDirective } from 'ngx-mask';
import { Observable } from 'rxjs';

import { ResidentialInfo } from '../../models/form-data.interface';
import { loadAddressByCep, setCurrentStep, setStepValidated, updateResidentialInfo } from '../../store/form.actions';
import { AppState } from '../../store/form.reducer';
import { selectLoading, selectResidentialInfo } from '../../store/form.selectors';

@Component({
  selector: 'app-residential-info',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    NgxMaskDirective
  ],
  template: `
    <mat-card class="step-container">
      <mat-card-header>
        <mat-card-title>Etapa 2: Informações Residenciais</mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        <form [formGroup]="residentialForm" (ngSubmit)="onNext()" [class.form-reset]="isFormReset">
          <mat-form-field class="form-field" appearance="outline">
            <mat-label>CEP</mat-label>
            <input matInput 
                   formControlName="cep"
                   mask="00000-000"
                   placeholder="00000-000"
                   (blur)="onCepBlur()"
                   [attr.aria-describedby]="'cep-error'"
                   [attr.aria-invalid]="residentialForm.get('cep')?.invalid && residentialForm.get('cep')?.touched">
            <mat-error *ngIf="shouldShowError('cep', 'required')">
              CEP é obrigatório
            </mat-error>
            <mat-error *ngIf="shouldShowError('cep', 'invalidCep')">
              CEP deve ter 8 dígitos (ex: 12345-678)
            </mat-error>
            <mat-spinner *ngIf="loading$ | async" 
                         matSuffix 
                         diameter="20"
                         aria-label="Carregando endereço">
            </mat-spinner>
          </mat-form-field>

          <mat-form-field class="form-field" appearance="outline">
            <mat-label>Endereço</mat-label>
            <input matInput 
                   formControlName="endereco"
                   placeholder="Digite seu endereço"
                   [attr.aria-describedby]="'endereco-error'"
                   [attr.aria-invalid]="residentialForm.get('endereco')?.invalid && residentialForm.get('endereco')?.touched">
            <mat-error *ngIf="shouldShowError('endereco', 'required')">
              Endereço é obrigatório
            </mat-error>
          </mat-form-field>

          <mat-form-field class="form-field" appearance="outline">
            <mat-label>Bairro</mat-label>
            <input matInput 
                   formControlName="bairro"
                   placeholder="Digite o bairro"
                   [attr.aria-describedby]="'bairro-error'"
                   [attr.aria-invalid]="residentialForm.get('bairro')?.invalid && residentialForm.get('bairro')?.touched">
            <mat-error *ngIf="shouldShowError('bairro', 'required')">
              Bairro é obrigatório
            </mat-error>
          </mat-form-field>

          <mat-form-field class="form-field" appearance="outline">
            <mat-label>Cidade</mat-label>
            <input matInput 
                   formControlName="cidade"
                   placeholder="Digite a cidade"
                   [attr.aria-describedby]="'cidade-error'"
                   [attr.aria-invalid]="residentialForm.get('cidade')?.invalid && residentialForm.get('cidade')?.touched">
            <mat-error *ngIf="shouldShowError('cidade', 'required')">
              Cidade é obrigatória
            </mat-error>
          </mat-form-field>

          <mat-form-field class="form-field" appearance="outline">
            <mat-label>Estado</mat-label>
            <mat-select formControlName="estado"
                        [attr.aria-describedby]="'estado-error'"
                        [attr.aria-invalid]="residentialForm.get('estado')?.invalid && residentialForm.get('estado')?.touched">
              <mat-option value="">Selecione o Estado</mat-option>
              <mat-option *ngFor="let estado of estados" 
                          [value]="estado.sigla"
                          [attr.aria-label]="estado.nome">
                {{ estado.sigla }} - {{ estado.nome }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="shouldShowError('estado', 'required')">
              Estado é obrigatório
            </mat-error>
          </mat-form-field>

          <div class="button-group">
            <button mat-button 
                    type="button" 
                    (click)="onPrevious()"
                    aria-label="Voltar para etapa anterior">
              Anterior
            </button>
            <button mat-raised-button 
                    color="primary" 
                    type="submit"
                    [disabled]="residentialForm.invalid"
                    aria-label="Avançar para próxima etapa">
              Próximo
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class ResidentialInfoComponent implements OnInit {
  residentialForm: FormGroup;
  residentialInfo$: Observable<ResidentialInfo>;
  loading$: Observable<boolean>;
  isFormReset = false;
  showValidationErrors = true;
  
  // Lista de estados brasileiros
  estados = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store<AppState>
  ) {
    this.residentialInfo$ = this.store.select(selectResidentialInfo);
    this.loading$ = this.store.select(selectLoading);
    
    this.residentialForm = this.fb.group({
      cep: ['', [Validators.required, this.validateCep.bind(this)]],
      endereco: ['', [Validators.required]],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Subscribe to residential info changes
    this.residentialInfo$.subscribe(data => {
      if (data) {
        this.residentialForm.patchValue(data);
        
        // Se todos os campos estão vazios (formulário resetado), reseta estados de validação
        if (!data.endereco && !data.bairro && !data.cep && !data.cidade && !data.estado) {
          this.isFormReset = true;
          this.showValidationErrors = false;
          
          // Múltiplos timeouts para garantir que o reset seja persistente
          setTimeout(() => {
            this.residentialForm.markAsUntouched();
            this.residentialForm.markAsPristine();
            
            // Desabilita validação temporariamente
            Object.keys(this.residentialForm.controls).forEach(key => {
              const control = this.residentialForm.get(key);
              if (control) {
                control.markAsUntouched();
                control.markAsPristine();
                control.setErrors(null);
                control.clearValidators();
                control.updateValueAndValidity();
              }
            });
          }, 0);
          
          // Reaplica validadores após um delay maior
          setTimeout(() => {
            Object.keys(this.residentialForm.controls).forEach(key => {
              const control = this.residentialForm.get(key);
              if (control) {
                // Reaplica validadores baseado no campo
                switch (key) {
                  case 'cep':
                    control.setValidators([Validators.required, this.validateCep.bind(this)]);
                    break;
                  case 'endereco':
                  case 'bairro':
                  case 'cidade':
                    control.setValidators([Validators.required]);
                    break;
                  case 'estado':
                    control.setValidators([Validators.required]);
                    break;
                }
                control.updateValueAndValidity();
              }
            });
            
            // Habilita validação apenas quando usuário interagir com um campo
            this.setupValidationOnUserInteraction();
          }, 100);
          
        } else {
          this.isFormReset = false;
          this.showValidationErrors = true;
        }
      }
    });
  }

  // Custom validator for CEP
  validateCep(control: any): { [key: string]: any } | null {
    if (!control.value) return null;
    
    const cep = control.value.replace(/[^\d]/g, ''); // Remove all non-digits
    if (cep.length !== 8) return { 'invalidCep': true };
    
    return null;
  }

  onCepBlur(): void {
    const cep = this.residentialForm.get('cep')?.value;
    if (cep) {
      const cleanCep = cep.replace(/[^\d]/g, '');
      if (cleanCep.length === 8) {
        // Primeiro salva o CEP no estado
        const currentFormData = this.residentialForm.value;
        this.store.dispatch(updateResidentialInfo({ 
          residentialInfo: { ...currentFormData, cep } 
        }));
        
        // Depois faz a busca
        this.store.dispatch(loadAddressByCep({ cep }));
      }
    }
  }

  onPrevious(): void {
    this.store.dispatch(setCurrentStep({ step: 0 }));
  }

  setupValidationOnUserInteraction(): void {
    let isFirstInteraction = true;
    
    Object.keys(this.residentialForm.controls).forEach(key => {
      const control = this.residentialForm.get(key);
      if (control) {
        // Listener para valueChanges (digitação)
        control.valueChanges.subscribe(() => {
          if (!this.showValidationErrors && isFirstInteraction) {
            this.showValidationErrors = true;
            this.isFormReset = false;
            isFirstInteraction = false;
          }
        });
        
        // Listener para statusChanges (foco)
        control.statusChanges.subscribe(() => {
          if (!this.showValidationErrors && isFirstInteraction) {
            setTimeout(() => {
              this.showValidationErrors = true;
              this.isFormReset = false;
              isFirstInteraction = false;
            }, 50);
          }
        });
      }
    });
  }

  shouldShowError(fieldName: string, errorType: string): boolean {
    const control = this.residentialForm.get(fieldName);
    return this.showValidationErrors && 
           !!control?.hasError(errorType) && 
           !!(control?.touched || control?.dirty);
  }

  onNext(): void {
    if (this.residentialForm.valid) {
      const formValue = this.residentialForm.value;
      this.store.dispatch(updateResidentialInfo({ residentialInfo: formValue }));
      // Marca esta etapa como validada
      this.store.dispatch(setStepValidated({ step: 1, isValid: true }));
      this.store.dispatch(setCurrentStep({ step: 2 }));
    }
  }
}