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
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
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