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
