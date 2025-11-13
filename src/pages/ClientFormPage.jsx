import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainTemplate from '../templates/MainTemplate'
import ClientForm from '../components/clients/ClientForm'
import clientService from '../services/clientService'
import { alertError } from '../utils/swal'

export default function ClientFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [initial, setInitial] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadedRef = useRef(false)

  useEffect(() => {
    // Solo cargar una vez cuando cambie el ID
    if (loadedRef.current) return
    
    async function loadClient() {
      setIsLoading(true)
      if (id) {
        const client = await clientService.getClientById(id)
        setInitial(client || { encargados: [] })
      } else {
        setInitial({ encargados: [] })
      }
      setIsLoading(false)
      loadedRef.current = true
    }
    loadClient()
    
    // Reset cuando cambie el ID
    return () => {
      loadedRef.current = false
    }
  }, [id])

  async function handleSave(data) {
    if (id) {
      // Si el payload viene solo con encargados (por permisos de vendedor),
      // fusionar con los datos iniciales para evitar enviar un objeto parcial
      // que pudiera sobrescribir campos en el backend que espera el objeto completo.
      const payload = (data && Object.keys(data).length === 1 && data.encargados)
        ? { ...initial, encargados: data.encargados }
        : data

      const res = await clientService.updateClient(id, payload)
      if (!res.success) await alertError('Error actualizando: ' + res.error)
    } else {
      const res = await clientService.createClient(data)
      if (!res.success) await alertError('Error creando: ' + res.error)
    }
    navigate('/clients')
  }

  if (isLoading || !initial) {
    return (
      <MainTemplate>
        <div className="p-4 sm:p-6 flex items-center justify-center">
          <div className="animate-pulse text-sm sm:text-base text-gray-500">Cargando...</div>
        </div>
      </MainTemplate>
    )
  }

  return (
    <MainTemplate>
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold">{id ? 'Editar Cliente' : 'Crear Cliente'}</h1>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow">
          <ClientForm initial={initial} onSave={handleSave} onCancel={() => navigate('/clients')} />
        </div>
      </div>
    </MainTemplate>
  )
}
