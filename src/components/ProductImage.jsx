import React, { useState, useEffect } from 'react'

// Component that tries multiple image filenames based on product model or provided src.
// Renders the image inside a centered container and shows a small model label overlay
// to make clear which product it is.
export default function ProductImage({ src, model, alt = '', className = '' }) {
  const [currentSrc, setCurrentSrc] = useState(null)

  useEffect(() => {
    setCurrentSrc(null)
  }, [src, model])

  useEffect(() => {
    // Build candidates: prefer explicit src, then model-based filenames
    const candidates = []
    if (src) candidates.push(src)
    if (model) {
      const raw = String(model || '').trim()
      const base = raw.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\.]/g, '')
      if (raw && raw.includes('.')) candidates.push(`/images/${raw}`)
      if (base) {
        candidates.push(`/images/${base}.png`)
        candidates.push(`/images/${base}.jpg`)
        candidates.push(`/images/${base}.jpeg`)
        candidates.push(`/images/${base}.webp`)
        candidates.push(`/images/${base}.avif`)
        const lower = base.toLowerCase()
        if (lower !== base) {
          candidates.push(`/images/${lower}.png`)
          candidates.push(`/images/${lower}.jpg`)
          candidates.push(`/images/${lower}.jpeg`)
          candidates.push(`/images/${lower}.webp`)
          candidates.push(`/images/${lower}.avif`)
        }
      }
    }
    candidates.push('/images/placeholder.png')

    let mounted = true
    let idx = 0
    const tryNext = () => {
      if (!mounted) return
      if (idx >= candidates.length) return
      const testSrc = candidates[idx]
      const img = new Image()
      img.onload = () => { if (!mounted) return; setCurrentSrc(testSrc) }
      img.onerror = () => { idx += 1; if (idx < candidates.length) tryNext(); else setCurrentSrc(candidates[candidates.length - 1]) }
      img.src = testSrc
    }
    tryNext()
    return () => { mounted = false }
  }, [src, model])

  // Render a framed, centered image with an overlay label for the model
  return (
    <div className={`w-full h-full flex items-center justify-center bg-white ${className || ''}`}>
      {currentSrc ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img src={currentSrc} alt={alt || model || 'product'} className="max-h-full max-w-full object-contain" />
          {model ? (
            <div className="absolute left-2 bottom-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
              {String(model)}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="w-full h-full" />
      )}
    </div>
  )
}
