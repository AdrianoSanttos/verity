import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';

import { PersonalDataComponent } from './components/personal-data/personal-data.component';
import { ProfessionalInfoComponent } from './components/professional-info/professional-info.component';
import { ResidentialInfoComponent } from './components/residential-info/residential-info.component';
import { SummaryComponent } from './components/summary/summary.component';

import { setCurrentStep } from './store/form.actions';
import { AppState } from './store/form.reducer';
import { selectCurrentStep, selectValidatedSteps } from './store/form.selectors';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatToolbarModule,
    MatIconModule,
    PersonalDataComponent,
    ResidentialInfoComponent,
    ProfessionalInfoComponent,
    SummaryComponent
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <mat-icon>assignment</mat-icon>
      <span>Formulário Multi-etapas</span>
    </mat-toolbar>

    <div class="container" role="main">
      <mat-stepper 
        #stepper 
        [selectedIndex]="currentStep$ | async"
        linear="false"
        [orientation]="getStepperOrientation()"
        labelPosition="bottom"
        [animationDuration]="'300ms'"
        (selectionChange)="onStepChange($event)">
        
        <mat-step label="Dados Pessoais" state="person" 
                  [completed]="(validatedSteps$ | async)?.[0] || false">
          <ng-template matStepContent>
            <app-personal-data></app-personal-data>
          </ng-template>
        </mat-step>

        <mat-step label="Informações Residenciais" state="home" 
                  [completed]="(validatedSteps$ | async)?.[1] || false"
                  [optional]="false">
          <ng-template matStepContent>
            <app-residential-info></app-residential-info>
          </ng-template>
        </mat-step>

        <mat-step label="Informações Profissionais" state="work" 
                  [completed]="(validatedSteps$ | async)?.[2] || false"
                  [optional]="false">
          <ng-template matStepContent>
            <app-professional-info></app-professional-info>
          </ng-template>
        </mat-step>

        <mat-step label="Resumo" state="done" 
                  [completed]="(validatedSteps$ | async)?.[3] || false"
                  [optional]="false">
          <ng-template matStepContent>
            <app-summary></app-summary>
          </ng-template>
        </mat-step>

        <!-- Custom icons for stepper -->
        <ng-template matStepperIcon="person">
          <mat-icon>person</mat-icon>
        </ng-template>
        <ng-template matStepperIcon="home">
          <mat-icon>home</mat-icon>
        </ng-template>
        <ng-template matStepperIcon="work">
          <mat-icon>work</mat-icon>
        </ng-template>
        <ng-template matStepperIcon="done">
          <mat-icon>done</mat-icon>
        </ng-template>

      </mat-stepper>
    </div>
  `,
  styles: [`
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .app-toolbar mat-icon {
      margin-right: 8px;
    }

    .container {
      padding: 20px;
      min-height: calc(100vh - 64px);
    }

    mat-stepper {
      background: transparent;
    }

    ::ng-deep .mat-step-header {
      pointer-events: auto;
    }

    /* Visual feedback for blocked/incomplete steps */
    ::ng-deep .mat-step-header:not(.cdk-step-completed) {
      opacity: 0.5;
      cursor: not-allowed !important;
    }

    ::ng-deep .mat-step-header.cdk-step-completed {
      opacity: 1;
      cursor: pointer;
    }

    ::ng-deep .mat-step-header.mat-step-header-selected {
      opacity: 1;
      cursor: default;
    }

    /* Disable pointer events for incomplete steps */
    ::ng-deep .mat-step-header:not(.cdk-step-completed):not(.mat-step-header-selected) {
      pointer-events: none;
    }

    /* Re-enable for completed steps */
    ::ng-deep .mat-step-header.cdk-step-completed {
      pointer-events: auto;
    }

    ::ng-deep .mat-stepper-horizontal .mat-step-header {
      padding: 0 8px;
    }

    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }
      
      ::ng-deep .mat-stepper-horizontal {
        flex-direction: column;
      }
      
      ::ng-deep .mat-stepper-horizontal .mat-step-header {
        margin: 8px 0;
      }
    }
  `]
})
export class AppComponent {
  currentStep$: Observable<number>;
  validatedSteps$: Observable<boolean[]>;

  constructor(private readonly store: Store<AppState>) {
    this.currentStep$ = this.store.select(selectCurrentStep);
    this.validatedSteps$ = this.store.select(selectValidatedSteps);
  }

  onStepChange(event: any): void {
    const targetStep = event.selectedIndex;
    const currentStep = event.previouslySelectedIndex;

    if (targetStep === currentStep) {
      return;
    }

    // Use take(1) para garantir que a subscription seja fechada automaticamente
    this.validatedSteps$.pipe(take(1)).subscribe((validatedSteps: boolean[]) => {
      const allStepsInvalid = validatedSteps.every((step: boolean) => !step);
      if (targetStep === 0 && allStepsInvalid) {
        this.store.dispatch(setCurrentStep({ step: 0 }));
        return;
      }

      if (targetStep < currentStep) {
        this.handleBackwardNavigation(targetStep, currentStep, validatedSteps);
        return;
      }

      if (targetStep > currentStep) {
        this.handleForwardNavigation(targetStep, currentStep, validatedSteps);
      }
    });
  }

  private handleBackwardNavigation(targetStep: number, currentStep: number, validatedSteps: boolean[]): void {
    if (validatedSteps[targetStep]) {
      this.store.dispatch(setCurrentStep({ step: targetStep }));
      return;
    }
    
    // Block navigation - reset to current step if different
    if (currentStep !== targetStep) {
      setTimeout(() => {
        this.store.dispatch(setCurrentStep({ step: currentStep }));
      }, 0);
    }
  }

  private handleForwardNavigation(targetStep: number, currentStep: number, validatedSteps: boolean[]): void {
    const isSequentialNext = targetStep === currentStep + 1;
    const isCurrentStepValid = validatedSteps[currentStep];

    if (isSequentialNext && isCurrentStepValid) {
      this.store.dispatch(setCurrentStep({ step: targetStep }));
      return;
    }
    
    // Block navigation - reset to current step if different
    if (currentStep !== targetStep) {
      setTimeout(() => {
        this.store.dispatch(setCurrentStep({ step: currentStep }));
      }, 0);
    }
  }

  getStepperOrientation(): 'horizontal' | 'vertical' {
    return window.innerWidth < 768 ? 'vertical' : 'horizontal';
  }

  // This method determines if a step is completed (for stepper display)
  isStepCompleted(stepIndex: number): boolean {
    // Use async pipe in template instead of synchronous subscription
    return false; // Will be overridden by template logic
  }
}