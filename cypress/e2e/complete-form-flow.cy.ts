/// <reference types="cypress" />

describe('Verity App - Formulário Multi-etapas (Cypress)', () => {
  beforeEach(() => {
    // Visita a página inicial da aplicação
    cy.visit('/')
    
    // Verifica se a aplicação carregou corretamente
    cy.get('[data-cy="app-toolbar"]').should('be.visible')
    cy.get('[data-cy="app-stepper"]').should('be.visible')
  })

  it('deve preencher todo o formulário e chegar ao resumo final', () => {
    // ===============================
    // VERIFICAÇÕES INICIAIS
    // ===============================
    
    // Aguarda um pouco para o Angular carregar
    cy.wait(2000)
    
    // Debug: vamos ver o que está na tela
    cy.get('body').then(($body) => {
      cy.log('Conteúdo da página carregado')
    })
    
    // Tenta primeiro encontrar qualquer elemento do stepper
    cy.get('mat-stepper', { timeout: 15000 }).should('be.visible')
    
    // ===============================
    // ETAPA 1: DADOS PESSOAIS
    // ===============================
    
    // Verifica se o container dos dados pessoais está visível
    cy.get('[data-cy="personal-data-container"]').should('be.visible')
    
    // Preenche os dados pessoais
    cy.get('[data-cy="nome-completo-input"]')
      .should('be.visible')
      .type('João da Silva Santos')
    
    cy.get('[data-cy="data-nascimento-input"]')
      .should('be.visible')
      .type('15/03/1990')
    
    cy.get('[data-cy="cpf-input"]')
      .should('be.visible')
      .type('12345678901')
    
    cy.get('[data-cy="telefone-input"]')
      .should('be.visible')
      .type('11987654321')
    
    // Clica no botão "Próximo" para ir para a próxima etapa
    cy.get('[data-cy="personal-data-next-button"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click()
    
    // ===============================
    // ETAPA 2: INFORMAÇÕES RESIDENCIAIS
    // ===============================
    
    // Aguarda a navegação para a segunda etapa
    cy.wait(1000)
    
    // Verifica se chegamos na segunda etapa
    cy.get('[data-cy="residential-info-container"]').should('be.visible')
    
    // Preenche o CEP
    cy.get('[data-cy="cep-input"]')
      .should('be.visible')
      .type('01310100')
    
    // Aguarda o carregamento automático do endereço (loading spinner pode aparecer)
    cy.get('[data-cy="cep-loading-spinner"]', { timeout: 3000 }).should('not.exist')
    
    // Verifica se os campos foram preenchidos automaticamente e complementa se necessário
    cy.get('[data-cy="endereco-input"]').then(($el) => {
      if (!$el.val()) {
        cy.wrap($el).type('Av. Paulista, 1000')
      }
    })
    
    cy.get('[data-cy="bairro-input"]').then(($el) => {
      if (!$el.val()) {
        cy.wrap($el).type('Bela Vista')
      }
    })
    
    cy.get('[data-cy="cidade-input"]').then(($el) => {
      if (!$el.val()) {
        cy.wrap($el).type('São Paulo')
      }
    })
    
    // Seleciona o estado se não estiver preenchido
    cy.get('[data-cy="estado-select"]').click()
    cy.get('[data-cy="estado-option-SP"]').click()
    
    // Clica no botão "Próximo"
    cy.get('[data-cy="residential-info-next-button"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click()
    
    // ===============================
    // ETAPA 3: INFORMAÇÕES PROFISSIONAIS
    // ===============================
    
    // Aguarda a navegação para a terceira etapa
    cy.wait(1000)
    
    // Verifica se chegamos na terceira etapa
    cy.get('[data-cy="professional-info-container"]').should('be.visible')
    
    // Aguarda o carregamento das profissões
    cy.get('[data-cy="profissoes-loading-spinner"]', { timeout: 3000 }).should('not.exist')
    
    // Seleciona uma profissão
    cy.get('[data-cy="profissao-select"]')
      .should('be.visible')
      .click()
    
    // Seleciona a primeira profissão disponível
    cy.get('[data-cy="profissao-option-1"]')
      .should('be.visible')
      .click()
    
    // Preenche o nome da empresa
    cy.get('[data-cy="empresa-input"]')
      .should('be.visible')
      .type('Empresa Exemplo Ltda')
    
    // Preenche o salário
    cy.get('[data-cy="salario-input"]')
      .should('be.visible')
      .type('5000')
    
    // Clica no botão "Finalizar" para ir ao resumo
    cy.get('[data-cy="professional-info-finish-button"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click()
    
    // ===============================
    // ETAPA 4: RESUMO FINAL
    // ===============================
    
    // Aguarda a navegação para o resumo
    cy.wait(1000)
    
    // Verifica se chegamos na etapa de resumo
    cy.get('[data-cy="summary-container"]').should('be.visible')
    
    // Verifica se os dados estão sendo exibidos corretamente no resumo
    cy.get('[data-cy="personal-data-summary"]').should('be.visible')
    cy.get('[data-cy="residential-info-summary"]').should('be.visible')
    cy.get('[data-cy="professional-info-summary"]').should('be.visible')
    
    // Verifica se o nome está sendo exibido
    cy.get('[data-cy="summary-nome"]')
      .should('contain.text', 'João da Silva Santos')
    
    // Verifica se o CEP está sendo exibido (pode estar com ou sem formatação)
    cy.get('[data-cy="summary-cep"]')
      .should('contain.text', '01310')
    
    // Verifica se a empresa está sendo exibida
    cy.get('[data-cy="summary-empresa"]')
      .should('contain.text', 'Empresa Exemplo Ltda')
    
    // Verifica se os botões de ação estão disponíveis
    cy.get('[data-cy="summary-export-pdf-button"]')
      .should('be.visible')
      .should('not.be.disabled')
    
    cy.get('[data-cy="summary-new-form-button"]')
      .should('be.visible')
      .should('not.be.disabled')
    
    // ===============================
    // VALIDAÇÃO FINAL
    // ===============================
    
    // Verifica se conseguimos chegar ao resumo (indicando sucesso)
    cy.get('[data-cy="summary-export-pdf-button"]').should('be.visible')
    cy.get('[data-cy="summary-new-form-button"]').should('be.visible')
    
    // Teste opcional: clica no botão "Exportar PDF" para verificar se funciona
    // (comentado pois pode gerar download real)
    // cy.get('[data-cy="summary-export-pdf-button"]').click()
    
    // Sucesso: chegamos ao final do fluxo completo!
    cy.log('✅ Formulário multi-etapas concluído com sucesso!')
  })
})