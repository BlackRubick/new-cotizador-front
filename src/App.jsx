import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import QuotesPage from './pages/QuotesPage'
import ProductsPage from './pages/ProductsPage'
import ClientsPage from './pages/ClientsPage'
import ClientFormPage from './pages/ClientFormPage'
import QuoteFormPage from './pages/QuoteFormPage'
import QuoteViewPage from './pages/QuoteViewPage'
import UsersPage from './pages/UsersPage'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function AppRoutes() {
  const location = useLocation()
  const hideNav = location.pathname === '/' 

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute permission="view_home">
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quotes"
          element={
            <ProtectedRoute permission="view_quotes">
              <QuotesPa ge />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quotes/new"
          element={
            <ProtectedRoute permission="view_quotes">
              <QuoteFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotes/:id"
          element={
            <ProtectedRoute permission="view_quotes">
              <QuoteViewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute permission="view_products">
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute permission="view_clients">
              <ClientsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients/new"
          element={
            <ProtectedRoute permission="view_clients">
              <ClientFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients/:id/edit"
          element={
            <ProtectedRoute permission="view_clients">
              <ClientFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute permission="admin_panel">
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/about"
          element={
            <ProtectedRoute permission="view_about">
              <AboutPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
