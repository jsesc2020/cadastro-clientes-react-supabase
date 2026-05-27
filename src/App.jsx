import React, { useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import CustomerForm from './components/CustomerForm'
import ClientList from './components/ClientList'
import ProprietarioForm from './components/ProprietarioForm'
import PontoInventarioForm from './components/PontoInventarioForm'
import InventoryMap from './components/InventoryMap'
import ContratoForm from './components/ContratoForm'
import ContractList from './components/ContractList'
import ModuleDashboard from './components/ModuleDashboard'

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/proprietarios', label: 'Proprietários' },
  { path: '/pontos', label: 'Pontos de Mídia' },
  { path: '/mapa', label: 'Mapa Interativo' },
  { path: '/contratos', label: 'Contratos' },
  { path: '/clientes', label: 'Clientes' }
]

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Módulo de Inventário</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Outdoors, TVs e Contratos</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Navegue pelo sistema com URLs diretas e mantenha o histórico do navegador.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 sm:mt-0 sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Ir para Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate('/pontos')}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Novo ponto
            </button>
          </div>
        </header>

        <div className="mb-4 sm:hidden">
          <label className="block text-sm font-medium text-slate-700">Navegação</label>
          <select
            onChange={(event) => navigate(event.target.value)}
            className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={location.pathname}
          >
            {navItems.map((item) => (
              <option key={item.path} value={item.path}>{item.label}</option>
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
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                          isActive
                            ? 'bg-slate-900 text-white shadow'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Ações rápidas</p>
                <div className="mt-3 space-y-3">
                  <button
                    type="button"
                    onClick={() => navigate('/proprietarios')}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cadastrar proprietário
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/pontos')}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cadastrar ponto
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/contratos')}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Criar contrato
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/proprietarios" element={<ProprietariosPage />} />
              <Route path="/pontos" element={<PontosPage />} />
              <Route path="/mapa" element={<MapaPage />} />
              <Route path="/contratos" element={<ContratosPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

function DashboardPage() {
  const navigate = useNavigate()
  const pathMap = {
    dashboard: '/',
    proprietarios: '/proprietarios',
    pontos: '/pontos',
    mapa: '/mapa',
    contratos: '/contratos',
    clientes: '/clientes'
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <ModuleDashboard onNavigate={(tab) => navigate(pathMap[tab] || '/')} />
    </div>
  )
}

function ProprietariosPage() {
  const navigate = useNavigate()
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Cadastro de Proprietário</h2>
          <p className="mt-1 text-sm text-slate-600">Registre o dono do terreno com dados bancários e CPF/CNPJ.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Voltar ao dashboard
        </button>
      </div>
      <ProprietarioForm onSuccess={() => navigate('/pontos')} />
    </div>
  )
}

function PontosPage() {
  const navigate = useNavigate()
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Cadastro de Ponto de Mídia</h2>
          <p className="mt-1 text-sm text-slate-600">Adicione outdoors e TVs com localização geográfica precisa.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/mapa')}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Ver mapa
        </button>
      </div>
      <PontoInventarioForm onSuccess={() => navigate('/mapa')} />
    </div>
  )
}

function MapaPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Mapa Interativo</h2>
          <p className="mt-1 text-sm text-slate-600">Visualize os pontos do inventário com filtros e edição rápida.</p>
        </div>
        <Link
          to="/contratos"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Criar contrato
        </Link>
      </div>
      <InventoryMap />
    </div>
  )
}

function ContratosPage() {
  const navigate = useNavigate()
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Contratos</h2>
          <p className="mt-1 text-sm text-slate-600">Vincule clientes aos pontos de mídia e mantenha o status sincronizado.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Voltar ao dashboard
        </button>
      </div>
      <ContratoForm onSuccess={() => navigate('/mapa')} />
      <div className="mt-8">
        <ContractList />
      </div>
    </div>
  )
}

function ClientesPage() {
  const [refreshClients, setRefreshClients] = useState(0)

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Clientes Cadastrados</h2>
          <p className="mt-1 text-sm text-slate-600">Gestão de clientes legados para integração e contratos.</p>
        </div>
        <Link
          to="/"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Voltar ao dashboard
        </Link>
      </div>
      <CustomerForm onSuccess={() => setRefreshClients((current) => current + 1)} />
      <div className="mt-8">
        <ClientList refreshKey={refreshClients} />
      </div>
    </div>
  )
}
