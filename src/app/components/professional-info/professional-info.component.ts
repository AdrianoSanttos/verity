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

import { Profession, ProfessionalInfo } from '../../models/form-data.interface';
import { loadProfessions, setCurrentStep, setStepValidated, updateProfessionalInfo } from '../../store/form.actions';
import { AppState } from '../../store/form.reducer';
import { selectLoading, selectProfessionalInfo, selectProfessions } from '../../store/form.selectors';

@Component({
  selector: 'app-professional-info',
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
        <mat-card-title>Etapa 3: Informações Profissionais</mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        <form [formGroup]="professionalForm" (ngSubmit)="onNext()" [class.form-reset]="isFormReset">
          <mat-form-field class="form-field" appearance="outline">
            <mat-label>Profissão</mat-label>
            <mat-select formControlName="profissao"
                        [attr.aria-describedby]="'profissao-error'"
                        [attr.aria-invalid]="professionalForm.get('profissao')?.invalid && professionalForm.get('profissao')?.touched"
                        [disabled]="(loading$ | async) || false">
              <mat-option *ngFor="let profession of professions$ | async" 
                          [value]="profession.nome"
                          [attr.aria-label]="profession.nome">
                {{ profession.nome }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="shouldShowError('profissao', 'required')">
              Profissão é obrigatória
            </mat-error>
            <mat-spinner *ngIf="loading$ | async" 
                         matSuffix 
                         diameter="20"
                         aria-label="Carregando profissões">
            </mat-spinner>
          </mat-form-field>

          <mat-form-field class="form-field" appearance="outline">
            <mat-label>Empresa</mat-label>
            <input matInput 
                   formControlName="empresa"
                   placeholder="Digite o nome da empresa"
                   [attr.aria-describedby]="'empresa-error'"
                   [attr.aria-invalid]="professionalForm.get('empresa')?.invalid && professionalForm.get('empresa')?.touched">
            <mat-error *ngIf="shouldShowError('empresa', 'required')">
              Empresa é obrigatória
            </mat-error>
            <mat-error *ngIf="shouldShowError('empresa', 'minlength')">
              Nome da empresa deve ter pelo menos 2 caracteres
            </mat-error>
          </mat-form-field>

          <mat-form-field class="form-field" appearance="outline">
            <mat-label>Salário</mat-label>
            <input matInput 
                   formControlName="salario"
                   mask="separator.2"
                   thousandSeparator="."
                   decimalMarker=","
                   prefix="R$ "
                   placeholder="R$ 1.500,00"
                   [leadZeroDateTime]="false"
                   [showMaskTyped]="false"
                   [allowNegativeNumbers]="false"
                   [attr.aria-describedby]="'salario-error'"
                   [attr.aria-invalid]="professionalForm.get('salario')?.invalid && professionalForm.get('salario')?.touched"
                   (focus)="onSalarioFocus($event)"
                   (blur)="onSalarioBlur($event)">
            <mat-error *ngIf="shouldShowError('salario', 'required')">
              Salário é obrigatório
            </mat-error>
            <mat-error *ngIf="shouldShowError('salario', 'min')">
              Salário deve ser maior que zero
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
                    [disabled]="professionalForm.invalid"
                    aria-label="Finalizar formulário">
              Finalizar
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class ProfessionalInfoComponent implements OnInit {
  professionalForm: FormGroup;
  professionalInfo$: Observable<ProfessionalInfo>;
  isFormReset = false;
  showValidationErrors = true;
  professions$: Observable<Profession[]>;
  loading$: Observable<boolean>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store<AppState>
  ) {
    this.professionalInfo$ = this.store.select(selectProfessionalInfo);
    this.professions$ = this.store.select(selectProfessions);
    this.loading$ = this.store.select(selectLoading);
    
    this.professionalForm = this.fb.group({
      profissao: ['', [Validators.required]],
      empresa: ['', [Validators.required, Validators.minLength(2)]],
      salario: ['', [Validators.required, this.validateSalario.bind(this)]]
    });
  }

  ngOnInit(): void {
    this.store.dispatch(loadProfessions());
    
    this.professionalInfo$.subscribe(data => {
      if (data) {
        // Prepara os dados para o formulário
        const formData = { ...data };
        
        // Para ngx-mask separator.2 com prefix, o valor deve ser passado como número
        // A máscara automaticamente formata: 1500 → "R$ 1.500,00"
        
        this.professionalForm.patchValue(formData);
        
        // Se todos os campos estão vazios (formulário resetado), reseta estados de validação
        if (!data.profissao && !data.empresa && (!data.salario || data.salario === 0 || data.salario === '')) {
          this.isFormReset = true;
          this.showValidationErrors = false;
          
          // Múltiplos timeouts para garantir que o reset seja persistente
          setTimeout(() => {
            this.professionalForm.markAsUntouched();
            this.professionalForm.markAsPristine();
            
            // Desabilita validação temporariamente
            Object.keys(this.professionalForm.controls).forEach(key => {
              const control = this.professionalForm.get(key);
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
            Object.keys(this.professionalForm.controls).forEach(key => {
              const control = this.professionalForm.get(key);
              if (control) {
                // Reaplica validadores baseado no campo
                switch (key) {
                  case 'profissao':
                  case 'empresa':
                    control.setValidators([Validators.required, Validators.minLength(2)]);
                    break;
                  case 'salario':
                    control.setValidators([Validators.required, this.validateSalario.bind(this)]);
                    break;
                }
                control.updateValueAndValidity();
              }
            });
            
            // Força a atualização do select de profissões
            const profissaoControl = this.professionalForm.get('profissao');
            if (profissaoControl) {
              profissaoControl.enable();
              profissaoControl.setValue('');
              profissaoControl.updateValueAndValidity();
              
              // Força refresh das profissões
              this.store.dispatch(loadProfessions());
            }
            
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

  onPrevious(): void {
    this.store.dispatch(setCurrentStep({ step: 1 }));
  }

  setupValidationOnUserInteraction(): void {
    let isFirstInteraction = true;
    
    Object.keys(this.professionalForm.controls).forEach(key => {
      const control = this.professionalForm.get(key);
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

  validateSalario(control: any): { [key: string]: any } | null {
    if (control.value === null || control.value === undefined || control.value === '') return null;
    
    let value = control.value;
    if (typeof value === 'string') {
      // Remove R$ e espaços, depois processa a formatação da máscara
      const cleanValue = value.replace('R$ ', '').trim();
      if (cleanValue === '' || cleanValue === '0,00' || cleanValue === ',00') {
        return { 'min': true };
      }
      
      // Converte formato brasileiro (1.500,00) para número
      const numericValue = parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
      value = numericValue;
    }
    
    if (isNaN(value) || value <= 0) {
      return { 'min': true };
    }
    
    return null;
  }

  shouldShowError(fieldName: string, errorType: string): boolean {
    const control = this.professionalForm.get(fieldName);
    return this.showValidationErrors && 
           !!control?.hasError(errorType) && 
           !!(control?.touched || control?.dirty);
  }

  onSalarioFocus(event: any): void {}

  onSalarioBlur(event: any): void {
    // A máscara ngx-mask já cuida da formatação
    // Apenas validar se o valor é válido
    const currentValue = this.professionalForm.get('salario')?.value;
    if (currentValue && typeof currentValue === 'string') { }
  }

  onNext(): void {
    if (this.professionalForm.valid) {
      const formValue = { ...this.professionalForm.value };
      
      // Processa o salário: converte string formatada para número
      if (typeof formValue.salario === 'string') {
        // Remove prefixo R$, espaços e caracteres especiais
        let cleanValue = formValue.salario.replace(/^R\$\s*/, '').trim();
        
        // Parse more robustly - handle different formats
        // Remove all non-numeric characters except comma and period
        cleanValue = cleanValue.replace(/[^\d,.]/g, '');
        
        // Handle Brazilian format: 5.000,00 -> 5000.00
        if (cleanValue.includes('.') && cleanValue.includes(',')) {
          // Brazilian format with thousands separator and decimal comma
          cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
        } else if (cleanValue.includes(',') && !cleanValue.includes('.')) {
          // Simple comma decimal format: 5000,00 -> 5000.00
          cleanValue = cleanValue.replace(',', '.');
        } else if (cleanValue.includes('.') && cleanValue.split('.').length === 2 && cleanValue.split('.')[1].length <= 2) {
          // Already in correct format: 5000.00
          // No change needed
        } else if (cleanValue.includes('.') && cleanValue.split('.').length > 2) {
          // Multiple dots, treat as thousands separator: 5.000.000 -> 5000000
          cleanValue = cleanValue.replace(/\./g, '');
        }
        
        const numericValue = parseFloat(cleanValue);
        
        // Verificação de segurança
        if (!isNaN(numericValue) && numericValue > 0) {
          formValue.salario = numericValue;
        }
      }
      
      this.store.dispatch(updateProfessionalInfo({ professionalInfo: formValue }));
      // Marca esta etapa como validada
      this.store.dispatch(setStepValidated({ step: 2, isValid: true }));
      this.store.dispatch(setCurrentStep({ step: 3 })); // Go to summary
    }
  }
}