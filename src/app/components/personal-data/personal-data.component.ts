import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngrx/store';
import { NgxMaskDirective } from 'ngx-mask';
import { Observable } from 'rxjs';

import { PersonalData } from '../../models/form-data.interface';
import { setCurrentStep, setStepValidated, updatePersonalData } from '../../store/form.actions';
import { AppState } from '../../store/form.reducer';
import { selectPersonalData } from '../../store/form.selectors';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    NgxMaskDirective
  ],
  template: `
    <mat-card class="step-container">
      <mat-card-header>
        <mat-card-title>Etapa 1: Dados Pessoais</mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        <form [formGroup]="personalForm" (ngSubmit)="onNext()" [class.form-reset]="isFormReset">
          <mat-form-field class="form-field" appearance="outline">
            <mat-label>Nome Completo</mat-label>
            <input matInput 
                   formControlName="nomeCompleto"
                   placeholder="Digite seu nome completo"
                   [attr.aria-describedby]="'nome-error'"
                   [attr.aria-invalid]="personalForm.get('nomeCompleto')?.invalid && personalForm.get('nomeCompleto')?.touched">
            <mat-error *ngIf="shouldShowError('nomeCompleto', 'required')">
              Nome completo é obrigatório
            </mat-error>
            <mat-error *ngIf="shouldShowError('nomeCompleto', 'minlength')">
              Nome deve ter pelo menos 3 caracteres
            </mat-error>
          </mat-form-field>

          <mat-form-field class="form-field" appearance="outline">
            <mat-label>Data de Nascimento</mat-label>
            <input matInput 
                   formControlName="dataNascimento"
                   mask="00/00/0000"
                   placeholder="dd/mm/aaaa"
                   [attr.aria-describedby]="'data-error'"
                   [attr.aria-invalid]="personalForm.get('dataNascimento')?.invalid && personalForm.get('dataNascimento')?.touched">
            <mat-error *ngIf="shouldShowError('dataNascimento', 'required')">
              Data de nascimento é obrigatória
            </mat-error>
            <mat-error *ngIf="shouldShowError('dataNascimento', 'invalidDate')">
              Data inválida. Use o formato dd/mm/aaaa
            </mat-error>
          </mat-form-field>

          <mat-form-field class="form-field" appearance="outline">
            <mat-label>CPF</mat-label>
            <input matInput 
                   formControlName="cpf"
                   mask="000.000.000-00"
                   placeholder="000.000.000-00"
                   [attr.aria-describedby]="'cpf-error'"
                   [attr.aria-invalid]="personalForm.get('cpf')?.invalid && personalForm.get('cpf')?.touched">
            <mat-error *ngIf="shouldShowError('cpf', 'required')">
              CPF é obrigatório
            </mat-error>
            <mat-error *ngIf="shouldShowError('cpf', 'invalidCpf')">
              CPF deve ter 11 dígitos válidos
            </mat-error>
          </mat-form-field>

          <mat-form-field class="form-field" appearance="outline">
            <mat-label>Telefone</mat-label>
            <input matInput 
                   formControlName="telefone"
                   mask="(00) 00000-0000"
                   placeholder="(00) 00000-0000"
                   [attr.aria-describedby]="'telefone-error'"
                   [attr.aria-invalid]="personalForm.get('telefone')?.invalid && personalForm.get('telefone')?.touched">
            <mat-error *ngIf="shouldShowError('telefone', 'required')">
              Telefone é obrigatório
            </mat-error>
            <mat-error *ngIf="shouldShowError('telefone', 'invalidPhone')">
              Telefone deve ter 10 ou 11 dígitos
            </mat-error>
          </mat-form-field>

          <div class="button-group">
            <button mat-raised-button 
                    color="primary" 
                    type="submit"
                    [disabled]="personalForm.invalid"
                    aria-label="Avançar para próxima etapa">
              Próximo
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class PersonalDataComponent implements OnInit {
  personalForm: FormGroup;
  personalData$: Observable<PersonalData>;
  isFormReset = false;
  showValidationErrors = true;

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store<AppState>
  ) {
    this.personalData$ = this.store.select(selectPersonalData);
    
    this.personalForm = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
      dataNascimento: ['', [Validators.required, this.validateDate.bind(this)]],
      cpf: ['', [Validators.required, this.validateCpf.bind(this)]],
      telefone: ['', [Validators.required, this.validatePhone.bind(this)]]
    });
  }

  ngOnInit(): void {
    this.personalData$.subscribe(data => {
      if (data) {
        this.personalForm.patchValue(data);
        
        // Se todos os campos estão vazios (formulário resetado), reseta estados de validação
        if (!data.nomeCompleto && !data.dataNascimento && !data.cpf && !data.telefone) {
          this.isFormReset = true;
          this.showValidationErrors = false;
          
          // Múltiplos timeouts para garantir que o reset seja persistente
          setTimeout(() => {
            this.personalForm.markAsUntouched();
            this.personalForm.markAsPristine();
            
            // Desabilita validação temporariamente
            Object.keys(this.personalForm.controls).forEach(key => {
              const control = this.personalForm.get(key);
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
            Object.keys(this.personalForm.controls).forEach(key => {
              const control = this.personalForm.get(key);
              if (control) {
                // Reaplica validadores baseado no campo
                switch (key) {
                  case 'nomeCompleto':
                    control.setValidators([Validators.required, Validators.minLength(3)]);
                    break;
                  case 'dataNascimento':
                    control.setValidators([Validators.required, this.validateDate.bind(this)]);
                    break;
                  case 'cpf':
                    control.setValidators([Validators.required, this.validateCpf.bind(this)]);
                    break;
                  case 'telefone':
                    control.setValidators([Validators.required, this.validatePhone.bind(this)]);
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

  // Custom validators
  validateDate(control: any): { [key: string]: any } | null {
    if (!control.value) return null;
    
    const value = control.value.replace(/[^\d]/g, ''); // Remove all non-digits
    if (value.length !== 8) return { 'invalidDate': true };
    
    const day = parseInt(value.substring(0, 2));
    const month = parseInt(value.substring(2, 4));
    const year = parseInt(value.substring(4, 8));
    
    if (month < 1 || month > 12) return { 'invalidDate': true };
    if (day < 1 || day > 31) return { 'invalidDate': true };
    if (year < 1900 || year > new Date().getFullYear()) return { 'invalidDate': true };
    
    return null;
  }

  validateCpf(control: any): { [key: string]: any } | null {
    if (!control.value) return null;
    
    const cpf = control.value.replace(/[^\d]/g, ''); // Remove all non-digits
    if (cpf.length !== 11) return { 'invalidCpf': true };
    
    // Check for known invalid CPFs (all same digits)
    if (/^(\d)\1{10}$/.test(cpf)) return { 'invalidCpf': true };
    
    return null;
  }

  validatePhone(control: any): { [key: string]: any } | null {
    if (!control.value) return null;
    
    const phone = control.value.replace(/[^\d]/g, ''); // Remove all non-digits
    if (phone.length < 10 || phone.length > 11) return { 'invalidPhone': true };
    
    return null;
  }

  setupValidationOnUserInteraction(): void {
    let isFirstInteraction = true;
    
    Object.keys(this.personalForm.controls).forEach(key => {
      const control = this.personalForm.get(key);
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
    const control = this.personalForm.get(fieldName);
    return this.showValidationErrors && 
           !!control?.hasError(errorType) && 
           !!(control?.touched || control?.dirty);
  }

  onNext(): void {
    if (this.personalForm.valid) {
      const formValue = this.personalForm.value;
      this.store.dispatch(updatePersonalData({ personalData: formValue }));
      // Marca esta etapa como validada
      this.store.dispatch(setStepValidated({ step: 0, isValid: true }));
      this.store.dispatch(setCurrentStep({ step: 1 }));
    }
  }
}