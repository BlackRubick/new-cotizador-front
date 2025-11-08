import React from 'react'
import MainTemplate from '../templates/MainTemplate'

export default function AboutPage() {
  return (
    <MainTemplate>
      <div className="p-6">
        <h2 className="text-2xl font-semibold">About</h2>
        <p className="mt-2 text-gray-600">Esta es la página About del ejemplo con React Router.</p>
      </div>
    </MainTemplate>
  )
}
