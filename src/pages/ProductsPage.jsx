import React from 'react'
import MainTemplate from '../templates/MainTemplate'
import ProductManager from '../components/ProductManager'

export default function ProductsPage() {
  return (
    <MainTemplate>
      <div className="p-4 sm:p-6">
        <ProductManager />
      </div>
    </MainTemplate>
  )
}
