export function isContractActive(contract) {
  if (!contract || contract.status !== 'ATIVO') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(contract.data_inicio)
  const end = new Date(contract.data_termino)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return start <= today && today <= end
}

export function getActiveContractCounts(contracts) {
  return (contracts || []).reduce((acc, contract) => {
    if (isContractActive(contract)) {
      acc[contract.ponto_id] = (acc[contract.ponto_id] || 0) + 1
    }
    return acc
  }, {})
}

export function canContractPoint(point, activeContractCounts = {}) {
  if (!point || point.status === 'MANUTENCAO') return false
  if (point.tipo === 'TV') return true
  return (activeContractCounts[point.id] || 0) === 0
}

export function getAvailableContractPoints(points, contracts) {
  const activeContractCounts = getActiveContractCounts(contracts)
  return (points || []).filter((point) => canContractPoint(point, activeContractCounts))
}

export function normalizePointStatuses(pointList, contractList) {
  const activeContractCounts = getActiveContractCounts(contractList)
  return (pointList || []).map((point) => {
    if (!point || point.status === 'MANUTENCAO') return point
    const activeCount = activeContractCounts[point.id] || 0
    if (activeCount > 0) return { ...point, status: 'LOCADO' }
    if (point.status === 'LOCADO') return { ...point, status: 'DISPONIVEL' }
    return point
  })
}
