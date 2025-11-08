import React from 'react'
import MainTemplate from '../templates/MainTemplate'
import ClientManager from '../components/clients/ClientManager'

export default function ClientsPage() {
  return (
    <MainTemplate>
      <ClientManager />
    </MainTemplate>
  )
}
