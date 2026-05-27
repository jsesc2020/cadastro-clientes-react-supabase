import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ContractList() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchContracts()
  }, [])

  async function fetchContracts() {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('id, ponto_id, cliente_id, data_inicio, data_termino, valor_mensal, status, created_at, ponto: ponto_id(identificacao, status), cliente: cliente_id(razao_nome, cpf_cnpj)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setContracts(data || [])
    } catch (err) {
      console.error('Erro ao carregar contratos:', err)
      setError('Não foi possível carregar contratos.')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(value) {
    if (!value) return '-'
    return new Date(value).toLocaleDateString('pt-BR')
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Contratos</h2>
        <button
          type="button"
          onClick={fetchContracts}
          className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
        >
          Atualizar
        </button>
      </div>

      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="text-center py-6 text-gray-600">Carregando contratos...</div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-6 text-gray-500">Nenhum contrato registrado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Contrato</th>
                <th className="px-4 py-3 text-left">Ponto</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Período</th>
                <th className="px-4 py-3 text-left">Valor mensal</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{contract.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">{contract.ponto?.identificacao || contract.ponto_id}</td>
                  <td className="px-4 py-3">{contract.cliente?.razao_nome || contract.cliente_id}</td>
                  <td className="px-4 py-3">{formatDate(contract.data_inicio)} → {formatDate(contract.data_termino)}</td>
                  <td className="px-4 py-3">R$ {contract.valor_mensal?.toFixed(2)}</td>
                  <td className="px-4 py-3">{contract.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
