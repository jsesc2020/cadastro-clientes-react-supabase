import React from 'react'
import CustomerForm from './components/CustomerForm'

export default function App(){
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Cadastro de Clientes</h1>
        <CustomerForm />
      </div>
    </div>
  )
}
