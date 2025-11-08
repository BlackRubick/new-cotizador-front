import React from 'react'
import LogoAtom from '../components/atoms/LogoAtom'

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <LogoAtom />
      <div className="font-semibold">New Cotizador</div>
    </div>
  )
}
