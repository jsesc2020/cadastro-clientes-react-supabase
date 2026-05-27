import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { isContractActive, normalizePointStatuses, getActiveContractCounts } from '../lib/contractUtils'

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Ambiente não suporta Google Maps'))
      return
    }
    if (window.google?.maps) {
      resolve(window.google)
      return
    }

    const existingScript = document.querySelector('script[data-google-maps]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google))
      existingScript.addEventListener('error', () => reject(new Error('Falha ao carregar Google Maps')))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`
    script.async = true
    script.defer = true
    script.dataset.googleMaps = 'true'
    script.onload = () => resolve(window.google)
    script.onerror = () => reject(new Error('Falha ao carregar Google Maps'))
    document.head.appendChild(script)
  })
}

function getPinColor(status) {
  switch (status) {
    case 'DISPONIVEL':
      return '#28a745'
    case 'LOCADO':
      return '#dc3545'
    case 'MANUTENCAO':
      return '#ffc107'
    default:
      return '#6c757d'
  }
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('pt-BR')
}

export default function InventoryMap() {
  const [pontos, setPontos] = useState([])
  const [contracts, setContracts] = useState([])
  const [proprietarios, setProprietarios] = useState({})
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)
  const [filters, setFilters] = useState({ tipo: 'all', status: 'all' })
  const [error, setError] = useState('')
  const [statusSyncMessage, setStatusSyncMessage] = useState('')
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!apiKey) {
      setError('Defina VITE_GOOGLE_MAPS_API_KEY para exibir o mapa interativo.')
      setLoading(false)
      return
    }

    loadGoogleMaps(apiKey)
      .then(() => {
        setMapReady(true)
      })
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar Google Maps.')
      })
  }, [apiKey])

  useEffect(() => {
    if (mapReady && pontos.length > 0) {
      renderMap()
    }
  }, [mapReady, pontos, filters])

  async function fetchData() {
    setLoading(true)
    setStatusSyncMessage('')
    try {
      const { data: proprietariosData, error: ownerError } = await supabase
        .from('proprietarios')
        .select('id, nome_completo')

      if (ownerError) throw ownerError
      const ownerMap = (proprietariosData || []).reduce((acc, owner) => {
        acc[owner.id] = owner.nome_completo
        return acc
      }, {})
      setProprietarios(ownerMap)
      setOwners(proprietariosData || [])

      const [{ data: pontosData, error: pontosError }, { data: contractsData, error: contractsError }] = await Promise.all([
        supabase.from('pontos_inventario').select('*').order('created_at', { ascending: false }),
        supabase.from('contratos').select('*, cliente:cliente_id(razao_nome, cpf_cnpj)').order('created_at', { ascending: false })
      ])

      if (pontosError) throw pontosError
      if (contractsError) throw contractsError

      setContracts(contractsData || [])
      const normalizedPoints = normalizePointStatuses(pontosData || [], contractsData || [])
      setPontos(normalizedPoints)
      await syncPointStatuses(pontosData || [], contractsData || [])
      setStatusSyncMessage('Sincronização de status concluída.')
    } catch (err) {
      console.error(err)
      setError('Erro ao carregar dados do inventário.')
    } finally {
      setLoading(false)
    }
  }

  async function syncPointStatuses(pointList, contractList) {
    const activeContractCounts = getActiveContractCounts(contractList || [])
    const updates = (pointList || []).reduce((acc, point) => {
      if (!point || point.status === 'MANUTENCAO') return acc
      const activeCount = activeContractCounts[point.id] || 0
      const targetStatus = activeCount > 0 ? 'LOCADO' : point.status === 'LOCADO' ? 'DISPONIVEL' : point.status
      if (targetStatus !== point.status) {
        acc.push({ id: point.id, status: targetStatus })
      }
      return acc
    }, [])

    for (const update of updates) {
      await supabase.from('pontos_inventario').update({ status: update.status }).eq('id', update.id)
    }
  }

  function normalizePointStatuses(pointList, contractList) {
    const activeContractsByPoint = contractList.reduce((acc, contract) => {
      if (isContractActive(contract)) acc[contract.ponto_id] = contract
      return acc
    }, {})

    return pointList.map((point) => {
      const activeContract = activeContractsByPoint[point.id]
      if (activeContract && point.status !== 'LOCADO') {
        updatePointStatus(point.id, 'LOCADO')
        return { ...point, status: 'LOCADO' }
      }
      if (!activeContract && point.status === 'LOCADO') {
        updatePointStatus(point.id, 'DISPONIVEL')
        return { ...point, status: 'DISPONIVEL' }
      }
      return point
    })
  }

  async function updatePointStatus(pointId, status) {
    try {
      await supabase.from('pontos_inventario').update({ status }).eq('id', pointId)
    } catch (err) {
      console.error('Erro ao sincronizar status do ponto:', err)
    }
  }

  function getCurrentContract(pointId) {
    return contracts.find((contract) => contract.ponto_id === pointId && isContractActive(contract))
  }

  function createEditForm(point) {
    return {
      id: point.id,
      tipo: point.tipo,
      identificacao: point.identificacao || '',
      proprietario_id: point.proprietario_id || '',
      endereco_completo: point.endereco_completo || '',
      latitude: point.latitude?.toString() ?? '',
      longitude: point.longitude?.toString() ?? '',
      status: point.status,
      valor_custo_proprietario: point.valor_custo_proprietario?.toFixed(2) ?? ''
    }
  }

  useEffect(() => {
    if (selectedPoint) {
      setEditForm(createEditForm(selectedPoint))
    } else {
      setEditMode(false)
      setEditForm(null)
    }
  }, [selectedPoint])

  function updateEditField(key, value) {
    setEditForm((current) => ({ ...current, [key]: value }))
  }

  function validateEditForm() {
    const fieldErrors = {}
    if (!editForm?.identificacao?.trim()) fieldErrors.identificacao = 'Identificação é obrigatória'
    if (!editForm?.proprietario_id) fieldErrors.proprietario_id = 'Escolha um proprietário'
    if (!editForm?.endereco_completo?.trim()) fieldErrors.endereco_completo = 'Endereço é obrigatório'
    if (!editForm?.latitude?.trim() || !editForm?.longitude?.trim()) fieldErrors.latitude = 'Latitude e longitude são obrigatórias'
    if (!editForm?.valor_custo_proprietario?.trim() || Number.isNaN(Number(editForm.valor_custo_proprietario))) {
      fieldErrors.valor_custo_proprietario = 'Valor de custo inválido'
    }
    return {
      valid: Object.keys(fieldErrors).length === 0,
      fieldErrors
    }
  }

  async function handleSaveEdit() {
    if (!editForm) return
    const { valid, fieldErrors } = validateEditForm()
    if (!valid) {
      setError(Object.values(fieldErrors).join(' - '))
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = {
        tipo: editForm.tipo,
        identificacao: editForm.identificacao.trim(),
        proprietario_id: editForm.proprietario_id,
        endereco_completo: editForm.endereco_completo.trim(),
        latitude: Number(editForm.latitude),
        longitude: Number(editForm.longitude),
        status: editForm.status,
        valor_custo_proprietario: parseFloat(editForm.valor_custo_proprietario)
      }

      const { error } = await supabase.from('pontos_inventario').update(payload).eq('id', editForm.id)
      if (error) throw error

      setStatusSyncMessage('Ponto atualizado com sucesso.')
      setSelectedPoint((current) => ({ ...current, ...payload }))
      setEditMode(false)
      await fetchData()
    } catch (err) {
      console.error('Erro ao salvar edição do ponto:', err)
      setError(err.message || 'Erro ao salvar edição do ponto.')
    } finally {
      setLoading(false)
    }
  }

  function handleCancelEdit() {
    if (selectedPoint) {
      setEditForm(createEditForm(selectedPoint))
    }
    setEditMode(false)
  }

  function filterPoints() {
    return pontos.filter((point) => {
      const matchesTipo = filters.tipo === 'all' || point.tipo === filters.tipo
      const matchesStatus = filters.status === 'all' || point.status === filters.status
      return matchesTipo && matchesStatus
    })
  }

  function renderMap() {
    if (!mapRef.current || !window.google?.maps) return

    const points = filterPoints()
    const center = points.length > 0
      ? { lat: Number(points[0].latitude), lng: Number(points[0].longitude) }
      : { lat: -15.7801, lng: -47.9292 }

    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: points.length > 0 ? 12 : 4,
        mapTypeControl: false,
        streetViewControl: false
      })
    } else {
      mapInstance.current.setCenter(center)
      mapInstance.current.setZoom(points.length > 0 ? 12 : 4)
    }

    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    points.forEach((point) => {
      const position = { lat: Number(point.latitude), lng: Number(point.longitude) }
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstance.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: getPinColor(point.status),
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#fff'
        }
      })

      const ownerName = proprietarios[point.proprietario_id] || 'Proprietário não encontrado'
      const activeContractsForPoint = contracts.filter((contract) => contract.ponto_id === point.id && isContractActive(contract))
      const contractContent = activeContractsForPoint.length > 0
        ? `<span style="font-size:0.95rem; font-weight:600;">Contratos ativos: ${activeContractsForPoint.length}</span><br />`
        : ''
      const tvHint = point.tipo === 'TV'
        ? '<span style="font-size:0.95rem; color:#1d4ed8; font-weight:600;">TV aceita múltiplos contratos simultâneos</span><br />'
        : ''

      const content = `
        <div style="max-width:240px;font-family:Arial,sans-serif;line-height:1.4;">
          <strong>${point.identificacao}</strong><br />
          <span style="font-size:0.95rem">Tipo: ${point.tipo}</span><br />
          <span style="font-size:0.95rem">Status: ${point.status}</span><br />
          <span style="font-size:0.95rem">Proprietário: ${ownerName}</span><br />
          ${contractContent}
          ${tvHint}
          ${point.status === 'LOCADO' ? '<span style="color:#dc3545;font-weight:600;">Contrato ativo</span><br />' : ''}
          <a href="#" id="edit-point-${point.id}" style="color:#1d4ed8; text-decoration:none; font-weight:600;">Editar Ponto</a>
        </div>
      `
      const infoWindow = new window.google.maps.InfoWindow({ content })
      marker.addListener('click', () => {
        infoWindow.open(mapInstance.current, marker)
        setSelectedPoint(point)
        window.google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
          const editLink = document.getElementById(`edit-point-${point.id}`)
          if (editLink) {
            editLink.addEventListener('click', (event) => {
              event.preventDefault()
              setSelectedPoint(point)
            })
          }
        })
      })

      markersRef.current.push(marker)
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Filtrar por tipo</label>
          <select
            value={filters.tipo}
            onChange={(event) => setFilters((current) => ({ ...current, tipo: event.target.value }))}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="OUTDOOR">Outdoors</option>
            <option value="TV">TVs</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Filtrar por status</label>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="DISPONIVEL">Disponíveis</option>
            <option value="LOCADO">Locados</option>
            <option value="MANUTENCAO">Em manutenção</option>
          </select>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <button
            type="button"
            onClick={fetchData}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Atualizar dados
          </button>
          <button
            type="button"
            onClick={fetchData}
            className="w-full rounded border border-blue-600 bg-white px-4 py-2 text-blue-600 hover:bg-blue-50"
          >
            Sincronizar status
          </button>
        </div>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {statusSyncMessage && <div className="rounded border border-green-200 bg-green-50 p-4 text-sm text-green-700">{statusSyncMessage}</div>}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
          <div className="h-[520px]" ref={mapRef} />
          {loading && <div className="mt-4 text-sm text-gray-600">Carregando pontos...</div>}
          {!loading && pontos.length === 0 && <div className="mt-4 text-sm text-gray-600">Nenhum ponto de inventário cadastrado.</div>}
        </div>

        <div className="space-y-4">
          <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Legenda</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>🟢 Disponível</li>
              <li>🔴 Locado</li>
              <li>🟡 Em manutenção</li>
              <li>🟣 TVs podem receber múltiplos contratos simultâneos</li>
            </ul>
          </div>

          {selectedPoint && (
            <div className="rounded border border-gray-200 bg-white p-4 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Ponto selecionado</h2>
                <p className="mt-2 text-sm"><strong>{selectedPoint.identificacao}</strong></p>
                <p className="text-sm">Tipo: {selectedPoint.tipo}</p>
                <p className="text-sm">Status: {selectedPoint.status}</p>
                <p className="text-sm">Proprietário: {proprietarios[selectedPoint.proprietario_id] || 'N/A'}</p>
                <p className="text-sm">Latitude: {selectedPoint.latitude}</p>
                <p className="text-sm">Longitude: {selectedPoint.longitude}</p>
              </div>

              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Abrir edição rápida
              </button>

              {editMode && editForm && (
                <div className="rounded border border-gray-200 bg-gray-50 p-4">
                  <h3 className="text-lg font-semibold">Edição rápida</h3>
                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Identificação</label>
                      <input
                        value={editForm.identificacao}
                        onChange={(event) => updateEditField('identificacao', event.target.value)}
                        className="mt-1 block w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo</label>
                      <select
                        value={editForm.tipo}
                        onChange={(event) => updateEditField('tipo', event.target.value)}
                        className="mt-1 block w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="OUTDOOR">Outdoor</option>
                        <option value="TV">TV</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={editForm.status}
                        onChange={(event) => updateEditField('status', event.target.value)}
                        className="mt-1 block w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="DISPONIVEL">Disponível</option>
                        <option value="LOCADO">Locado</option>
                        <option value="MANUTENCAO">Manutenção</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Proprietário</label>
                      <select
                        value={editForm.proprietario_id}
                        onChange={(event) => updateEditField('proprietario_id', event.target.value)}
                        className="mt-1 block w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Selecione um proprietário</option>
                        {owners.map((owner) => (
                          <option key={owner.id} value={owner.id}>{owner.nome_completo}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Latitude</label>
                      <input
                        value={editForm.latitude}
                        onChange={(event) => updateEditField('latitude', event.target.value)}
                        className="mt-1 block w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Longitude</label>
                      <input
                        value={editForm.longitude}
                        onChange={(event) => updateEditField('longitude', event.target.value)}
                        className="mt-1 block w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço completo</label>
                    <input
                      value={editForm.endereco_completo}
                      onChange={(event) => updateEditField('endereco_completo', event.target.value)}
                      className="mt-1 block w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor de custo mensal</label>
                    <input
                      value={editForm.valor_custo_proprietario}
                      onChange={(event) => updateEditField('valor_custo_proprietario', event.target.value)}
                      className="mt-1 block w-full rounded border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      Salvar alterações
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Cancelar edição
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
