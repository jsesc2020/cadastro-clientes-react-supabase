import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const cards = [
  { id: 'proprietarios', title: 'Proprietários', description: 'Cadastre e gerencie os donos do terreno.' },
  { id: 'pontos', title: 'Pontos de Mídia', description: 'Adicione outdoors e TVs ao inventário.' },
  { id: 'mapa', title: 'Mapa Interativo', description: 'Veja todos os pontos no mapa em tempo real.' },
  { id: 'contratos', title: 'Contratos', description: 'Vincule clientes aos pontos de mídia.' }
]

export default function ModuleDashboard({ onNavigate }) {
  const [counts, setCounts] = useState({ proprietarios: 0, pontos: 0, contratos: 0, clientes: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCounts()
  }, [])

  async function fetchCounts() {
    setLoading(true)
    setError('')
    try {
      const [proprietariosResult, pontosResult, contratosResult, clientesResult] = await Promise.all([
        supabase.from('proprietarios').select('id', { count: 'exact' }).range(0, 0),
        supabase.from('pontos_inventario').select('id', { count: 'exact' }).range(0, 0),
        supabase.from('contratos').select('id', { count: 'exact' }).range(0, 0),
        supabase.from('clientes').select('id', { count: 'exact' }).range(0, 0)
      ])

      if (proprietariosResult.error) throw proprietariosResult.error
      if (pontosResult.error) throw pontosResult.error
      if (contratosResult.error) throw contratosResult.error
      if (clientesResult.error) throw clientesResult.error

      setCounts({
        proprietarios: proprietariosResult.count || 0,
        pontos: pontosResult.count || 0,
        contratos: contratosResult.count || 0,
        clientes: clientesResult.count || 0
      })
    } catch (err) {
      console.error('Erro ao buscar resumo do dashboard:', err)
      setError('Não foi possível carregar o resumo do dashboard.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Visão geral do módulo</h2>
        <p className="mt-2 text-sm text-slate-600">
          Use este painel para acessar rapidamente os recursos principais do sistema e acompanhar a situação do inventário.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Proprietários cadastrados</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{counts.proprietarios}</p>
        </div>
        <div className="rounded border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pontos de mídia</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{counts.pontos}</p>
        </div>
        <div className="rounded border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Contratos ativos</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{counts.contratos}</p>
        </div>
        <div className="rounded border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Clientes registrados</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{counts.clientes}</p>
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Ações rápidas</h3>
            <p className="mt-1 text-sm text-slate-600">Acesse as telas de cadastro com um clique.</p>
          </div>
          <button
            type="button"
            onClick={fetchCounts}
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Atualizar resumo
          </button>
        </div>

        {error && <div className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="mt-4 text-sm text-slate-600">Carregando informações do dashboard...</div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {cards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => onNavigate(card.id)}
                className="text-left rounded border border-gray-200 bg-slate-50 p-4 transition hover:border-blue-400 hover:bg-white"
              >
                <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                <p className="mt-2 text-sm text-slate-600">{card.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
