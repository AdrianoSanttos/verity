export interface PersonalData {
  nomeCompleto: string;
  dataNascimento: string;
  cpf: string;
  telefone: string;
}

export interface ResidentialInfo {
  endereco: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
}

export interface ProfessionalInfo {
  profissao: string;
  empresa: string;
  salario: number | string;
}

export interface FormData {
  personalData: PersonalData;
  residentialInfo: ResidentialInfo;
  professionalInfo: ProfessionalInfo;
  currentStep: number;
}

export interface CepResponse {
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Profession {
  id: string;
  nome: string;
}