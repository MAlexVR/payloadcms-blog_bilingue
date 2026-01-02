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
