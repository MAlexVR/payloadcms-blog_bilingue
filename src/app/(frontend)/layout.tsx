import React from 'react'
import './styles.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer' // <--- 1. Importamos el Footer
import 'flag-icons/css/flag-icons.min.css'

export const metadata = {
  description: 'Un blog genial creado con Payload',
  title: 'Mi Blog Payload',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        style={{
          display: 'flex', // <--- 2. Convertimos el body en Flexbox
          flexDirection: 'column', // <--- Vertical
          minHeight: '100vh', // <--- Ocupa al menos el 100% de la altura de la ventana
          margin: 0,
        }}
      >
        <Header />

        {/* El contenido crece para ocupar el espacio disponible */}
        <div style={{ flex: 1 }}>{children}</div>

        {/* 3. Agregamos el Footer al final */}
        <Footer />
      </body>
    </html>
  )
}
