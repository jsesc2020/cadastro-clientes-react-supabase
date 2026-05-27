import React, { useEffect, useState } from 'react'
import CustomerForm from './components/CustomerForm'
import ClientList from './components/ClientList'
import ProprietarioForm from './components/ProprietarioForm'
import PontoInventarioForm from './components/PontoInventarioForm'
import InventoryMap from './components/InventoryMap'
import ContratoForm from './components/ContratoForm'
import ContractList from './components/ContractList'
import ModuleDashboard from './components/ModuleDashboard'

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'proprietarios', label: 'Proprietários' },
  { id: 'pontos', label: 'Pontos de Mídia' },
  { id: 'mapa', label: 'Mapa Interativo' },
  { id: 'contratos', label: 'Contratos' },
  { id: 'clientes', label: 'Clientes' }
]

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return window.localStorage.getItem('activeTab') || 'dashboard'
  })

  useEffect(() => {
    window.localStorage.setItem('activeTab', activeTab)
  }, [activeTab])

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Módulo de Inventário</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Outdoors, TVs e Contratos</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Navegue pelas principais telas do sistema com rapidez e tenha acesso direto aos cadastros, mapa e contratos.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 sm:mt-0 sm:justify-end">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Ir para Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pontos')}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Novo ponto
            </button>
          </div>
        </header>

        <div className="mb-4 sm:hidden">
          <label className="block text-sm font-medium text-slate-700">Navegação</label>
          <select
            value={activeTab}
            onChange={(event) => setActiveTab(event.target.value)}
            className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {navItems.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Seções</p>
                <div className="mt-4 space-y-2">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                        activeTab === item.id
                          ? 'bg-slate-900 text-white shadow'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Ações rápidas</p>
                <div className="mt-3 space-y-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('proprietarios')}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cadastrar proprietário
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pontos')}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cadastrar ponto
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('contratos')}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Criar contrato
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            {activeTab === 'dashboard' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <ModuleDashboard onNavigate={setActiveTab} />
              </div>
            )}

            {activeTab === 'proprietarios' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Cadastro de Proprietário</h2>
                    <p className="mt-1 text-sm text-slate-600">Registre o dono do terreno com dados bancários e CPF/CNPJ.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Voltar ao dashboard
                  </button>
                </div>
                <ProprietarioForm onSuccess={() => setActiveTab('pontos')} />
              </div>
            )}

            {activeTab === 'pontos' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Cadastro de Ponto de Mídia</h2>
                    <p className="mt-1 text-sm text-slate-600">Adicione outdoors e TVs com localização geográfica precisa.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('mapa')}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Ver mapa
                  </button>
                </div>
                <PontoInventarioForm onSuccess={() => setActiveTab('mapa')} />
              </div>
            )}

            {activeTab === 'mapa' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Mapa Interativo</h2>
                    <p className="mt-1 text-sm text-slate-600">Visualize os pontos do inventário com filtros e edição rápida.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('contratos')}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Criar contrato
                  </button>
                </div>
                <InventoryMap />
              </div>
            )}

            {activeTab === 'contratos' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Contratos</h2>
                    <p className="mt-1 text-sm text-slate-600">Vincule clientes aos pontos de mídia e mantenha o status sincronizado.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Voltar ao dashboard
                  </button>
                </div>
                <ContratoForm onSuccess={() => setActiveTab('mapa')} />
                <div className="mt-8">
                  <ContractList />
                </div>
              </div>
            )}

            {activeTab === 'clientes' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">Clientes Cadastrados</h2>
                    <p className="mt-1 text-sm text-slate-600">Gestão de clientes legados para integração e contratos.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Voltar ao dashboard
                  </button>
                </div>
                <CustomerForm onSuccess={() => setActiveTab('clientes')} />
                <div className="mt-8">
                  <ClientList />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
