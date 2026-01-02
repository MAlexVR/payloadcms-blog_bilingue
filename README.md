# Blog Bilingüe con Payload CMS 3.69.0 y Next.js 15

**Proyecto:** Payload CMS - Blog Bilingüe
**Versión de Payload:** 3.69.0
**Fecha:** 26 de Diciembre de 2025  
**Autor:** Mauricio Vargas

---

## 0. Estructura de Archivos del Proyecto

A continuación se detalla la ubicación exacta de los archivos configurados y creados durante el desarrollo:

```
/
├── next.config.mjs                 # Configuración del servidor (Imágenes y límites)
├── src/
│   ├── payload.config.ts           # Configuración principal de Payload (i18n, DB)
│   ├── collections/
│   │   ├── Media.ts                # Colección para subida de imágenes
│   │   └── Posts.ts                # Colección principal del Blog
│   ├── utilities/
│   │   └── dictionary.ts           # Diccionario de traducciones (ES/EN)
│   ├── components/                 # Componentes de Cliente (UI)
│   │   ├── LanguageSelector.tsx    # Botones de bandera
│   │   ├── Header.tsx              # Encabezado dinámico
│   │   └── Footer.tsx              # Pie de página dinámico
│   └── app/
│       └── (frontend)/             # Rutas públicas (Next.js App Router)
│           ├── styles.css          # Estilos globales (Variables CSS)
│           ├── layout.tsx          # Estructura base (html, body)
│           ├── page.tsx            # Página de Inicio (Home)
│           └── posts/
│               └── [slug]/
│                   └── page.tsx    # Página de Artículo Individual
```

---

## 1. Introducción y Preparación del Entorno

El objetivo de este proyecto ha sido desplegar un Sistema de Gestión de Contenidos (CMS) tipo "Headless" utilizando la arquitectura moderna de Payload CMS 3.69.0 nativa en Next.js.

### 1.1 Requisitos Previos e Instalación

Se partió de una instalación limpia de Node.js. Para gestionar dependencias de UI específicas (como iconos de banderas), se utilizó yarn.

- **Node.js:** Verificado versión `v24.12.0`
- **Comando de inicialización:** `npx create-payload-app@latest` (Plantilla Blank)
- **Base de Datos:** SQLite (Local)
- **Dependencias adicionales:** `yarn add flag-icons`

---

## 2. Configuración del Núcleo (Backend & Config)

### 2.1 Configuración de Next.js (`next.config.mjs`)

Se modificó la configuración del servidor para permitir dos comportamientos críticos:

1. **Carga de imágenes externas:** Permitir dominios, específicamente localhost para desarrollo.
2. **Límite de peso en Server Actions:** Aumentar el límite de subida a 10MB para permitir imágenes de alta resolución.

> **Ruta:** `next.config.mjs` (Raíz del proyecto)

```javascript
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // <--- Aquí subimos el límite a 10 Megabytes
    },
  },

  // 1. Agregamos permiso para cargar imágenes de localhost
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/**',
      },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
```

### 2.2 Internacionalización y Colecciones (`payload.config.ts`)

Se configuró Payload para soportar Español (es) e Inglés (en) tanto en la interfaz administrativa como en el contenido de la base de datos.

> **Ruta:** `src/payload.config.ts`

```typescript
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Importamos los idiomas
import { es } from 'payload/i18n/es'
import { en } from 'payload/i18n/en'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts' // Importamos nuestra colección nueva

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: 'http://localhost:3000', // Definimos la URL base

  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  // Seguridad para evitar bloqueos en local
  cors: ['http://localhost:3000'],
  csrf: ['http://localhost:3000'],

  // Idioma de la interfaz (Botones, menús)
  i18n: {
    supportedLanguages: { es, en },
  },

  // Idioma del contenido (Base de datos)
  localization: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    fallback: true,
  },

  collections: [Users, Media, Posts], // Agregamos Posts a la lista
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
```

---

## 3. Estructura de Datos (Colecciones)

### 3.1 Colección de Medios (`Media.ts`)

Definición para almacenamiento local de archivos.

> **Ruta:** `src/collections/Media.ts`

```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // Todo el mundo puede ver las imágenes
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    staticDir: 'media', // <--- Esto crea una carpeta 'media' en la raíz de tu proyecto
    adminThumbnail: 'mimeType', // Muestra una vista previa genérica si falla la imagen
    mimeTypes: ['image/*'], // Solo permite subir imágenes
  },
}
```

### 3.2 Colección de Posts (`Posts.ts`)

Estructura principal del blog. Incluye campos localizados y relaciones.

> **Ruta:** `src/collections/Posts.ts`

```typescript
import { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Título del Post',
      localized: true, // Permite traducción
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'Contenido',
      localized: true, // Permite traducción
    },
    {
      name: 'coverImage',
      type: 'upload', // Tipo archivo
      relationTo: 'media', // Se conecta a la colección Media
      required: true, // (O false, si decidiste dejarlo opcional)
      label: 'Imagen de Portada',
    },
    {
      name: 'slug',
      type: 'text',
      required: true, // Es obligatorio para crear la URL
      admin: {
        position: 'sidebar', // Lo ponemos a un ladito
      },
      index: true, // Esto hace que las búsquedas sean rápidas
    },
  ],
}
```

---

## 4. Lógica de Negocio y Utilidades

### 4.1 Diccionario de Traducción (`dictionary.ts`)

Objeto JSON tipado para manejar textos estáticos de la interfaz (Botones, Header, Footer).

> **Ruta:** `src/utilities/dictionary.ts`

```typescript
export const dictionary = {
  es: {
    headerTitle: 'Mi Blog',
    headerSubtitle: 'Blog para aprender el manejo de Payload CMS',
    readMore: 'Leer más',
    backHome: '← Volver al inicio',
    noPosts: 'No hay posts disponibles en este idioma.',
    loading: 'Cargando...',
    footerRights: 'Todos los derechos reservados.',
    builtWith: 'Creado con Payload CMS y Next.js',
  },
  en: {
    headerTitle: 'My Blog',
    headerSubtitle: 'Blog for learning how to use Payload CMS',
    readMore: 'Read more',
    backHome: '← Back to home',
    noPosts: 'No posts available in this language.',
    loading: 'Loading...',
    footerRights: 'All rights reserved.',
    builtWith: 'Built with Payload CMS and Next.js',
  },
}

// Un pequeño ayudante para evitar errores de tipo
export type Locale = 'es' | 'en'
export const getDictionary = (locale: string) => {
  // Si el idioma no es 'es' ni 'en', usamos español por defecto
  return dictionary[locale as Locale] || dictionary.es
}
```

---

## 5. Componentes de UI (Frontend)

### 5.1 Selector de Idiomas (`LanguageSelector.tsx`)

Componente de cliente que gestiona la navegación entre locales usando `flag-icons`.

> **Ruta:** `src/components/LanguageSelector.tsx`

```tsx
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
```

### 5.2 Encabezado (`Header.tsx`)

Componente dinámico que consume el diccionario para traducir el título.

> **Ruta:** `src/components/Header.tsx`

```tsx
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
```

### 5.3 Pie de Página (`Footer.tsx`)

Componente dinámico con derechos de autor y enlaces.

> **Ruta:** `src/components/Footer.tsx`

```tsx
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
```

---

## 6. Estilos

Se manejan los estilos en el archivo `styles.css`, integrando variables CSS modernas.

> **Ruta:** `src/app/(frontend)/styles.css`

```css
/* src/app/(frontend)/globals.css */

/* 1. Variables extraídas de tu proyecto anterior */
:root {
  --primary: #004d40;
  --primary-light: #00695c;
  --accent: #00bfa5;
  --bg-color: #f0f2f5;
  --card-bg: #ffffff;
  --text-main: #263238;
  --text-muted: #546e7a;
  --border-radius: 12px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 2. Reset básico */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-color);
  color: var(--text-main);
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  line-height: 1.6;
}

/* 3. Estilos del Header */
.main-header {
  background-color: var(--primary);
  color: white;
  padding: 2rem 1rem;
  text-align: center;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
}

.main-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.main-header p {
  color: var(--accent); /* Usamos el color de acento para el subtítulo */
  font-weight: 500;
}

/* 4. Layout del Grid */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

/* 5. Estilo de las Tarjetas (Cards) - Igual que tu simulador */
.card {
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.card-image {
  position: relative;
  width: 100%;
  height: 200px; /* Altura fija para uniformidad */
  background-color: #ddd;
}

.card-content {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card h2 {
  color: var(--primary);
  font-size: 1.25rem;
  margin-bottom: 10px;
  line-height: 1.3;
}

.card p {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 20px;
  flex-grow: 1;
}

.btn-read {
  display: inline-block;
  background-color: var(--primary-light);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  transition: background 0.3s;
  align-self: flex-start;
}

.btn-read:hover {
  background-color: var(--primary);
}
```

---

## 7. Páginas y Rutas (App Router)

### 7.1 Layout Principal (`layout.tsx`)

Estructura base que incluye Header, Footer, estilos globales y estilos de banderas. Configurado con Flexbox para "Sticky Footer".

> **Ruta:** `src/app/(frontend)/layout.tsx`

```tsx
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
```

### 7.2 Página de Inicio (`page.tsx`)

Renderiza el listado de tarjetas. Detecta el idioma vía `searchParams` y consulta la base de datos.

> **Ruta:** `src/app/(frontend)/page.tsx`

```tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import Link from 'next/link'
// Importamos tu diccionario (Ajusta la ruta si es necesario)
import { getDictionary } from '../../utilities/dictionary'

export default async function Page({ searchParams }: { searchParams: { locale?: string } }) {
  const payload = await getPayload({ config: configPromise })

  // 1. Detectamos el idioma
  const currentLocale = searchParams.locale === 'en' ? 'en' : 'es'

  // 2. Cargamos las palabras correctas del diccionario
  const dict = getDictionary(currentLocale)

  // 3. Pedimos los datos a Payload
  const posts = await payload.find({
    collection: 'posts',
    locale: currentLocale,
    depth: 1,
  })

  return (
    <main className="container">
      <div className="posts-grid" style={{ marginTop: '40px' }}>
        {posts.docs.map((post: any) => (
          <article key={post.id} className="card">
            {/* Imagen de Portada */}
            {post.coverImage && (
              <div className="card-image">
                <Image
                  src={post.coverImage.url}
                  alt={post.coverImage.alt || post.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Contenido de la Tarjeta */}
            <div className="card-content">
              <h2>{post.title}</h2>
              <p>
                {post.content && post.content.length > 100
                  ? post.content.substring(0, 100) + '...'
                  : post.content}
              </p>

              {/* USAMOS EL DICCIONARIO PARA EL BOTÓN */}
              <Link href={`/posts/${post.slug}?locale=${currentLocale}`} className="btn-read">
                {dict.readMore} {/* <-- Aquí cambiamos el texto fijo */}
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Mensaje por si no hay posts */}
      {posts.docs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#546e7a' }}>
          <p>{dict.noPosts}</p> {/* <-- Aquí usamos el mensaje del diccionario */}
        </div>
      )}
    </main>
  )
}
```

### 7.3 Página de Artículo Individual (`[slug]/page.tsx`)

Ruta dinámica que muestra el detalle del post. Implementa botón de regreso inteligente (mantiene idioma).

> **Ruta:** `src/app/(frontend)/posts/[slug]/page.tsx`

```tsx
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
// Nota: Aquí subimos más niveles (../../../) porque estamos dentro de [slug]
import { getDictionary } from '../../../../utilities/dictionary'

export default async function Post({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { locale?: string }
}) {
  const { slug } = params

  // 1. Detectamos el idioma
  const currentLocale = searchParams.locale === 'en' ? 'en' : 'es'

  // 2. Cargamos el diccionario
  const dict = getDictionary(currentLocale)

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    locale: currentLocale,
  })

  if (!result.docs[0]) {
    notFound()
  }

  const post = result.docs[0]

  return (
    <main className="container" style={{ paddingTop: '40px' }}>
      {/* Botón Volver usando el diccionario */}
      <Link
        href={`/?locale=${currentLocale}`}
        style={{
          display: 'inline-block',
          marginBottom: '20px',
          color: 'var(--primary)',
          textDecoration: 'none',
          fontWeight: 'bold',
        }}
      >
        {dict.backHome} {/* <-- Aquí cambiamos el texto fijo */}
      </Link>

      <article className="card" style={{ padding: '40px', cursor: 'default' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '20px' }}>
          {post.title}
        </h1>

        {post.coverImage && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '400px',
              marginBottom: '30px',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <Image
              src={(post.coverImage as any).url}
              alt={(post.coverImage as any).alt || post.title}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        <div
          style={{
            fontSize: '1.1rem',
            lineHeight: '1.8',
            color: 'var(--text-main)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {post.content}
        </div>
      </article>
    </main>
  )
}
```

---

## Resumen

Implementación completa de un blog bilingüe utilizando:

- **Payload CMS 3.0** como sistema de gestión de contenidos headless
- **Next.js 15** con App Router para el frontend
- **SQLite** como base de datos local
- **Internacionalización (i18n)** completa para español e inglés
- **Componentes React** modulares y reutilizables
- **CSS Variables** para un sistema de diseño consistente

El proyecto está estructurado siguiendo las mejores prácticas de desarrollo moderno, con una clara separación de responsabilidades entre backend (colecciones y configuración) y frontend (componentes y páginas).
