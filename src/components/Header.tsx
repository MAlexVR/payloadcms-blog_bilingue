'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import { getDictionary } from '../utilities/dictionary' // Ajusta la ruta si es necesario
import LanguageSelector from './LanguageSelector'

export default function Header() {
  // 1. "Escuchamos" la URL
  const searchParams = useSearchParams()
  const currentLocale = searchParams.get('locale') === 'en' ? 'en' : 'es'

  // 2. Cargamos el diccionario correcto
  const dict = getDictionary(currentLocale)

  return (
    <header className="main-header">
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 0,
        }}
      >
        {/* Título y Subtítulo traducidos */}
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>{dict.headerTitle}</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>{dict.headerSubtitle}</p>
        </div>

        {/* Incluimos el selector aquí dentro para tener todo junto */}
        <LanguageSelector />
      </div>
    </header>
  )
}
