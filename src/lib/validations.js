/**
 * Validações robustas para e-mail, telefone, CPF e CNPJ
 */

export function validateEmail(email) {
  // RFC 5322 simplified regex
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email.trim())
}

export function validatePhone(phone) {
  // Remove non-digits
  const digits = (phone || '').replace(/\D/g, '')
  // Brazil phone: (11) 9xxxx-xxxx (11 digits with 9) or (11) xxxx-xxxx (10 digits)
  return /^(\d{10}|\d{11})$/.test(digits)
}

export function validateCPF(cpf) {
  const s = (cpf || '').replace(/\D/g, '')
  if (!/^[0-9]{11}$/.test(s)) return false
  
  // Check if all digits are the same (invalid CPF)
  if (/^(\d)\1{10}$/.test(s)) return false
  
  let sum = 0, rem
  for (let i = 1; i <= 9; i++) sum += parseInt(s.substring(i - 1, i)) * (11 - i)
  rem = (sum * 10) % 11
  if (rem === 10) rem = 0
  if (rem !== parseInt(s.substring(9, 10))) return false
  
  sum = 0
  for (let i = 1; i <= 10; i++) sum += parseInt(s.substring(i - 1, i)) * (12 - i)
  rem = (sum * 10) % 11
  if (rem === 10) rem = 0
  if (rem !== parseInt(s.substring(10, 11))) return false
  
  return true
}

export function validateCNPJ(cnpj) {
  const s = (cnpj || '').replace(/\D/g, '')
  if (!/^[0-9]{14}$/.test(s)) return false
  
  // Check if all digits are the same (invalid CNPJ)
  if (/^(\d)\1{13}$/.test(s)) return false
  
  let sum = 0, rem
  const mult1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  
  for (let i = 0; i < 12; i++) sum += parseInt(s.substring(i, i + 1)) * mult1[i]
  rem = (sum % 11) < 2 ? 0 : 11 - (sum % 11)
  if (rem !== parseInt(s.substring(12, 13))) return false
  
  sum = 0
  const mult2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  for (let i = 0; i < 13; i++) sum += parseInt(s.substring(i, i + 1)) * mult2[i]
  rem = (sum % 11) < 2 ? 0 : 11 - (sum % 11)
  if (rem !== parseInt(s.substring(13, 14))) return false
  
  return true
}

export function formatPhone(phone) {
  const digits = (phone || '').replace(/\D/g, '')
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  if (digits.length === 11) return `(${digits.slice(0, 2)}) 9${digits.slice(2, 7)}-${digits.slice(7)}`
  return phone
}

export function getPhoneErrorMessage(phone) {
  const digits = (phone || '').replace(/\D/g, '')
  if (!digits) return 'Telefone é obrigatório'
  if (digits.length < 10) return 'Telefone deve ter pelo menos 10 dígitos'
  if (digits.length > 11) return 'Telefone pode ter no máximo 11 dígitos'
  return null
}

export function getEmailErrorMessage(email) {
  if (!email.trim()) return 'E-mail é obrigatório'
  if (!validateEmail(email)) return 'E-mail inválido'
  return null
}
