import * as fromForm from './form.selectors';
import { FormState } from './form.reducer';

describe('Form Selectors', () => {
  const mockFormState: FormState = {
    formData: {
      personalData: {
        nomeCompleto: 'João Silva',
        dataNascimento: '1990-01-01',
        cpf: '123.456.789-00',
        telefone: '(11) 99999-9999'
      },
      residentialInfo: {
        endereco: 'Praça da Sé, 100',
        bairro: 'Sé',
        cep: '01001-000',
        cidade: 'São Paulo',
        estado: 'SP'
      },
      professionalInfo: {
        profissao: 'Desenvolvedor',
        empresa: 'Empresa XYZ',
        salario: 5000
      },
      currentStep: 1
    },
    professions: [
      { id: '1', nome: 'Desenvolvedor' },
      { id: '2', nome: 'Designer' }
    ],
    loading: false,
    error: null,
    validatedSteps: [true, false, false, false]
  };

  describe('selectFormData', () => {
    it('should select form data', () => {
      const result = fromForm.selectFormData.projector(mockFormState);
      expect(result).toEqual(mockFormState.formData);
    });
  });

  describe('selectCurrentStep', () => {
    it('should select current step', () => {
      const result = fromForm.selectCurrentStep.projector(mockFormState.formData);
      expect(result).toBe(1);
    });
  });

  describe('selectPersonalData', () => {
    it('should select personal data', () => {
      const result = fromForm.selectPersonalData.projector(mockFormState.formData);
      expect(result).toEqual(mockFormState.formData.personalData);
    });
  });

  describe('selectResidentialInfo', () => {
    it('should select residential info', () => {
      const result = fromForm.selectResidentialInfo.projector(mockFormState.formData);
      expect(result).toEqual(mockFormState.formData.residentialInfo);
    });
  });

  describe('selectProfessionalInfo', () => {
    it('should select professional info', () => {
      const result = fromForm.selectProfessionalInfo.projector(mockFormState.formData);
      expect(result).toEqual(mockFormState.formData.professionalInfo);
    });
  });

  describe('selectProfessions', () => {
    it('should select professions list', () => {
      const result = fromForm.selectProfessions.projector(mockFormState);
      expect(result).toEqual(mockFormState.professions);
    });
  });

  describe('selectLoading', () => {
    it('should select loading state', () => {
      const result = fromForm.selectLoading.projector(mockFormState);
      expect(result).toBe(false);
    });
  });

  describe('selectError', () => {
    it('should select error state', () => {
      const result = fromForm.selectError.projector(mockFormState);
      expect(result).toBeNull();
    });
  });

  describe('selectValidatedSteps', () => {
    it('should select validated steps', () => {
      const result = fromForm.selectValidatedSteps.projector(mockFormState);
      expect(result).toEqual([true, false, false, false]);
    });
  });

  describe('selectIsStepValid', () => {
    it('should select if step is valid', () => {
      const selector = fromForm.selectIsStepValid(0);
      const result = selector.projector([true, false, false, false]);
      expect(result).toBe(true);
    });

    it('should return false for invalid step', () => {
      const selector = fromForm.selectIsStepValid(1);
      const result = selector.projector([true, false, false, false]);
      expect(result).toBe(false);
    });
  });
});