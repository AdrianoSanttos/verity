/// <reference types="cypress" />

describe('Verity App - Teste Simples (Debug)', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(2000) // Aguarda o Angular carregar
  })

  it('deve carregar a aplicação e preencher a primeira etapa', () => {
    // Verifica se a aplicação carregou
    cy.get('[data-cy="app-toolbar"]').should('be.visible')
    cy.get('[data-cy="app-stepper"]').should('be.visible')
    
    // Verifica se estamos na primeira etapa
    cy.get('[data-cy="personal-data-container"]').should('be.visible')
    
    // Preenche apenas o nome para testar
    cy.get('[data-cy="nome-completo-input"]')
      .should('be.visible')
      .type('João Silva')
    
    // Verifica se o campo foi preenchido
    cy.get('[data-cy="nome-completo-input"]')
      .should('have.value', 'João Silva')
    
    cy.log('✅ Primeira etapa carregou corretamente!')
  })
})