import { createAction, props } from '@ngrx/store';
import { CepResponse, PersonalData, Profession, ProfessionalInfo, ResidentialInfo } from '../models/form-data.interface';

// Form Actions
export const updatePersonalData = createAction(
  '[Form] Update Personal Data',
  props<{ personalData: PersonalData }>()
);

export const updateResidentialInfo = createAction(
  '[Form] Update Residential Info',
  props<{ residentialInfo: ResidentialInfo }>()
);

export const updateProfessionalInfo = createAction(
  '[Form] Update Professional Info',
  props<{ professionalInfo: ProfessionalInfo }>()
);

export const setCurrentStep = createAction(
  '[Form] Set Current Step',
  props<{ step: number }>()
);

export const setStepValidated = createAction(
  '[Form] Set Step Validated',
  props<{ step: number; isValid: boolean }>()
);

export const resetForm = createAction('[Form] Reset Form');

// CEP Actions
export const loadAddressByCep = createAction(
  '[CEP] Load Address By CEP',
  props<{ cep: string }>()
);

export const loadAddressByCepSuccess = createAction(
  '[CEP] Load Address By CEP Success',
  props<{ address: CepResponse }>()
);

export const loadAddressByCepFailure = createAction(
  '[CEP] Load Address By CEP Failure',
  props<{ error: string }>()
);

// Profession Actions
export const loadProfessions = createAction('[Profession] Load Professions');

export const loadProfessionsSuccess = createAction(
  '[Profession] Load Professions Success',
  props<{ professions: Profession[] }>()
);

export const loadProfessionsFailure = createAction(
  '[Profession] Load Professions Failure',
  props<{ error: string }>()
);