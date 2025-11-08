import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-med-bg border-t mt-8">
      <div className="container mx-auto p-4 text-sm text-med-slate-500">© {new Date().getFullYear()} New Cotizador</div>
    </footer>
  )
}
