import React from 'react'
import MainTemplate from '../templates/MainTemplate'

export default function AdminPanel() {
  return (
    <MainTemplate>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="mt-4">Aquí se administran usuarios y configuraciones (solo para roles permitidos).</p>
      </div>
    </MainTemplate>
  )
}
