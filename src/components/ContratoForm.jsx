import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const initialForm = {
  ponto_id: '',
  cliente_id: '',
  data_inicio: '',
  data_termino: '',
  valor_mensal: ''
}

function sanitizeNumber(value) {
  return value.replace(/[^0-9.,]/g, '').replace(',', '.')
}

export default function ContratoForm({ onSuccess }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [pontos, setPontos] = useState([])
  const [clientes, setClientes] = useState([])

  useEffect(() => {
    fetchOptions()
  }, [])

  async function fetchOptions() {
    try {
      const [{ data: pontosData, error: pontosError }, { data: clientesData, error: clientesError }] = await Promise.all([
        supabase.from('pontos_inventario').select('id, identificacao, status').order('identificacao', { ascending: true }),
        supabase.from('clientes').select('id, razao_nome, cpf_cnpj').order('razao_nome', { ascending: true })
      ])

      if (pontosError) throw pontosError
      if (clientesError) throw clientesError
      setPontos(pontosData || [])
      setClientes(clientesData || [])
    } catch (error) {
      console.error('Erro ao carregar opções de contrato:', error)
      setMessage('Não foi possível carregar pontos ou clientes para contratos.')
    }
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: null }))
    }
  }

  function validateForm() {
    const fieldErrors = {}
    if (!form.ponto_id) fieldErrors.ponto_id = 'Selecione um ponto'
    if (!form.cliente_id) fieldErrors.cliente_id = 'Selecione um cliente'
    if (!form.data_inicio) fieldErrors.data_inicio = 'Data de início é obrigatória'
    if (!form.data_termino) fieldErrors.data_termino = 'Data de término é obrigatória'
    if (form.data_inicio && form.data_termino && new Date(form.data_termino) < new Date(form.data_inicio)) {
      fieldErrors.data_termino = 'Data de término deve ser posterior à data de início'
    }
    if (!form.valor_mensal.trim()) fieldErrors.valor_mensal = 'Valor mensal é obrigatório'
    else if (Number.isNaN(Number(sanitizeNumber(form.valor_mensal)))) fieldErrors.valor_mensal = 'Valor mensal inválido'
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
      setMessage('Corrija os campos antes de salvar o contrato.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ponto_id: form.ponto_id,
        cliente_id: form.cliente_id,
        data_inicio: form.data_inicio,
        data_termino: form.data_termino,
        valor_mensal: parseFloat(sanitizeNumber(form.valor_mensal)),
        status: 'ATIVO'
      }

      const { data, error } = await supabase.from('contratos').insert([payload]).select('id')
      if (error) throw error

      const { error: updateError } = await supabase
        .from('pontos_inventario')
        .update({ status: 'LOCADO' })
        .eq('id', form.ponto_id)
      if (updateError) throw updateError

      setMessage('Contrato cadastrado com sucesso e ponto marcado como LOCADO.')
      setForm(initialForm)
      setErrors({})
      if (typeof onSuccess === 'function') onSuccess()
    } catch (error) {
      console.error(error)
      setMessage(error.message || 'Erro ao salvar contrato.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ponto de mídia</label>
          <select
            value={form.ponto_id}
            onChange={(event) => updateField('ponto_id', event.target.value)}
            className={`mt-1 block w-full rounded border ${errors.ponto_id ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          >
            <option value="">Selecione um ponto</option>
            {pontos.map((ponto) => (
              <option key={ponto.id} value={ponto.id}>
                {ponto.identificacao} ({ponto.status})
              </option>
            ))}
          </select>
          {errors.ponto_id && <p className="mt-1 text-sm text-red-600">{errors.ponto_id}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cliente</label>
          <select
            value={form.cliente_id}
            onChange={(event) => updateField('cliente_id', event.target.value)}
            className={`mt-1 block w-full rounded border ${errors.cliente_id ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.razao_nome} ({cliente.cpf_cnpj})
              </option>
            ))}
          </select>
          {errors.cliente_id && <p className="mt-1 text-sm text-red-600">{errors.cliente_id}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Data de início</label>
          <input
            type="date"
            value={form.data_inicio}
            onChange={(event) => updateField('data_inicio', event.target.value)}
            className={`mt-1 block w-full rounded border ${errors.data_inicio ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          />
          {errors.data_inicio && <p className="mt-1 text-sm text-red-600">{errors.data_inicio}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Data de término</label>
          <input
            type="date"
            value={form.data_termino}
            onChange={(event) => updateField('data_termino', event.target.value)}
            className={`mt-1 block w-full rounded border ${errors.data_termino ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          />
          {errors.data_termino && <p className="mt-1 text-sm text-red-600">{errors.data_termino}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Valor mensal (R$)</label>
          <input
            value={form.valor_mensal}
            onChange={(event) => updateField('valor_mensal', sanitizeNumber(event.target.value))}
            className={`mt-1 block w-full rounded border ${errors.valor_mensal ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            placeholder="1200.00"
          />
          {errors.valor_mensal && <p className="mt-1 text-sm text-red-600">{errors.valor_mensal}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-gray-600">Ao salvar, o ponto muda para status LOCADO automaticamente.</span>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Salvando...' : 'Salvar Contrato'}
        </button>
      </div>

      {message && <p className="text-sm text-gray-700">{message}</p>}
    </form>
  )
}
