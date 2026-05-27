import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  validateEmail,
  validatePhone,
  validateCPF,
  validateCNPJ,
  getEmailErrorMessage,
  getPhoneErrorMessage
} from '../lib/validations'

const initialForm = {
  razao_nome: '',
  fantasia_apelido: '',
  inscricao_estadual: '',
  email: '',
  telefone: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: ''
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

function maskCEP(value) {
  const digits = onlyDigits(value)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`
}

export default function CustomerForm({ onSuccess }) {
  const [type, setType] = useState('cpf')
  const [doc, setDoc] = useState('')
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(initialForm)

  function resetForm() {
    setDoc('')
    setForm(initialForm)
    setErrors({})
    setMessage('')
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: null }))
    }
  }

  function handleTypeChange(newType) {
    setType(newType)
    resetForm()
  }

  function handleDocChange(event) {
    const value = event.target.value
    if (type === 'cnpj') {
      setDoc(maskCNPJ(value))
    } else {
      setDoc(maskCPF(value))
    }
    if (errors.doc) {
      setErrors((current) => ({ ...current, doc: null }))
    }
  }

  function handleCepChange(event) {
    updateField('cep', maskCEP(event.target.value))
  }

  async function handleBuscar() {
    const digits = onlyDigits(doc)
    setMessage('')

    if (type === 'cnpj') {
      if (digits.length !== 14) {
        setMessage('CNPJ incompleto')
        return
      }

      setLoadingSearch(true)
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
        if (!res.ok) throw new Error('CNPJ não encontrado')
        const data = await res.json()
        setForm((current) => ({
          ...current,
          razao_nome: data.razao_social || data.nome || '',
          fantasia_apelido: data.nome_fantasia || '',
          cep: maskCEP((data.cep || '').replace(/\D/g, '')),
          logradouro: data.logradouro || data.tipo_logradouro || '',
          bairro: data.bairro || '',
          cidade: data.municipio || data.municipio || data.cidade || '',
          uf: data.uf || data.estado || ''
        }))
        setMessage('✓ Dados carregados com sucesso')
      } catch (error) {
        setMessage(error.message || 'Erro ao consultar CNPJ')
      } finally {
        setLoadingSearch(false)
      }
    } else {
      if (!validateCPF(doc)) {
        setMessage('CPF inválido')
        return
      }
      setMessage('✓ CPF validado — preencha nome e endereço manualmente ou use o CEP.')
    }
  }

  async function handleCepBlur() {
    const cep = onlyDigits(form.cep)
    if (cep.length !== 8) return

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (data.erro) {
        setMessage('CEP não encontrado')
        return
      }

      setForm((current) => ({
        ...current,
        logradouro: data.logradouro || current.logradouro,
        bairro: data.bairro || current.bairro,
        cidade: data.localidade || current.cidade,
        uf: data.uf || current.uf
      }))
      setMessage('✓ Endereço carregado')
    } catch (error) {
      console.error(error)
      setMessage('Erro ao consultar CEP')
    }
  }

  function validateFormFields() {
    const fieldErrors = {}
    const docDigits = onlyDigits(doc)

    if (!docDigits) {
      fieldErrors.doc = type === 'cnpj' ? 'CNPJ é obrigatório' : 'CPF é obrigatório'
    } else if (type === 'cpf') {
      if (docDigits.length !== 11) fieldErrors.doc = 'CPF incompleto'
      else if (!validateCPF(docDigits)) fieldErrors.doc = 'CPF inválido'
    } else {
      if (docDigits.length !== 14) fieldErrors.doc = 'CNPJ incompleto'
      else if (!validateCNPJ(docDigits)) fieldErrors.doc = 'CNPJ inválido'
    }

    if (!form.razao_nome.trim()) fieldErrors.razao_nome = 'Campo obrigatório'

    const emailError = getEmailErrorMessage(form.email)
    if (emailError) fieldErrors.email = emailError

    const phoneError = getPhoneErrorMessage(form.telefone)
    if (phoneError) fieldErrors.telefone = phoneError

    if (!form.cep.trim()) fieldErrors.cep = 'CEP é obrigatório'
    if (!form.logradouro.trim()) fieldErrors.logradouro = 'Logradouro é obrigatório'
    if (!form.numero.trim()) fieldErrors.numero = 'Número é obrigatório'
    if (!form.cidade.trim()) fieldErrors.cidade = 'Cidade é obrigatória'
    if (!form.uf.trim()) fieldErrors.uf = 'Estado é obrigatório'

    return {
      valid: Object.keys(fieldErrors).length === 0,
      fieldErrors
    }
  }

  async function handleSave() {
    const { valid, fieldErrors } = validateFormFields()
    if (!valid) {
      setErrors(fieldErrors)
      setMessage('Corrija os campos em vermelho.')
      return
    }

    const cpfcnpj = onlyDigits(doc)
    setSaving(true)
    setMessage('')

    try {
      const { data: existing, error: selErr } = await supabase
        .from('clientes')
        .select('id')
        .eq('cpf_cnpj', cpfcnpj)
        .limit(1)

      if (selErr) throw selErr
      if (existing && existing.length > 0) {
        setMessage('Este cliente já está cadastrado')
        return
      }

      const payload = {
        tipo: type,
        cpf_cnpj: cpfcnpj,
        razao_nome: form.razao_nome,
        fantasia_apelido: form.fantasia_apelido,
        inscricao_estadual: form.inscricao_estadual,
        email: form.email,
        telefone: form.telefone,
        cep: onlyDigits(form.cep),
        logradouro: form.logradouro,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        uf: form.uf
      }

      const { error: insErr } = await supabase.from('clientes').insert(payload)
      if (insErr) throw insErr

      setMessage('✓ Cadastro salvo com sucesso')
      resetForm()
      if (onSuccess) onSuccess()
    } catch (error) {
      setMessage('Erro ao salvar: ' + (error.message || JSON.stringify(error)))
    } finally {
      setSaving(false)
    }
  }

  function requiredFilled() {
    const docDigits = onlyDigits(doc)
    const docReady = type === 'cpf' ? docDigits.length === 11 : docDigits.length === 14
    return (
      docReady &&
      form.razao_nome.trim() &&
      form.email.trim() &&
      form.telefone.trim() &&
      form.cep.trim() &&
      form.logradouro.trim() &&
      form.numero.trim() &&
      form.cidade.trim() &&
      form.uf.trim()
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-2">
          <input type="radio" checked={type === 'cpf'} onChange={() => handleTypeChange('cpf')} />
          Pessoa Física (CPF)
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={type === 'cnpj'} onChange={() => handleTypeChange('cnpj')} />
          Pessoa Jurídica (CNPJ)
        </label>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.startsWith('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="grid gap-4 mb-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium">{type === 'cnpj' ? 'CNPJ *' : 'CPF *'}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={doc}
              onChange={handleDocChange}
              className={`w-full border px-3 py-2 rounded ${errors.doc ? 'border-red-500' : ''}`}
              placeholder={type === 'cnpj' ? 'CNPJ' : 'CPF'}
            />
            <button
              type="button"
              onClick={handleBuscar}
              disabled={loadingSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300"
            >
              {loadingSearch ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          {errors.doc && <p className="text-red-500 text-xs">{errors.doc}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Nome / Razão Social *</label>
          <input
            value={form.razao_nome}
            onChange={(e) => updateField('razao_nome', e.target.value)}
            className={`w-full border px-3 py-2 rounded ${errors.razao_nome ? 'border-red-500' : ''}`}
          />
          {errors.razao_nome && <p className="text-red-500 text-xs">{errors.razao_nome}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Nome Fantasia / Apelido</label>
          <input
            value={form.fantasia_apelido}
            onChange={(e) => updateField('fantasia_apelido', e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {type === 'cnpj' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Inscrição Estadual</label>
            <input
              value={form.inscricao_estadual}
              onChange={(e) => updateField('inscricao_estadual', e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium">E-mail principal *</label>
          <input
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={`w-full border px-3 py-2 rounded ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Telefone / WhatsApp *</label>
          <input
            value={form.telefone}
            onChange={(e) => updateField('telefone', e.target.value)}
            placeholder="(11) 9xxxx-xxxx"
            className={`w-full border px-3 py-2 rounded ${errors.telefone ? 'border-red-500' : ''}`}
          />
          {errors.telefone && <p className="text-red-500 text-xs">{errors.telefone}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">CEP *</label>
          <input
            value={form.cep}
            onChange={handleCepChange}
            onBlur={handleCepBlur}
            className={`w-full border px-3 py-2 rounded ${errors.cep ? 'border-red-500' : ''}`}
            placeholder="00000-000"
          />
          {errors.cep && <p className="text-red-500 text-xs">{errors.cep}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Logradouro *</label>
          <input
            value={form.logradouro}
            onChange={(e) => updateField('logradouro', e.target.value)}
            className={`w-full border px-3 py-2 rounded ${errors.logradouro ? 'border-red-500' : ''}`}
          />
          {errors.logradouro && <p className="text-red-500 text-xs">{errors.logradouro}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Número *</label>
          <input
            value={form.numero}
            onChange={(e) => updateField('numero', e.target.value)}
            className={`w-full border px-3 py-2 rounded ${errors.numero ? 'border-red-500' : ''}`}
          />
          {errors.numero && <p className="text-red-500 text-xs">{errors.numero}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Complemento</label>
          <input
            value={form.complemento}
            onChange={(e) => updateField('complemento', e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Bairro</label>
          <input
            value={form.bairro}
            onChange={(e) => updateField('bairro', e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Cidade *</label>
          <input
            value={form.cidade}
            onChange={(e) => updateField('cidade', e.target.value)}
            className={`w-full border px-3 py-2 rounded ${errors.cidade ? 'border-red-500' : ''}`}
          />
          {errors.cidade && <p className="text-red-500 text-xs">{errors.cidade}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Estado (UF) *</label>
          <input
            value={form.uf}
            onChange={(e) => updateField('uf', e.target.value.toUpperCase())}
            className={`w-full border px-3 py-2 rounded ${errors.uf ? 'border-red-500' : ''}`}
            maxLength="2"
          />
          {errors.uf && <p className="text-red-500 text-xs">{errors.uf}</p>}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!requiredFilled() || saving}
          className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50 hover:bg-green-700"
        >
          {saving ? 'Salvando...' : 'Salvar Cadastro'}
        </button>
      </div>
    </div>
  )
}
