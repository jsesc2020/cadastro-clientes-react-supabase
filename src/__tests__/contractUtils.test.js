/**
 * @jest-environment jsdom
 */
import {
  isContractActive,
  getActiveContractCounts,
  canContractPoint,
  getAvailableContractPoints,
  normalizePointStatuses
} from '../lib/contractUtils'

describe('contractUtils', () => {
  describe('isContractActive', () => {
    it('returns true for active contract within date range', () => {
      const today = new Date().toISOString().slice(0, 10)
      const contract = { status: 'ATIVO', data_inicio: today, data_termino: today }
      expect(isContractActive(contract)).toBe(true)
    })

    it('returns false for inactive contract status', () => {
      const today = new Date().toISOString().slice(0, 10)
      const contract = { status: 'CANCELADO', data_inicio: today, data_termino: today }
      expect(isContractActive(contract)).toBe(false)
    })
  })

  describe('getActiveContractCounts', () => {
    it('counts only active contracts per point', () => {
      const contracts = [
        { ponto_id: 1, status: 'ATIVO', data_inicio: '2000-01-01', data_termino: '2100-01-01' },
        { ponto_id: 1, status: 'ATIVO', data_inicio: '2000-01-01', data_termino: '2100-01-01' },
        { ponto_id: 2, status: 'INATIVO', data_inicio: '2000-01-01', data_termino: '2100-01-01' }
      ]
      expect(getActiveContractCounts(contracts)).toEqual({ '1': 2 })
    })
  })

  describe('canContractPoint', () => {
    it('allows TV points no matter how many active contracts exist', () => {
      const point = { id: 1, tipo: 'TV', status: 'LOCADO' }
      expect(canContractPoint(point, { 1: 3 })).toBe(true)
    })

    it('blocks outdoor points with active contracts', () => {
      const point = { id: 2, tipo: 'OUTDOOR', status: 'LOCADO' }
      expect(canContractPoint(point, { 2: 1 })).toBe(false)
    })

    it('allows outdoor points with no active contracts', () => {
      const point = { id: 3, tipo: 'OUTDOOR', status: 'DISPONIVEL' }
      expect(canContractPoint(point, {})).toBe(true)
    })

    it('blocks points in maintenance', () => {
      const point = { id: 4, tipo: 'TV', status: 'MANUTENCAO' }
      expect(canContractPoint(point, {})).toBe(false)
    })
  })

  describe('getAvailableContractPoints', () => {
    it('returns only contractable points', () => {
      const points = [
        { id: 1, tipo: 'TV', status: 'LOCADO' },
        { id: 2, tipo: 'OUTDOOR', status: 'LOCADO' },
        { id: 3, tipo: 'OUTDOOR', status: 'DISPONIVEL' }
      ]
      const contracts = [
        { ponto_id: 2, status: 'ATIVO', data_inicio: '2000-01-01', data_termino: '2100-01-01' }
      ]
      expect(getAvailableContractPoints(points, contracts).map((p) => p.id)).toEqual([1, 3])
    })
  })

  describe('normalizePointStatuses', () => {
    it('marks points with active contracts as LOCADO and clears stale LOCADO statuses', () => {
      const points = [
        { id: 1, tipo: 'TV', status: 'DISPONIVEL' },
        { id: 2, tipo: 'OUTDOOR', status: 'LOCADO' },
        { id: 3, tipo: 'OUTDOOR', status: 'MANUTENCAO' }
      ]
      const contracts = [
        { ponto_id: 1, status: 'ATIVO', data_inicio: '2000-01-01', data_termino: '2100-01-01' }
      ]
      const normalized = normalizePointStatuses(points, contracts)
      expect(normalized.find((p) => p.id === 1).status).toBe('LOCADO')
      expect(normalized.find((p) => p.id === 2).status).toBe('DISPONIVEL')
      expect(normalized.find((p) => p.id === 3).status).toBe('MANUTENCAO')
    })
  })
})
