import React, { useState, useEffect, useRef } from 'react'

function PostTile({ item, onOpen }) {
  const src = item.type === 'video' ? item.thumbnail : item.src

  return (
    <div className="post-tile" onClick={onOpen} role="button" tabIndex={0}>
      {item.type === 'video' ? (
        <div className="video-thumb-wrap">
          <img src={src} alt={item.about || 'post'} />
          <span className="play-badge">▶</span>
        </div>
      ) : (
        <img src={src} alt={item.about || 'post'} />
      )}
    </div>
  )
}

function PostModal({ items, current, onClose, mobileReel=false }){
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

  const item = items[index]
  if (!item) return null

  const next = () => setIndex((i) => (i + 1) % items.length)
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length)

  const onWheel = (e) => {
    const now = Date.now()
    if (now - wheelTime.current < 500) return
    if (e.deltaY > 20) { next(); wheelTime.current = now }
    else if (e.deltaY < -20) { prev(); wheelTime.current = now }
  }

  if (mobileReel) {
    return (
      <div className="reel-modal" onClick={onClose}>
        <div className="reel-inner" onClick={e => e.stopPropagation()}>
          <button className="reel-close" onClick={onClose}>&lt;</button>
          <div className="reel-viewport">
            {items.map((it, idx) => (
              <div key={idx} className={`reel-item ${idx === index ? 'active' : ''}`}>
                {it.type === 'video' ? (
                  <video
                    className="reel-video"
                    src={it.file || it.src}
                    poster={it.thumbnail}
                    loop
                    playsInline
                    controls
                    preload="metadata"
                  />
                ) : (
                  <img src={it.src} alt={it.about || 'post'} className="reel-image" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal" onClick={onClose} onWheel={onWheel}>
      <div className="modal-inner" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <button className="modal-nav left" onClick={prev}>‹</button>
        <div className="modal-media">
          {item.type === 'video' ? (
            <iframe
              src={item.embed}
              title={item.about || 'Video post'}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="video-frame"
            />
          ) : (
            <img src={item.src} alt={item.about || 'post'} className="modal-image" />
          )}
        </div>
        <button className="modal-nav right" onClick={next}>›</button>
      </div>
    </div>
  )
}

function getDriveFileId(url) {
  if (!url) return ''
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]
  const queryMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (queryMatch) return queryMatch[1]
  return ''
}

function toImageSrc(url) {
  if (!url) return ''
  const driveId = getDriveFileId(url)
  if (driveId) return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`
  return url
}

function toVideoEmbedUrl(url) {
  if (!url) return ''
  const driveId = getDriveFileId(url)
  if (driveId) return `https://drive.google.com/file/d/${driveId}/preview`
  return url
}

function toVideoFileUrl(url) {
  if (!url) return ''
  const driveId = getDriveFileId(url)
  if (driveId) return `https://drive.google.com/uc?export=download&id=${driveId}`
  return url
}

export default function PostGrid() {
  const [items, setItems] = useState([])
  const [openIndex, setOpenIndex] = useState(null)
  const [isMobileReel, setIsMobileReel] = useState(false)

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
            const type = (postNode.querySelector('type')?.textContent?.trim() || '').toLowerCase()
            const about =
              postNode.querySelector('about')?.textContent?.trim() ||
              postNode.querySelector('summary')?.textContent?.trim() ||
              ''
            if (!url) return null
            const mediaType = type === 'video' ? 'video' : 'image'
            const thumbnail = toImageSrc(url)
            if (mediaType === 'video') {
              return {
                url,
                src: toVideoEmbedUrl(url),
                file: toVideoFileUrl(url),
                thumbnail,
                type: 'video',
                date,
                about,
              }
            }
            return {
              url,
              src: toImageSrc(url),
              thumbnail,
              type: 'image',
              date,
              about,
            }
          })
          .filter(Boolean)

        setItems(posts)
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
        {items.map((item, i) => (
          <PostTile key={i} item={item} onOpen={() => setOpenIndex(i)} />
        ))}
      </section>

      {openIndex !== null && (
        <PostModal
          items={items}
          current={openIndex}
          onClose={() => setOpenIndex(null)}
          mobileReel={isMobileReel}
        />
      )}
    </>
  )
}
