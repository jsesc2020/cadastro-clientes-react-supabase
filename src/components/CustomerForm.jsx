import React, { useState } from 'react'
import InputMask from 'react-input-mask'
import { supabase } from '../supabaseClient'

function onlyDigits(s){ return (s||'').replace(/\D/g,'') }

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

  async function handleBuscar(){
    const digits = onlyDigits(doc)
    if(type==='cnpj'){
      if(digits.length !== 14){ alert('CNPJ incompleto'); return }
      setLoadingSearch(true)
      try{
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
        if(!res.ok) throw new Error('CNPJ não encontrado')
        const data = await res.json()
        setForm(f=>({
          ...f,
          razao_nome: data.razao_social || data.nome || '',
          fantasia_apelido: data.nome_fantasia || '',
          cep: (data.cep||'').replace(/\D/g,''),
          logradouro: data.logradouro || data.tipo_logradouro || '',
          bairro: data.bairro || '',
          cidade: data.municipio || data.municipio || data.cidade || '',
          uf: data.uf || data.estado || ''
        }))
      }catch(e){
        alert(e.message || 'Erro ao consultar CNPJ')
      }finally{ setLoadingSearch(false) }
    } else {
      if(!validateCPF(doc)) { alert('CPF inválido'); return }
      alert('CPF validado — preencha nome e endereço manualmente ou use o CEP para auto-completar.')
    }
  }

  async function handleCepBlur(){
    const cep = onlyDigits(form.cep)
    if(cep.length !== 8) return
    try{
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if(data.erro){ alert('CEP não encontrado'); return }
      setForm(f=>({
        ...f,
        logradouro: data.logradouro || f.logradouro,
        bairro: data.bairro || f.bairro,
        cidade: data.localidade || f.cidade,
        uf: data.uf || f.uf
      }))
    }catch(e){ console.error(e) }
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
    if(type==='cpf' && !validateCPF(doc)){ alert('CPF inválido'); return }
    setSaving(true)
    try{
      const { data: existing, error: selErr } = await supabase
        .from('clientes')
        .select('id')
        .eq('cpf_cnpj', cpfcnpj)
        .limit(1)
      if(selErr) throw selErr
      if(existing && existing.length>0){ alert('Este cliente já está cadastrado'); return }
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
      alert('Cadastro salvo com sucesso')
      setDoc('')
      setForm({ razao_nome:'', fantasia_apelido:'', inscricao_estadual:'', email:'', telefone:'', cep:'', logradouro:'', numero:'', complemento:'', bairro:'', cidade:'', uf:'' })
    }catch(e){
      alert('Erro ao salvar: '+(e.message||JSON.stringify(e)))
    }finally{ setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2"><input type="radio" checked={type==='cpf'} onChange={()=>setType('cpf')} /> Pessoa Física (CPF)</label>
        <label className="flex items-center gap-2"><input type="radio" checked={type==='cnpj'} onChange={()=>setType('cnpj')} /> Pessoa Jurídica (CNPJ)</label>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          {type==='cnpj' ? (
            <InputMask mask="99.999.999/9999-99" value={doc} onChange={e=>setDoc(e.target.value)}>
              {(inputProps)=>(<input {...inputProps} className="w-full border px-3 py-2 rounded" placeholder="CNPJ" />)}
            </InputMask>
          ) : (
            <InputMask mask="999.999.999-99" value={doc} onChange={e=>setDoc(e.target.value)}>
              {(inputProps)=>(<input {...inputProps} className="w-full border px-3 py-2 rounded" placeholder="CPF" />)}
            </InputMask>
          )}
        </div>
        <button onClick={handleBuscar} disabled={loadingSearch || (type==='cnpj' && onlyDigits(doc).length!==14) || (type==='cpf' && onlyDigits(doc).length!==11)} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{loadingSearch? 'Buscando...':'Buscar Dados'}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Razão Social / Nome Completo *</label>
          <input value={form.razao_nome} onChange={e=>setField('razao_nome', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">Nome Fantasia / Apelido</label>
          <input value={form.fantasia_apelido} onChange={e=>setField('fantasia_apelido', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        {type==='cnpj' && (
          <div>
            <label className="block text-sm">Inscrição Estadual</label>
            <input value={form.inscricao_estadual} onChange={e=>setField('inscricao_estadual', e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
        )}
        <div>
          <label className="block text-sm">E-mail principal *</label>
          <input value={form.email} onChange={e=>setField('email', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">Telefone / WhatsApp *</label>
          <input value={form.telefone} onChange={e=>setField('telefone', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>

        <div>
          <label className="block text-sm">CEP *</label>
          <InputMask mask="99999-999" value={form.cep} onChange={e=>setField('cep', e.target.value)} onBlur={handleCepBlur}>
            {inputProps=> <input {...inputProps} className="w-full border px-3 py-2 rounded" />}
          </InputMask>
        </div>
        <div>
          <label className="block text-sm">Logradouro *</label>
          <input value={form.logradouro} onChange={e=>setField('logradouro', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">Número *</label>
          <input value={form.numero} onChange={e=>setField('numero', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">Complemento</label>
          <input value={form.complemento} onChange={e=>setField('complemento', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">Bairro</label>
          <input value={form.bairro} onChange={e=>setField('bairro', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">Cidade *</label>
          <input value={form.cidade} onChange={e=>setField('cidade', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">Estado (UF) *</label>
          <input value={form.uf} onChange={e=>setField('uf', e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={handleSave} disabled={!requiredFilled() || saving} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">{saving? 'Salvando...':'Salvar Cadastro'}</button>
      </div>
    </div>
  )
}
