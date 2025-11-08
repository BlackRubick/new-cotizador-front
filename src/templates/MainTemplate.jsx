import React from 'react'
import Header from '../organisms/Header'
import Footer from '../organisms/Footer'

export default function MainTemplate({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  )
}
