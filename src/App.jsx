import React, { useState } from 'react'
import CustomerForm from './components/CustomerForm'
import ClientList from './components/ClientList'

export default function App(){
  const [activeTab, setActiveTab] = useState('form')

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Gestão de Clientes</h1>
        
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'form'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Novo Cadastro
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Listar Clientes
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white p-6 rounded shadow">
          {activeTab === 'form' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Cadastro de Clientes</h2>
              <CustomerForm onSuccess={() => setActiveTab('list')} />
            </div>
          )}
          {activeTab === 'list' && <ClientList />}
        </div>
      </div>
    </div>
  )
}
