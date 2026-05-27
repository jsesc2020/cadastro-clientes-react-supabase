import React, { useState } from 'react'
import CustomerForm from './components/CustomerForm'
import ClientList from './components/ClientList'
import ProprietarioForm from './components/ProprietarioForm'
import PontoInventarioForm from './components/PontoInventarioForm'
import InventoryMap from './components/InventoryMap'
import ContratoForm from './components/ContratoForm'
import ContractList from './components/ContractList'

export default function App() {
  const [activeTab, setActiveTab] = useState('proprietarios')

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Módulo de Inventário: Outdoors e TVs</h1>

        <div className="flex flex-wrap gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('proprietarios')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'proprietarios'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Proprietários
          </button>
          <button
            onClick={() => setActiveTab('pontos')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'pontos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Pontos de Mídia
          </button>
          <button
            onClick={() => setActiveTab('mapa')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'mapa'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Mapa Interativo
          </button>
          <button
            onClick={() => setActiveTab('contratos')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'contratos'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Contratos
          </button>
          <button
            onClick={() => setActiveTab('clientes')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'clientes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Clientes (legado)
          </button>
        </div>

        <div className="bg-white p-6 rounded shadow">
          {activeTab === 'proprietarios' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Cadastro de Proprietário</h2>
              <ProprietarioForm onSuccess={() => setActiveTab('pontos')} />
            </div>
          )}
          {activeTab === 'pontos' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Cadastro de Ponto de Mídia</h2>
              <PontoInventarioForm onSuccess={() => setActiveTab('mapa')} />
            </div>
          )}
          {activeTab === 'mapa' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Dashboard do Mapa Interativo</h2>
              <InventoryMap />
            </div>
          )}
          {activeTab === 'contratos' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Contratos</h2>
              <ContratoForm onSuccess={() => setActiveTab('mapa')} />
              <div className="mt-8">
                <ContractList />
              </div>
            </div>
          )}
          {activeTab === 'clientes' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Clientes Cadastrados</h2>
              <CustomerForm onSuccess={() => setActiveTab('clientes')} />
              <div className="mt-8">
                <ClientList />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
