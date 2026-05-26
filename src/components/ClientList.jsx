import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function ClientList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, cpf, cnpj
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  useEffect(() => {
    fetchClients()
  }, [searchTerm, filterType, currentPage])

  async function fetchClients() {
    setLoading(true)
    try {
      let query = supabase.from('clientes').select('*', { count: 'exact' })

      // Apply filter by type
      if (filterType !== 'all') {
        query = query.eq('tipo', filterType)
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(
          `cpf_cnpj.ilike.%${searchTerm}%,razao_nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        )
      }

      // Apply pagination
      const from = (currentPage - 1) * pageSize
      const to = from + pageSize - 1

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      setClients(data || [])
      setTotalCount(count || 0)
    } catch (e) {
      console.error('Erro ao carregar clientes:', e)
    } finally {
      setLoading(false)
    }
  }

  function formatCPFCNPJ(value, type) {
    if (!value) return ''
    const digits = value.replace(/\D/g, '')
    if (type === 'cpf') return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Clientes Cadastrados</h2>

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou CNPJ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value)
            setCurrentPage(1)
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="all">Todos</option>
          <option value="cpf">Pessoa Física</option>
          <option value="cnpj">Pessoa Jurídica</option>
        </select>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="text-center py-6">Carregando...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-6 text-gray-500">Nenhum cliente encontrado</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">CPF/CNPJ</th>
                <th className="px-4 py-2 text-left">Razão Social / Nome</th>
                <th className="px-4 py-2 text-left">E-mail</th>
                <th className="px-4 py-2 text-left">Telefone</th>
                <th className="px-4 py-2 text-left">Cidade</th>
                <th className="px-4 py-2 text-left">Cadastrado em</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      client.tipo === 'cpf' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {client.tipo === 'cpf' ? 'PF' : 'PJ'}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">
                    {formatCPFCNPJ(client.cpf_cnpj, client.tipo)}
                  </td>
                  <td className="px-4 py-2">{client.razao_nome}</td>
                  <td className="px-4 py-2 text-xs">{client.email}</td>
                  <td className="px-4 py-2 text-xs">{client.telefone}</td>
                  <td className="px-4 py-2 text-xs">{client.cidade}</td>
                  <td className="px-4 py-2 text-xs">{formatDate(client.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages} ({totalCount} clientes)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              ← Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-2 rounded ${
                    p === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              Próximo →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
