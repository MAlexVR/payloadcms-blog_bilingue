'use client'
import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getDictionary } from '../utilities/dictionary'

export default function Footer() {
  const searchParams = useSearchParams()
  const currentLocale = searchParams.get('locale') === 'en' ? 'en' : 'es'
  const dict = getDictionary(currentLocale)
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        background: 'var(--card-bg)',
        marginTop: 'auto', // Esto empuja el footer al fondo si hay poco contenido
        borderTop: '1px solid var(--border)',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <div className="container">
        {/* Redes Sociales (Simuladas con texto por ahora) */}
        <div
          style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}
        >
          <Link
            href="#"
            style={{ color: 'var(--text-main)', textDecoration: 'none', opacity: 0.8 }}
          >
            GitHub
          </Link>
          <Link
            href="#"
            style={{ color: 'var(--text-main)', textDecoration: 'none', opacity: 0.8 }}
          >
            LinkedIn
          </Link>
        </div>

        {/* Texto de Derechos */}
        <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '10px' }}>
          &copy; {year} Payload CMS Blog. {dict.footerRights}
        </p>

        {/* Créditos */}
        <p style={{ fontSize: '0.8rem', opacity: 0.4 }}>{dict.builtWith}</p>
      </div>
    </footer>
  )
}
