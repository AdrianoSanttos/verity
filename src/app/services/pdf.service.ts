import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { FormData } from '../models/form-data.interface';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() {}

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    
    // Remove tudo que não é dígito
    const cleanDate = dateString.replace(/\D/g, '');
    
    // Se tem 8 dígitos (ddmmaaaa ou aaaammdd)
    if (cleanDate.length === 8) {
      // Tenta diferentes formatos
      const day = cleanDate.substring(0, 2);
      const month = cleanDate.substring(2, 4);
      const year = cleanDate.substring(4, 8);
      
      // Verifica se é um formato válido (dia <= 31, mês <= 12)
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      
      if (dayNum <= 31 && monthNum <= 12 && monthNum >= 1) {
        return `${day}/${month}/${year}`;
      }
    }
    
    // Se já estiver no formato dd/mm/yyyy, retorna como está
    if (dateString.includes('/')) {
      return dateString;
    }
    
    // Se estiver no formato yyyy-mm-dd, converte para dd/mm/yyyy
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    
    return dateString;
  }

  private formatCPF(cpf: string): string {
    if (!cpf) return '';
    
    // Remove tudo que não é dígito
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Aplica a máscara xxx.xxx.xxx-xx
    if (cleanCPF.length === 11) {
      return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return cpf;
  }

  private formatPhone(phone: string): string {
    if (!phone) return '';
    
    // Remove tudo que não é dígito
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Aplica a máscara (xx) xxxxx-xxxx para celular ou (xx) xxxx-xxxx para fixo
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  }

  private formatSalary(salary: number | string): string {
    if (!salary && salary !== 0) return '';
    
    let numericValue: number;
    
    // Converte para número se for string
    if (typeof salary === 'string') {
      // Remove formatação existente e converte vírgula para ponto
      const cleanSalary = salary.replace(/[^\d,]/g, '').replace(',', '.');
      numericValue = parseFloat(cleanSalary);
    } else {
      numericValue = salary;
    }
    
    // Verifica se é um número válido
    if (isNaN(numericValue)) return '';
    
    // Formata com 2 casas decimais e localização brasileira
    return numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  generatePDF(formData: FormData): void {
    const doc = new jsPDF();
    
    // Configurações do PDF
    doc.setFontSize(20);
    doc.text('Resumo do Formulário', 20, 30);
    
    doc.setFontSize(12);
    let yPosition = 50;
    
    // Dados Pessoais
    doc.setFontSize(16);
    doc.text('Dados Pessoais', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.text(`Nome Completo: ${formData.personalData.nomeCompleto}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Data de Nascimento: ${this.formatDate(formData.personalData.dataNascimento)}`, 20, yPosition);
    yPosition += 10;
    doc.text(`CPF: ${this.formatCPF(formData.personalData.cpf)}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Telefone: ${this.formatPhone(formData.personalData.telefone)}`, 20, yPosition);
    yPosition += 20;
    
    // Informações Residenciais
    doc.setFontSize(16);
    doc.text('Informações Residenciais', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.text(`Endereço: ${formData.residentialInfo.endereco}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Bairro: ${formData.residentialInfo.bairro}`, 20, yPosition);
    yPosition += 10;
    doc.text(`CEP: ${formData.residentialInfo.cep}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Cidade: ${formData.residentialInfo.cidade}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Estado: ${formData.residentialInfo.estado}`, 20, yPosition);
    yPosition += 20;
    
    // Informações Profissionais
    doc.setFontSize(16);
    doc.text('Informações Profissionais', 20, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.text(`Profissão: ${formData.professionalInfo.profissao}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Empresa: ${formData.professionalInfo.empresa}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Salário: R$ ${this.formatSalary(formData.professionalInfo.salario)}`, 20, yPosition);
    
    // Salvar o PDF
    doc.save('formulario-dados.pdf');
  }
}