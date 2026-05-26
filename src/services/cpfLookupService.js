/**
 * CPF lookup service integration
 * 
 * Supported providers:
 * - Assertiva
 * - Serasa
 * - BigDataCorp
 * 
 * These are paid services that require API keys.
 * This file provides a mock implementation for testing.
 */

const PROVIDERS = {
  ASSERTIVA: 'assertiva',
  SERASA: 'serasa',
  BIGDATACORP: 'bigdatacorp',
}

class CPFLookupService {
  constructor(provider = 'mock', apiKey = null) {
    this.provider = provider
    this.apiKey = apiKey
  }

  /**
   * Lookup CPF data (mock implementation)
   * @param {string} cpf - CPF without formatting
   * @returns {Promise<Object>} CPF data or null if not found
   */
  async lookup(cpf) {
    if (this.provider === 'mock') {
      return this.mockLookup(cpf)
    }

    switch (this.provider) {
      case PROVIDERS.ASSERTIVA:
        return this.assertivaLookup(cpf)
      case PROVIDERS.SERASA:
        return this.serasaLookup(cpf)
      case PROVIDERS.BIGDATACORP:
        return this.bigdatacorpLookup(cpf)
      default:
        console.warn(`Unknown provider: ${this.provider}`)
        return this.mockLookup(cpf)
    }
  }

  /**
   * Mock lookup for testing/development
   */
  async mockLookup(cpf) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock successful response for valid CPF
    if (cpf === '11144477735') {
      return {
        cpf: '111.444.777-35',
        name: 'João da Silva',
        birthDate: '1990-05-15',
        status: 'active',
        source: 'mock',
      }
    }

    // Mock not found response
    return null
  }

  /**
   * Assertiva API integration (requires paid API key)
   * Doc: https://assertiva.com.br/docs
   */
  async assertivaLookup(cpf) {
    if (!this.apiKey) {
      throw new Error('Assertiva API key not configured')
    }

    const url = `https://api.assertiva.com.br/v1/people/${cpf}`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Assertiva API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      cpf: data.cpf,
      name: data.nome || data.name,
      birthDate: data.data_nascimento || data.birthDate,
      status: data.status,
      source: 'assertiva',
    }
  }

  /**
   * Serasa API integration (requires paid API key)
   * Doc: https://www.serasa.com.br/api
   */
  async serasaLookup(cpf) {
    if (!this.apiKey) {
      throw new Error('Serasa API key not configured')
    }

    const url = 'https://api.serasa.com.br/v2/consultas/cpf'
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cpf }),
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`Serasa API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      cpf: data.cpf,
      name: data.nome,
      birthDate: data.data_nascimento,
      status: data.status,
      source: 'serasa',
    }
  }

  /**
   * BigDataCorp API integration (requires paid API key)
   * Doc: https://www.bigdatacorp.com.br/api-consultas
   */
  async bigdatacorpLookup(cpf) {
    if (!this.apiKey) {
      throw new Error('BigDataCorp API key not configured')
    }

    const url = `https://api.bigdatacorp.com.br/check/cpf/${cpf}`
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`BigDataCorp API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      cpf: data.cpf,
      name: data.nome,
      birthDate: data.data_nascimento,
      status: data.situacao,
      source: 'bigdatacorp',
    }
  }

  /**
   * Get provider configuration instructions
   */
  static getProviderSetupInstructions(provider) {
    const instructions = {
      [PROVIDERS.ASSERTIVA]: {
        name: 'Assertiva',
        url: 'https://assertiva.com.br',
        envVar: 'VITE_ASSERTIVA_API_KEY',
        docs: 'https://assertiva.com.br/docs',
      },
      [PROVIDERS.SERASA]: {
        name: 'Serasa',
        url: 'https://www.serasa.com.br',
        envVar: 'VITE_SERASA_API_KEY',
        docs: 'https://www.serasa.com.br/api',
      },
      [PROVIDERS.BIGDATACORP]: {
        name: 'BigDataCorp',
        url: 'https://www.bigdatacorp.com.br',
        envVar: 'VITE_BIGDATACORP_API_KEY',
        docs: 'https://www.bigdatacorp.com.br/api-consultas',
      },
    }
    return instructions[provider] || null
  }
}

// Export singleton instance
export const cpfLookupService = new CPFLookupService(
  import.meta.env.VITE_CPF_LOOKUP_PROVIDER || 'mock',
  import.meta.env.VITE_CPF_LOOKUP_API_KEY || null
)

export default CPFLookupService
export { PROVIDERS }
