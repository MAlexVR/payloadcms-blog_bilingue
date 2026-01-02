'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import 'flag-icons/css/flag-icons.min.css' // <--- Importamos los estilos aquí

export default function LanguageSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentLocale = searchParams.get('locale') || 'es'

  const handleLanguageChange = (newLocale: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('locale', newLocale)
    router.push(`${pathname}?${params.toString()}`)
  }

  // Estilo base para los botones
  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px', // Un poco más de espacio para la bandera
    padding: '6px 12px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        background: 'rgba(255,255,255,0.1)',
        padding: '4px',
        borderRadius: '24px',
      }}
    >
      {/* Botón Español */}
      <button
        onClick={() => handleLanguageChange('es')}
        style={{
          ...buttonStyle,
          backgroundColor: currentLocale === 'es' ? 'white' : 'transparent',
          color: currentLocale === 'es' ? 'var(--primary)' : 'white',
          fontWeight: currentLocale === 'es' ? 'bold' : 'normal',
          boxShadow: currentLocale === 'es' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        {/* Usamos la clase de la librería en lugar del emoji */}
        <span className="fi fi-es" style={{ borderRadius: '2px' }}></span>
        <span>ES</span>
      </button>

      {/* Botón Inglés */}
      <button
        onClick={() => handleLanguageChange('en')}
        style={{
          ...buttonStyle,
          backgroundColor: currentLocale === 'en' ? 'white' : 'transparent',
          color: currentLocale === 'en' ? 'var(--primary)' : 'white',
          fontWeight: currentLocale === 'en' ? 'bold' : 'normal',
          boxShadow: currentLocale === 'en' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        {/* Usamos la clase de la librería en lugar del emoji */}
        <span className="fi fi-us" style={{ borderRadius: '2px' }}></span>
        <span>EN</span>
      </button>
    </div>
  )
}
