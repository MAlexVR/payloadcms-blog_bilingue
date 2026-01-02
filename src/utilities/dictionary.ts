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
