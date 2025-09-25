# Verity App - Formulário Multi-etapas

Uma aplicação Angular 18 moderna com formulário dividido em 3 etapas, utilizando Angular Material, NgRx para gerenciamento de estado e recursos de acessibilidade.

## 🚀 Funcionalidades

### ✨ Características Principais
- **Formulário Multi-etapas**: 3 etapas bem estruturadas
- **Angular Material**: Interface moderna e responsiva
- **NgRx**: Gerenciamento de estado centralizado
- **Acessibilidade**: Totalmente acessível com ARIA labels
- **Máscaras de Input**: Validações e formatação automática
- **Busca de CEP**: Preenchimento automático de endereço
- **Exportação PDF**: Geração de relatório completo

### 📋 Etapas do Formulário

#### Etapa 1: Dados Pessoais
- Nome completo (validação de mínimo 3 caracteres)
- Data de nascimento (máscara dd/mm/aaaa)
- CPF (máscara 000.000.000-00)
- Telefone (máscara (00) 00000-0000)

#### Etapa 2: Informações Residenciais
- CEP com busca automática
- Endereço (preenchido automaticamente)
- Bairro (preenchido automaticamente)
- Cidade (preenchida automaticamente)
- Estado (preenchido automaticamente)

#### Etapa 3: Informações Profissionais
- Profissão (select com opções da API mockada)
- Empresa
- Salário (máscara monetária R$ 0.000,00)

#### Resumo Final
- Visualização de todos os dados
- Opção de edição
- Exportação para PDF
- Criação de novo formulário

## 🛠️ Tecnologias Utilizadas

- **Angular 18**: Framework principal
- **Angular Material**: Componentes de UI
- **NgRx**: Gerenciamento de estado (Store, Effects, Selectors)
- **RxJS**: Programação reativa
- **ngx-mask**: Máscaras de input
- **jsPDF**: Geração de PDF
- **TypeScript**: Linguagem de programação
- **SCSS**: Pré-processador CSS

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Build para produção
npm run build

# Executar testes
npm test

# Executar linting
npm run lint
```

## 🎯 Arquitetura

### Estrutura de Pastas
```
src/
├── app/
│   ├── components/          # Componentes da aplicação
│   │   ├── personal-data/   # Etapa 1: Dados pessoais
│   │   ├── residential-info/# Etapa 2: Info residenciais
│   │   ├── professional-info/# Etapa 3: Info profissionais
│   │   └── summary/         # Resumo final
│   ├── models/              # Interfaces e tipos
│   ├── services/            # Serviços da aplicação
│   │   ├── cep.service.ts   # Serviço de busca por CEP
│   │   ├── profession.service.ts # Serviço de profissões
│   │   └── pdf.service.ts   # Serviço de geração PDF
│   ├── store/               # Estado NgRx
│   │   ├── form.actions.ts  # Ações do formulário
│   │   ├── form.effects.ts  # Effects para APIs
│   │   ├── form.reducer.ts  # Reducer principal
│   │   └── form.selectors.ts# Seletores de estado
│   ├── app.component.ts     # Componente raiz
│   ├── app.config.ts        # Configuração da app
│   └── main.ts              # Bootstrap da aplicação
├── styles.scss              # Estilos globais
└── index.html               # HTML principal
```

## 🔧 Serviços Mockados

### Serviço de CEP
Simula uma API de busca por CEP que retorna:
- Endereço baseado no CEP
- Bairro, cidade e estado correspondentes
- Delay realista de resposta

### Serviço de Profissões
Mock com lista de profissões incluindo:
- Desenvolvedor de Software
- Analista de Sistemas  
- Gerente de Projetos
- Designer UX/UI
- Analista de Dados
- Arquiteto de Software
- DevOps Engineer
- Product Manager

## ♿ Acessibilidade

- **ARIA Labels**: Todos os campos possuem labels descritivos
- **Navegação por teclado**: Totalmente navegável via teclado
- **Screen readers**: Compatível com leitores de tela
- **Contrast ratios**: Cores com contraste adequado
- **Focus indicators**: Indicadores visuais de foco
- **Error announcements**: Anúncio de erros para usuários com deficiência visual

## 📱 Responsividade

- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: Adaptação para tablets e desktops
- **Stepper responsivo**: Orientação vertical em telas pequenas
- **Botões adaptáveis**: Layout flexível em diferentes telas

## 🔒 Validações

### Validações Implementadas
- **Nome**: Mínimo 3 caracteres
- **Data**: Formato dd/mm/aaaa válido
- **CPF**: Formato 000.000.000-00
- **Telefone**: Formato (00) 00000-0000
- **CEP**: Formato 00000-000
- **Campos obrigatórios**: Validação em todos os campos
- **Salário**: Valor maior que zero

## 📄 Exportação PDF

O sistema gera um PDF completo com:
- Cabeçalho personalizado
- Dados organizados por seções
- Formatação profissional
- Valores monetários formatados em Real (R$)

## Screenshots

Etapa 1 do formulário:

<p align="center">
  <img src="./docs/step1.jpg" alt="Main Page" width="100%">
</p>

Etapa 2 do formulário:

<p align="center">
  <img src="./docs/step2.jpg" alt="Main Page" width="100%">
</p>

Etapa 3 do formulário:

<p align="center">
  <img src="./docs/step3.jpg" alt="Main Page" width="100%">
</p>

Resumo do formulário:

<p align="center">
  <img src="./docs/step4.jpg" alt="Main Page" width="100%">
</p>

Exportação PDF:

<p align="center">
  <img src="./docs/step5.jpg" alt="Main Page" width="100%">
</p>

Test Karma | Jasmine | Front-End:

<p align="center">
  <img src="./docs/karma.jpg" alt="Form Page" width="100%">
</p>

<p align="center">
  <img src="./docs/coverage.jpg" alt="Form Page" width="100%">
</p>

<p align="center">
  <img src="./docs/ngtest.jpg" alt="Form Page" width="60%">
</p>

Responsividade para se adaptar a diferentes layouts de tela:

<p align="center">
  <img src="./docs/responsivo.jpg" alt="Main Page" width="100%">
</p>

## 🚧 Próximas Funcionalidades

- [ ] Integração com API real de CEP
- [ ] Validação de CPF real
- [ ] Salvamento em banco de dados
- [ ] Histórico de formulários
- [ ] Temas personalizáveis
- [ ] Internacionalização (i18n)
- [ ] Testes unitários completos

## 📋 Scripts Disponíveis

```json
{
  "start": "ng serve",
  "build": "ng build", 
  "test": "ng test",
  "lint": "ng lint",
  "e2e": "ng e2e"
}
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/verity`)
3. Commit suas mudanças (`git commit -m 'Add some verity'`)
4. Push para a branch (`git push origin feature/verity`)
5. Abra um Pull Request


## 👨‍💻 Autor

Desenvolvido por Adriano Vieira, usando Angular e as melhores práticas de desenvolvimento frontend.