import { formReducer, initialState } from './form.reducer';
import * as FormActions from './form.actions';
import { PersonalData, ResidentialInfo, ProfessionalInfo } from '../models/form-data.interface';

describe('Form Reducer', () => {
  const mockPersonalData: PersonalData = {
    nomeCompleto: 'João Silva',
    dataNascimento: '1990-01-01',
    cpf: '123.456.789-00',
    telefone: '(11) 99999-9999'
  };

  const mockResidentialInfo: ResidentialInfo = {
    endereco: 'Praça da Sé, 100',
    bairro: 'Sé',
    cep: '01001-000',
    cidade: 'São Paulo',
    estado: 'SP'
  };

  const mockProfessionalInfo: ProfessionalInfo = {
    profissao: 'Desenvolvedor',
    empresa: 'Empresa XYZ',
    salario: 5000
  };

  describe('unknown action', () => {
    it('should return the default state', () => {
      const action = {
        type: 'Unknown'
      } as any;
      const result = formReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('updatePersonalData action', () => {
    it('should update personal data', () => {
      const action = FormActions.updatePersonalData({ personalData: mockPersonalData });
      const result = formReducer(initialState, action);

      expect(result.formData.personalData).toEqual(mockPersonalData);
      expect(result.formData.currentStep).toBe(initialState.formData.currentStep);
    });
  });

  describe('updateResidentialInfo action', () => {
    it('should update residential info', () => {
      const action = FormActions.updateResidentialInfo({ residentialInfo: mockResidentialInfo });
      const result = formReducer(initialState, action);

      expect(result.formData.residentialInfo).toEqual(mockResidentialInfo);
    });
  });

  describe('updateProfessionalInfo action', () => {
    it('should update professional info', () => {
      const action = FormActions.updateProfessionalInfo({ professionalInfo: mockProfessionalInfo });
      const result = formReducer(initialState, action);

      expect(result.formData.professionalInfo).toEqual(mockProfessionalInfo);
    });
  });

  describe('setCurrentStep action', () => {
    it('should set current step', () => {
      const step = 2;
      const action = FormActions.setCurrentStep({ step });
      const result = formReducer(initialState, action);

      expect(result.formData.currentStep).toBe(step);
    });
  });

  describe('setStepValidated action', () => {
    it('should set step as validated', () => {
      const action = FormActions.setStepValidated({ step: 0, isValid: true });
      const result = formReducer(initialState, action);

      expect(result.validatedSteps[0]).toBe(true);
    });

    it('should set step as invalid', () => {
      const action = FormActions.setStepValidated({ step: 1, isValid: false });
      const result = formReducer(initialState, action);

      expect(result.validatedSteps[1]).toBe(false);
    });
  });

  describe('loadProfessions actions', () => {
    it('should set loading to true when loading professions', () => {
      const action = FormActions.loadProfessions();
      const result = formReducer(initialState, action);

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should set loading to false and update professions on success', () => {
      const professions = [
        { id: '1', nome: 'Desenvolvedor' },
        { id: '2', nome: 'Designer' }
      ];
      const action = FormActions.loadProfessionsSuccess({ professions });
      const result = formReducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.professions).toEqual(professions);
      expect(result.error).toBeNull();
    });

    it('should set loading to false and error on failure', () => {
      const error = 'Failed to load professions';
      const action = FormActions.loadProfessionsFailure({ error });
      const result = formReducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe('resetForm action', () => {
    it('should reset form to initial state', () => {
      const modifiedState = {
        ...initialState,
        formData: {
          ...initialState.formData,
          currentStep: 2,
          personalData: mockPersonalData
        }
      };
      const action = FormActions.resetForm();
      const result = formReducer(modifiedState, action);

      expect(result).toEqual(initialState);
    });
  });

  describe('loadAddressByCep actions', () => {
    it('should set loading to true when loading address by CEP', () => {
      const action = FormActions.loadAddressByCep({ cep: '12345-678' });
      const result = formReducer(initialState, action);

      expect(result.loading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should set loading to false and update address on success', () => {
      const address = {
        endereco: 'Rua Teste',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      };
      const action = FormActions.loadAddressByCepSuccess({ address });
      const result = formReducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should set loading to false and error on address failure', () => {
      const error = 'Failed to load address';
      const action = FormActions.loadAddressByCepFailure({ error });
      const result = formReducer(initialState, action);

      expect(result.loading).toBe(false);
      expect(result.error).toBe(error);
    });
  });
});