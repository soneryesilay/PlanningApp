'use client'

import Footer from './footer'
import { useLoading } from './page-transition'

export default function ConditionalFooter() {
  const isLoading = useLoading()
  
  // Render the footer only if loading is complete
  if (isLoading === true) {
    console.log('Footer gizleniyor: loading = true')
    return null
  }
  
  console.log('Footer gösteriliyor: loading = false')
  // Render the footer once loading is complete
  return <Footer />
}
