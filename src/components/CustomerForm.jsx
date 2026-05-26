import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

function onlyDigits(s){ return (s||'').replace(/\D/g,'') }

function maskCPF(value){
  const digits = onlyDigits(value)
  if(digits.length<=3) return digits
  if(digits.length<=6) return `${digits.slice(0,3)}.${digits.slice(3)}`
  if(digits.length<=9) return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`
  return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9,11)}`
}

function maskCNPJ(value){
  const digits = onlyDigits(value)
  if(digits.length<=2) return digits
  if(digits.length<=5) return `${digits.slice(0,2)}.${digits.slice(2)}`
  if(digits.length<=8) return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5)}`
  if(digits.length<=12) return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8)}`
  return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12,14)}`
}

function maskCEP(value){
  const digits = onlyDigits(value)
  if(digits.length<=5) return digits
  return `${digits.slice(0,5)}-${digits.slice(5,8)}`
}

function validateCPF(cpf){
  const s = onlyDigits(cpf)
  if(!/^[0-9]{11}$/.test(s)) return false
  let sum = 0, rem
  for(let i=1;i<=9;i++) sum += parseInt(s.substring(i-1,i)) * (11 - i)
  rem = (sum * 10) % 11
  if(rem === 10) rem = 0
  if(rem !== parseInt(s.substring(9,10))) return false
  sum = 0
  for(let i=1;i<=10;i++) sum += parseInt(s.substring(i-1,i)) * (12 - i)
  rem = (sum * 10) % 11
  if(rem === 10) rem = 0
  if(rem !== parseInt(s.substring(10,11))) return false
  return true
}

export default function CustomerForm(){
  const [type, setType] = useState('cpf')
  const [doc, setDoc] = useState('')
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
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
  })

  function setField(k,v){ setForm(f=>({...f,[k]:v})) }

  function handleDocChange(e){
    const value = e.target.value
    if(type==='cnpj') setDoc(maskCNPJ(value))
    else setDoc(maskCPF(value))
  }

  function handleCepChange(e){
    const value = e.target.value
    setField('cep', maskCEP(value))
  }

  async function handleBuscar(){
    const digits = onlyDigits(doc)
    setMessage('')
    if(type==='cnpj'){
      if(digits.length !== 14){ setMessage('CNPJ incompleto'); return }
      setLoadingSearch(true)
      try{
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
        if(!res.ok) throw new Error('CNPJ não encontrado')
        const data = await res.json()
        setForm(f=>({
          ...f,
          razao_nome: data.razao_social || data.nome || '',
          fantasia_apelido: data.nome_fantasia || '',
          cep: maskCEP((data.cep||'').replace(/\D/g,'')),
          logradouro: data.logradouro || data.tipo_logradouro || '',
          bairro: data.bairro || '',
          cidade: data.municipio || data.municipio || data.cidade || '',
          uf: data.uf || data.estado || ''
        }))
        setMessage('✓ Dados carregados com sucesso')
      }catch(e){
        setMessage(e.message || 'Erro ao consultar CNPJ')
      }finally{ setLoadingSearch(false) }
    } else {
      if(!validateCPF(doc)) { setMessage('CPF inválido'); return }
      setMessage('✓ CPF validado — preencha nome e endereço manualmente ou use o CEP.')
    }
  }

  async function handleCepBlur(){
    const cep = onlyDigits(form.cep)
    if(cep.length !== 8) return
    try{
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if(data.erro){ setMessage('CEP não encontrado'); return }
      setForm(f=>({
        ...f,
        logradouro: data.logradouro || f.logradouro,
        bairro: data.bairro || f.bairro,
        cidade: data.localidade || f.cidade,
        uf: data.uf || f.uf
      }))
      setMessage('✓ Endereço carregado')
    }catch(e){ console.error(e); setMessage('Erro ao consultar CEP') }
  }

  function requiredFilled(){
    const r = form.razao_nome.trim() || ''
    const emailOk = form.email.trim().length>3 && form.email.includes('@')
    const telefoneOk = form.telefone.trim().length>6
    const enderecoOk = form.cep.trim() && form.logradouro.trim() && form.numero.trim() && form.cidade.trim() && form.uf.trim()
    const docDigits = onlyDigits(doc)
    if(type==='cnpj') return docDigits.length===14 && r && emailOk && telefoneOk && enderecoOk
    return docDigits.length===11 && r && emailOk && telefoneOk && enderecoOk
  }

  async function handleSave(){
    const cpfcnpj = onlyDigits(doc)
    if(type==='cpf' && !validateCPF(doc)){ setMessage('CPF inválido'); return }
    setSaving(true)
    setMessage('')
    try{
      const { data: existing, error: selErr } = await supabase
        .from('clientes')
        .select('id')
        .eq('cpf_cnpj', cpfcnpj)
        .limit(1)
      if(selErr) throw selErr
      if(existing && existing.length>0){ setMessage('Este cliente já está cadastrado'); return }
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
      if(insErr) throw insErr
      setMessage('✓ Cadastro salvo com sucesso')
      setTimeout(()=>{
        setDoc('')
        setForm({ razao_nome:'', fantasia_apelido:'', inscricao_estadual:'', email:'', telefone:'', cep:'', logradouro:'', numero:'', complemento:'', bairro:'', cidade:'', uf:'' })
      }, 1500)
    }catch(e){
      setMessage('Erro ao salvar: '+(e.message||JSON.stringify(e)))
    }finally{ setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-2"><input type="radio" checked={type==='cpf'} onChange={()=>setType('cpf')} /> Pessoa Física (CPF)</label>
        <label className="flex items-center gap-2"><input type="radio" checked={type==='cnpj'} onChange={()=>setType('cnpj')} /> Pessoa Jurídica (CNPJ)</label>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.startsWith('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <div className="flex-1">
          <input 
            type="text"
            value={doc}
            onChange={handleDocChange}
            className="w-full border px-3 py-2 rounded"
            placeholder={type==='cnpj' ? 'CNPJ' : 'CPF'}
          />
        </div>
        <button onClick={handleBuscar} disabled={loadingSearch || (type==='cnpj' && onlyDigits(doc).length!==14) || (type==='cpf' && onlyDigits(doc).length!==11)} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-700">{loadingSearch? 'Buscando...':'Buscar Dados'}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Razão Social / Nome Completo *</label>
          <input value={form.razao_nome} onChange={e=>setField('razao_nome', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nome Fantasia / Apelido</label>
          <input value={form.fantasia_apelido} onChange={e=>setField('fantasia_apelido', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        {type==='cnpj' && (
          <div>
            <label className="block text-sm font-medium mb-1">Inscrição Estadual</label>
            <input value={form.inscricao_estadual} onChange={e=>setField('inscricao_estadual', e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">E-mail principal *</label>
          <input value={form.email} onChange={e=>setField('email', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Telefone / WhatsApp *</label>
          <input value={form.telefone} onChange={e=>setField('telefone', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CEP *</label>
          <input 
            value={form.cep}
            onChange={handleCepChange}
            onBlur={handleCepBlur}
            className="w-full border px-3 py-2 rounded"
            placeholder="00000-000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Logradouro *</label>
          <input value={form.logradouro} onChange={e=>setField('logradouro', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Número *</label>
          <input value={form.numero} onChange={e=>setField('numero', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Complemento</label>
          <input value={form.complemento} onChange={e=>setField('complemento', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bairro</label>
          <input value={form.bairro} onChange={e=>setField('bairro', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cidade *</label>
          <input value={form.cidade} onChange={e=>setField('cidade', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estado (UF) *</label>
          <input value={form.uf} onChange={e=>setField('uf', e.target.value)} className="w-full border px-3 py-2 rounded" maxLength="2" />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={!requiredFilled() || saving} className="bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50 hover:bg-green-700">{saving? 'Salvando...':'Salvar Cadastro'}</button>
      </div>
    </div>
  )
}
