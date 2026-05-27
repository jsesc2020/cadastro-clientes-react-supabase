import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { validateCPF, validateCNPJ } from '../lib/validations'

const initialForm = {
  documentType: 'cpf',
  nome_completo: '',
  cpf_cnpj: '',
  telefone: '',
  pix_key: '',
  banco: '',
  agencia: '',
  conta: ''
}

function onlyDigits(value) {
  return (value || '').replace(/\D/g, '')
}

function maskCPF(value) {
  const digits = onlyDigits(value)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

function maskCNPJ(value) {
  const digits = onlyDigits(value)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
}

export default function ProprietarioForm({ onSuccess }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: null }))
    }
  }

  function handleDocumentChange(event) {
    const value = event.target.value
    if (form.documentType === 'cnpj') {
      updateField('cpf_cnpj', maskCNPJ(value))
    } else {
      updateField('cpf_cnpj', maskCPF(value))
    }
  }

  async function handleDocumentTypeChange(event) {
    const documentType = event.target.value
    setForm((current) => ({ ...initialForm, documentType }))
    setErrors({})
    setMessage('')
  }

  function validateForm() {
    const fieldErrors = {}
    const cpfCnpjDigits = onlyDigits(form.cpf_cnpj)

    if (!form.nome_completo.trim()) fieldErrors.nome_completo = 'Nome é obrigatório'
    if (!cpfCnpjDigits) fieldErrors.cpf_cnpj = 'CPF/CNPJ é obrigatório'
    else if (form.documentType === 'cpf') {
      if (!validateCPF(cpfCnpjDigits)) fieldErrors.cpf_cnpj = 'CPF inválido'
    } else if (form.documentType === 'cnpj') {
      if (!validateCNPJ(cpfCnpjDigits)) fieldErrors.cpf_cnpj = 'CNPJ inválido'
    }

    if (!form.pix_key.trim()) fieldErrors.pix_key = 'Chave Pix é obrigatória'

    return {
      valid: Object.keys(fieldErrors).length === 0,
      fieldErrors
    }
  }

  async function handleSave(event) {
    event.preventDefault()
    setMessage('')
    const { valid, fieldErrors } = validateForm()
    if (!valid) {
      setErrors(fieldErrors)
      setMessage('Corrija os campos em destaque.')
      return
    }

    setSaving(true)
    const cpfCnpjDigits = onlyDigits(form.cpf_cnpj)

    try {
      const { data: existing, error: existingError } = await supabase
        .from('proprietarios')
        .select('id')
        .eq('cpf_cnpj', cpfCnpjDigits)
        .limit(1)

      if (existingError) throw existingError
      if (existing && existing.length > 0) {
        setMessage('Este CPF/CNPJ já está cadastrado.')
        return
      }

      const payload = {
        nome_completo: form.nome_completo.trim(),
        cpf_cnpj: cpfCnpjDigits,
        telefone: form.telefone.trim(),
        dados_bancarios: {
          pix_key: form.pix_key.trim(),
          banco: form.banco.trim(),
          agencia: form.agencia.trim(),
          conta: form.conta.trim()
        }
      }

      const { error } = await supabase.from('proprietarios').insert([payload])
      if (error) throw error

      setMessage('Proprietário cadastrado com sucesso.')
      setForm(initialForm)
      setErrors({})
      if (typeof onSuccess === 'function') onSuccess()
    } catch (error) {
      console.error(error)
      setMessage(error.message || 'Erro ao salvar proprietário.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de documento</label>
          <select
            value={form.documentType}
            onChange={handleDocumentTypeChange}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="cpf">CPF</option>
            <option value="cnpj">CNPJ</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CPF / CNPJ</label>
          <input
            value={form.cpf_cnpj}
            onChange={handleDocumentChange}
            className={`mt-1 block w-full rounded border ${errors.cpf_cnpj ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            placeholder={form.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
          />
          {errors.cpf_cnpj && <p className="mt-1 text-sm text-red-600">{errors.cpf_cnpj}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Nome completo</label>
        <input
          value={form.nome_completo}
          onChange={(event) => updateField('nome_completo', event.target.value)}
          className={`mt-1 block w-full rounded border ${errors.nome_completo ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          placeholder="Nome do proprietário"
        />
        {errors.nome_completo && <p className="mt-1 text-sm text-red-600">{errors.nome_completo}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Telefone</label>
          <input
            value={form.telefone}
            onChange={(event) => updateField('telefone', event.target.value)}
            className="mt-1 block w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="(99) 99999-9999"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Chave Pix</label>
          <input
            value={form.pix_key}
            onChange={(event) => updateField('pix_key', event.target.value)}
            className={`mt-1 block w-full rounded border ${errors.pix_key ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            placeholder="E-mail, CPF/CNPJ ou celular"
          />
          {errors.pix_key && <p className="mt-1 text-sm text-red-600">{errors.pix_key}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Banco</label>
          <input
            value={form.banco}
            onChange={(event) => updateField('banco', event.target.value)}
            className="mt-1 block w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Banco"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Agência</label>
          <input
            value={form.agencia}
            onChange={(event) => updateField('agencia', event.target.value)}
            className="mt-1 block w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Conta</label>
          <input
            value={form.conta}
            onChange={(event) => updateField('conta', event.target.value)}
            className="mt-1 block w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="0000000-0"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-gray-600">Todas as informações financeiras são armazenadas de forma segura em JSONB.</span>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? 'Salvando...' : 'Salvar Proprietário'}
        </button>
      </div>

      {message && <p className="text-sm text-gray-700">{message}</p>}
    </form>
  )
}
