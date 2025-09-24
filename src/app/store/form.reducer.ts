import { createReducer, on } from '@ngrx/store';
import { FormData, Profession } from '../models/form-data.interface';
import * as FormActions from './form.actions';

export interface AppState {
  form: FormState;
}

export interface FormState {
  formData: FormData;
  professions: Profession[];
  loading: boolean;
  error: string | null;
  validatedSteps: boolean[];
}

export const initialState: FormState = {
  formData: {
    personalData: {
      nomeCompleto: '',
      dataNascimento: '',
      cpf: '',
      telefone: ''
    },
    residentialInfo: {
      endereco: '',
      bairro: '',
      cep: '',
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
  professions: [],
  loading: false,
  error: null,
  validatedSteps: [false, false, false, false] // [personalData, residentialInfo, professionalInfo, summary]
};

export const formReducer = createReducer(
  initialState,
  on(FormActions.updatePersonalData, (state, { personalData }) => ({
    ...state,
    formData: {
      ...state.formData,
      personalData
    }
  })),
  on(FormActions.updateResidentialInfo, (state, { residentialInfo }) => ({
    ...state,
    formData: {
      ...state.formData,
      residentialInfo
    }
  })),
  on(FormActions.updateProfessionalInfo, (state, { professionalInfo }) => ({
    ...state,
    formData: {
      ...state.formData,
      professionalInfo
    }
  })),
  on(FormActions.setCurrentStep, (state, { step }) => ({
    ...state,
    formData: {
      ...state.formData,
      currentStep: step
    }
  })),
  on(FormActions.resetForm, () => initialState),
  on(FormActions.loadAddressByCep, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(FormActions.loadAddressByCepSuccess, (state, { address }) => ({
    ...state,
    loading: false,
    formData: {
      ...state.formData,
      residentialInfo: {
        ...state.formData.residentialInfo,
        endereco: address.endereco,
        bairro: address.bairro,
        cidade: address.cidade,
        estado: address.estado
        // CEP é mantido do estado atual (não sobrescrever)
      }
    }
  })),
  on(FormActions.loadAddressByCepFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FormActions.loadProfessions, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(FormActions.loadProfessionsSuccess, (state, { professions }) => ({
    ...state,
    loading: false,
    professions
  })),
  on(FormActions.loadProfessionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(FormActions.setStepValidated, (state, { step, isValid }) => ({
    ...state,
    validatedSteps: state.validatedSteps.map((validated, index) => 
      index === step ? isValid : validated
    )
  }))
);