import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import MainTemplate from '../templates/MainTemplate'
import QuoteForm from '../components/QuoteForm'

export default function QuoteFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const initial = location.state && location.state.initial ? location.state.initial : null

  async function handleCreated(q) {
    // after create, return to list
    navigate('/quotes')
  }

  async function handleUpdated(q) {
    // after update, return to list
    navigate('/quotes')
  }

  return (
    <MainTemplate>
      <div className="p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{initial ? 'Editar Cotización' : 'Crear Cotización'}</h1>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <QuoteForm onCreated={handleCreated} initial={initial} onUpdated={handleUpdated} />
        </div>
      </div>
    </MainTemplate>
  )
}
