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
