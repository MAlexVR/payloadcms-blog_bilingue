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
