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
