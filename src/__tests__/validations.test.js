/**
 * @jest-environment jsdom
 */
import { validateEmail, validatePhone, validateCPF, validateCNPJ } from '../lib/validations'

describe('Validations', () => {
  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('contato@empresa.com.br')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('test..@example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate correct phones', () => {
      expect(validatePhone('1133334444')).toBe(true)  // 10 digits
      expect(validatePhone('11933334444')).toBe(true) // 11 digits with 9
      expect(validatePhone('(11) 3333-4444')).toBe(true)
      expect(validatePhone('(11) 93333-4444')).toBe(true)
    })

    it('should reject invalid phones', () => {
      expect(validatePhone('123')).toBe(false)           // too short
      expect(validatePhone('123456789012')).toBe(false)  // too long
      expect(validatePhone('')).toBe(false)
      expect(validatePhone('abcdefghij')).toBe(false)
    })
  })

  describe('validateCPF', () => {
    it('should validate correct CPF', () => {
      expect(validateCPF('11144477735')).toBe(true)
      expect(validateCPF('111.444.777-35')).toBe(true)
    })

    it('should reject invalid CPF', () => {
      expect(validateCPF('00000000000')).toBe(false)     // all same digits
      expect(validateCPF('11111111111')).toBe(false)
      expect(validateCPF('12345678901')).toBe(false)     // wrong checksum
      expect(validateCPF('123')).toBe(false)             // too short
      expect(validateCPF('')).toBe(false)
    })

    it('should reject CPF with wrong check digits', () => {
      expect(validateCPF('11144477736')).toBe(false) // last digit wrong
      expect(validateCPF('11144477733')).toBe(false) // second check digit wrong
    })
  })

  describe('validateCNPJ', () => {
    it('should validate correct CNPJ', () => {
      expect(validateCNPJ('34028316000103')).toBe(true)
      expect(validateCNPJ('34.028.316/0001-03')).toBe(true)
    })

    it('should reject invalid CNPJ', () => {
      expect(validateCNPJ('00000000000000')).toBe(false)   // all same digits
      expect(validateCNPJ('11111111111111')).toBe(false)
      expect(validateCNPJ('12345678901234')).toBe(false)   // wrong checksum
      expect(validateCNPJ('123')).toBe(false)              // too short
      expect(validateCNPJ('')).toBe(false)
    })

    it('should reject CNPJ with wrong check digits', () => {
      expect(validateCNPJ('34028316000108')).toBe(false) // last digit wrong
      expect(validateCNPJ('34028316000106')).toBe(false) // second check digit wrong
    })
  })
})
