import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainTemplate from '../templates/MainTemplate'
import ClientForm from '../components/clients/ClientForm'
import clientService from '../services/clientService'
import { alertError } from '../utils/swal'

export default function ClientFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  console.log('[ClientFormPage] render id=', id)

  const initial = useMemo(() => {
    if (id) {
      const clients = clientService.listClients()
      const found = clients.find(c => c.id === id)
      console.log('[ClientFormPage] computed initial (found?)', !!found)
      return found || { encargados: [] }
    }
    console.log('[ClientFormPage] computed initial new')
    return { encargados: [] }
  }, [id])

  async function handleSave(data) {
    if (id) {
      const res = await clientService.updateClient(id, data)
      if (!res.success) await alertError('Error actualizando: ' + res.error)
    } else {
      const res = await clientService.createClient(data)
      if (!res.success) await alertError('Error creando: ' + res.error)
    }
    navigate('/clients')
  }

  return (
    <MainTemplate>
      <div className="p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{id ? 'Editar Cliente' : 'Crear Cliente'}</h1>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <ClientForm initial={initial} onSave={handleSave} onCancel={() => navigate('/clients')} />
        </div>
      </div>
    </MainTemplate>
  )
}
