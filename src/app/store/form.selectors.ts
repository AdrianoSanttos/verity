import { createSelector } from '@ngrx/store';
import { AppState, FormState } from './form.reducer';

export const selectFormState = (state: AppState) => state.form;

export const selectFormData = createSelector(
  selectFormState,
  (state: FormState) => state.formData
);

export const selectPersonalData = createSelector(
  selectFormData,
  (formData) => formData.personalData
);

export const selectResidentialInfo = createSelector(
  selectFormData,
  (formData) => formData.residentialInfo
);

export const selectProfessionalInfo = createSelector(
  selectFormData,
  (formData) => formData.professionalInfo
);

export const selectCurrentStep = createSelector(
  selectFormData,
  (formData) => formData.currentStep
);

export const selectProfessions = createSelector(
  selectFormState,
  (state: FormState) => state.professions
);

export const selectLoading = createSelector(
  selectFormState,
  (state: FormState) => state.loading
);

export const selectError = createSelector(
  selectFormState,
  (state: FormState) => state.error
);

export const selectValidatedSteps = createSelector(
  selectFormState,
  (state: FormState) => state.validatedSteps
);

export const selectIsStepValid = (stepIndex: number) => createSelector(
  selectValidatedSteps,
  (validatedSteps) => validatedSteps[stepIndex] || false
);