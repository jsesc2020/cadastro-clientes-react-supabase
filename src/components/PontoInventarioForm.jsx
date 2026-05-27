import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'

const initialForm = {
  tipo: 'OUTDOOR',
  identificacao: '',
  proprietario_id: '',
  endereco_completo: '',
  latitude: '',
  longitude: '',
  status: 'DISPONIVEL',
  valor_custo_proprietario: ''
}

function sanitizeNumber(value) {
  return value.replace(/[^0-9.,]/g, '').replace(',', '.')
}

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

export default function PontoInventarioForm({ onSuccess }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [owners, setOwners] = useState([])
  const [mapsReady, setMapsReady] = useState(false)
  const [mapError, setMapError] = useState('')
  const inputRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const autocompleteRef = useRef(null)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  useEffect(() => {
    fetchOwners()
  }, [])

  useEffect(() => {
    if (!apiKey) {
      setMapError('É necessário configurar VITE_GOOGLE_MAPS_API_KEY para endereço com autocomplete e mapa.')
      return
    }

    loadGoogleMaps(apiKey)
      .then(() => {
        initializeAutocomplete()
        setMapsReady(true)
      })
      .catch((error) => {
        console.error(error)
        setMapError('Não foi possível carregar Google Maps. Verifique sua chave de API.')
      })
  }, [apiKey])

  useEffect(() => {
    if (mapsReady && form.latitude && form.longitude) {
      renderMiniMap()
    }
  }, [mapsReady, form.latitude, form.longitude])

  async function fetchOwners() {
    try {
      const { data, error } = await supabase
        .from('proprietarios')
        .select('id, nome_completo')
        .order('nome_completo', { ascending: true })

      if (error) throw error
      setOwners(data || [])
    } catch (error) {
      console.error('Erro ao carregar proprietários:', error)
    }
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: null }))
    }
  }

  function initializeAutocomplete() {
    if (!inputRef.current || !window.google?.maps?.places) return
    if (autocompleteRef.current) return

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry'],
      componentRestrictions: { country: 'br' }
    })

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace()
      if (!place.geometry || !place.geometry.location) {
        setMessage('Selecione um endereço válido na lista.')
        return
      }

      const formattedAddress = place.formatted_address || inputRef.current.value
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()

      setForm((current) => ({
        ...current,
        endereco_completo: formattedAddress,
        latitude: lat.toFixed(8),
        longitude: lng.toFixed(8)
      }))
      setMessage('Endereço e coordenadas atualizados.')
    })
  }

  function renderMiniMap() {
    if (!mapRef.current || !window.google?.maps) return
    const position = {
      lat: Number(form.latitude),
      lng: Number(form.longitude)
    }
    const map = new window.google.maps.Map(mapRef.current, {
      center: position,
      zoom: 16,
      disableDefaultUI: true
    })
    const marker = new window.google.maps.Marker({
      position,
      map,
      draggable: true,
      title: 'Ajuste a posição do ponto'
    })
    marker.addListener('dragend', () => {
      const pos = marker.getPosition()
      if (!pos) return
      setForm((current) => ({
        ...current,
        latitude: pos.lat().toFixed(8),
        longitude: pos.lng().toFixed(8)
      }))
    })
    markerRef.current = marker
  }

  function validateForm() {
    const fieldErrors = {}

    if (!form.identificacao.trim()) fieldErrors.identificacao = 'Identificação é obrigatória'
    if (!form.proprietario_id) fieldErrors.proprietario_id = 'Selecione um proprietário'
    if (!form.endereco_completo.trim()) fieldErrors.endereco_completo = 'Endereço é obrigatório'
    if (!form.latitude || !form.longitude) fieldErrors.latitude = 'Latitude e longitude precisam ser geradas'
    if (!form.valor_custo_proprietario.trim()) fieldErrors.valor_custo_proprietario = 'Valor de custo é obrigatório'
    else if (Number.isNaN(Number(sanitizeNumber(form.valor_custo_proprietario)))) fieldErrors.valor_custo_proprietario = 'Valor inválido'

    return {
      valid: Object.keys(fieldErrors).length === 0,
      fieldErrors
    }
  }

  async function handleSave(event) {
    event.preventDefault()
    setMessage('')
    const { valid, fieldErrors } = validateForm()
    if (!valid) {
      setErrors(fieldErrors)
      setMessage('Corrija os campos antes de salvar.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        tipo: form.tipo,
        identificacao: form.identificacao.trim(),
        endereco_completo: form.endereco_completo.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        status: form.status,
        proprietario_id: form.proprietario_id,
        valor_custo_proprietario: parseFloat(sanitizeNumber(form.valor_custo_proprietario))
      }

      const { error } = await supabase.from('pontos_inventario').insert([payload])
      if (error) throw error

      setMessage('Ponto de mídia cadastrado com sucesso.')
      setForm(initialForm)
      setErrors({})
      if (typeof onSuccess === 'function') onSuccess()
    } catch (error) {
      console.error(error)
      setMessage(error.message || 'Erro ao salvar o ponto de mídia.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              value={form.tipo}
              onChange={(event) => updateField('tipo', event.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="OUTDOOR">Outdoor</option>
              <option value="TV">TV</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="DISPONIVEL">Disponível</option>
              <option value="LOCADO">Locado</option>
              <option value="MANUTENCAO">Manutenção</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Identificação</label>
          <input
            value={form.identificacao}
            onChange={(event) => updateField('identificacao', event.target.value)}
            className={`mt-1 block w-full rounded border ${errors.identificacao ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            placeholder="Outdoor próximo ao shopping"
          />
          {errors.identificacao && <p className="mt-1 text-sm text-red-600">{errors.identificacao}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Proprietário</label>
          <select
            value={form.proprietario_id}
            onChange={(event) => updateField('proprietario_id', event.target.value)}
            className={`mt-1 block w-full rounded border ${errors.proprietario_id ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          >
            <option value="">Selecione um proprietário</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>{owner.nome_completo}</option>
            ))}
          </select>
          {errors.proprietario_id && <p className="mt-1 text-sm text-red-600">{errors.proprietario_id}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Endereço completo</label>
          <input
            ref={inputRef}
            value={form.endereco_completo}
            onChange={(event) => updateField('endereco_completo', event.target.value)}
            placeholder="Digite e selecione uma sugestão do Google"
            className={`mt-1 block w-full rounded border ${errors.endereco_completo ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
          />
          {errors.endereco_completo && <p className="mt-1 text-sm text-red-600">{errors.endereco_completo}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Latitude</label>
            <input
              readOnly
              value={form.latitude}
              className={`mt-1 block w-full rounded border ${errors.latitude ? 'border-red-500' : 'border-gray-300'} bg-gray-50 px-3 py-2 text-gray-700 shadow-sm`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Longitude</label>
            <input
              readOnly
              value={form.longitude}
              className={`mt-1 block w-full rounded border ${errors.latitude ? 'border-red-500' : 'border-gray-300'} bg-gray-50 px-3 py-2 text-gray-700 shadow-sm`}
            />
          </div>
        </div>

        {mapError ? (
          <div className="rounded border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">{mapError}</div>
        ) : (
          <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">Posição no mapa</p>
            <div ref={mapRef} className="h-64 rounded border border-gray-200" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Valor de custo mensal</label>
          <input
            value={form.valor_custo_proprietario}
            onChange={(event) => updateField('valor_custo_proprietario', sanitizeNumber(event.target.value))}
            className={`mt-1 block w-full rounded border ${errors.valor_custo_proprietario ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            placeholder="1200.00"
          />
          {errors.valor_custo_proprietario && <p className="mt-1 text-sm text-red-600">{errors.valor_custo_proprietario}</p>}
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-600">Ao salvar, o ponto fica disponível no mapa interativo e recebe coordenadas válidas automaticamente.</span>
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Salvar Ponto de Mídia'}
          </button>
        </div>
      </form>

      {message && <p className="text-sm text-gray-700">{message}</p>}
    </div>
  )
}
