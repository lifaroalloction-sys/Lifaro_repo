import React, { useState, useEffect, useRef } from 'react'

function PostTile({ src, alt, onOpen }){
  return (
    <div className="post-tile" onClick={onOpen} role="button" tabIndex={0}>
      <img src={src} alt={alt} />
    </div>
  )
}

function PostModal({ items, current, onClose }){
  const [index, setIndex] = useState(current)
  const wheelTime = useRef(0)
  useEffect(() => setIndex(current), [current])
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose()
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') setIndex(i => (i + 1) % items.length)
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') setIndex(i => (i - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items.length, onClose])

  if (index == null) return null
  const next = () => setIndex((i) => (i + 1) % items.length)
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length)

  const onWheel = (e) => {
    const now = Date.now()
    if (now - wheelTime.current < 500) return
    if (e.deltaY > 20) { next(); wheelTime.current = now }
    else if (e.deltaY < -20) { prev(); wheelTime.current = now }
  }

  return (
    <div className="modal" onClick={onClose} onWheel={onWheel}>
      <div className="modal-inner" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <button className="modal-nav left" onClick={prev}>‹</button>
        <div className="modal-media">
          <img src={items[index]} alt={`post-${index}`} />
        </div>
        <button className="modal-nav right" onClick={next}>›</button>
      </div>
    </div>
  )
}

function toImageSrc(url) {
  if (!url) return ''
  const driveIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveIdMatch) return `https://drive.google.com/thumbnail?id=${driveIdMatch[1]}&sz=w1200`
  return url
}

export default function PostGrid() {
  const [items, setItems] = useState([])
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/'
        const res = await fetch(`${baseUrl}posts.xml`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to fetch posts.xml: ${res.status}`)

        const xml = await res.text()
        const doc = new DOMParser().parseFromString(xml, 'application/xml')
        const nodes = [...doc.querySelectorAll('post')]

        const posts = nodes
          .map((postNode) => {
            const url = postNode.querySelector('url')?.textContent?.trim() || ''
            const date = postNode.querySelector('date')?.textContent?.trim() || ''
            const about =
              postNode.querySelector('about')?.textContent?.trim() ||
              postNode.querySelector('summary')?.textContent?.trim() ||
              ''
            if (!url) return null
            return { url, date, about }
          })
          .filter(Boolean)

        setItems(posts.map((post) => toImageSrc(post.url)))
      } catch (err) {
        setItems([])
      }
    }

    loadPosts()
  }, [])

  return (
    <>
      <section className="post-grid">
        {items.length === 0 && <div style={{ gridColumn: '1/-1', color: '#666' }}>No posts yet.</div>}
        {items.map((src, i) => (
          <PostTile key={i} src={src} alt={`post-${i}`} onOpen={() => setOpenIndex(i)} />
        ))}
      </section>

      {openIndex !== null && <PostModal items={items} current={openIndex} onClose={() => setOpenIndex(null)} />}
    </>
  )
}
