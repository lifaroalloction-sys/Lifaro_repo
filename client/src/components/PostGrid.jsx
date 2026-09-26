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

function PostModal({ items, current, onClose, mobileReel=false, reelRef=null }){
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
    // autoplay/pause via IntersectionObserver and attach click handlers
    useEffect(() => {
      const viewport = reelRef && reelRef.current ? reelRef.current.querySelector('.reel-viewport') : document.querySelector('.reel-viewport')
      if (!viewport) return
      const videos = () => Array.from(viewport.querySelectorAll('video.reel-video'))

      const onVideoClick = (ev) => {
        const v = ev.currentTarget
        if (v.muted) {
          v.muted = false
          v.controls = true
          v.play().catch(() => {})
        } else {
          v.muted = true
          v.controls = false
        }
      }

      const onPlay = (e) => e.currentTarget.classList.add('is-playing')
      const onPause = (e) => e.currentTarget.classList.remove('is-playing')

      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const el = entry.target
          if (el.tagName.toLowerCase() !== 'video') return
          if (entry.intersectionRatio >= 0.6) {
            // play muted so autoplay is allowed
            el.muted = true
            el.controls = false
            el.play().catch(() => {})
          } else {
            el.pause()
          }
        })
      }, { threshold: [0.6] })

      videos().forEach(v => {
        // ensure initial state
        v.muted = true
        v.controls = false
        v.addEventListener('click', onVideoClick)
        v.addEventListener('play', onPlay)
        v.addEventListener('pause', onPause)
        obs.observe(v)
      })

      return () => {
        videos().forEach(v => {
          v.removeEventListener('click', onVideoClick)
          v.removeEventListener('play', onPlay)
          v.removeEventListener('pause', onPause)
        })
        obs.disconnect()
      }
    }, [items, reelRef])

    // handle wheel and touch to change index
    useEffect(() => {
      const viewport = reelRef && reelRef.current ? reelRef.current.querySelector('.reel-viewport') : document.querySelector('.reel-viewport')
      if (!viewport) return

      let touchStartY = 0
      let touchEndY = 0

      const onTouchStart = (e) => { touchStartY = e.touches[0].clientY }
      const onTouchEnd = (e) => {
        touchEndY = e.changedTouches[0].clientY
        const dy = touchStartY - touchEndY
        if (Math.abs(dy) < 40) return
        if (dy > 0) setIndex(i => Math.min(items.length - 1, i + 1))
        else setIndex(i => Math.max(0, i - 1))
      }

      const onWheelLocal = (e) => {
        const now = Date.now()
        if (now - wheelTime.current < 300) return
        if (e.deltaY > 20) { setIndex(i => Math.min(items.length - 1, i + 1)); wheelTime.current = now }
        else if (e.deltaY < -20) { setIndex(i => Math.max(0, i - 1)); wheelTime.current = now }
      }

      viewport.addEventListener('touchstart', onTouchStart, { passive: true })
      viewport.addEventListener('touchend', onTouchEnd, { passive: true })
      viewport.addEventListener('wheel', onWheelLocal, { passive: true })

      return () => {
        viewport.removeEventListener('touchstart', onTouchStart)
        viewport.removeEventListener('touchend', onTouchEnd)
        viewport.removeEventListener('wheel', onWheelLocal)
      }
    }, [items, reelRef])

    // scroll active item into view when index changes
    useEffect(() => {
      const viewport = reelRef && reelRef.current ? reelRef.current.querySelector('.reel-viewport') : document.querySelector('.reel-viewport')
      if (!viewport) return
      const el = viewport.querySelectorAll('.reel-item')[index]
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, [index, reelRef])

    // play poster inline by replacing poster with a video element
    const playInline = (clickIdx) => {
      const viewport = reelRef && reelRef.current ? reelRef.current.querySelector('.reel-viewport') : document.querySelector('.reel-viewport')
      if (!viewport) return
      const itemEl = viewport.querySelectorAll('.reel-item')[clickIdx]
      if (!itemEl) return
      const posterEl = itemEl.querySelector('.reel-poster')
      if (!posterEl) return
      if (!posterEl.querySelector('.reel-play-error')) {
        const hint = document.createElement('div')
        hint.className = 'reel-play-error'
        hint.textContent = 'Playback not supported in-app on mobile.'
        posterEl.appendChild(hint)
        setTimeout(() => { if (hint && hint.parentNode) hint.parentNode.removeChild(hint) }, 2200)
      }
    }

    return (
      <div className="reel-modal" onClick={onClose}>
        <div className="reel-inner" onClick={e => e.stopPropagation()} ref={reelRef}>
          <button className="reel-close" onClick={onClose}>&lt;</button>
          <div className="reel-viewport">
            {items.map((it, idx) => (
              <div key={idx} className={`reel-item ${idx === index ? 'active' : ''}`}>
                  {it.type === 'video' ? (
                    // Prefer HTML5 video only when we have a direct file URL that is likely CORS-friendly.
                    // Google Drive `uc?export=download` is typically blocked by CORS, so fall back to the preview iframe.
                    (it.file && !it.file.includes('drive.google.com/uc')) ? (
                      <video
                        className="reel-video"
                        src={it.file}
                        poster={it.thumbnail}
                        loop
                        playsInline
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <div className="reel-iframe-wrap">
                          <div className="reel-poster" onClick={() => playInline(idx)} role="button" tabIndex={0}>
                                <img src={it.thumbnail} alt={it.about || 'video poster'} className="reel-image" />
                                <button className="reel-play-btn">▶</button>
                              </div>
                        </div>
                    )
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
              src={item.src}
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
  const reelRef = useRef(null)

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

  const openAt = (i) => {
    const mobile = typeof window !== 'undefined' && window.innerWidth <= 760
    setIsMobileReel(mobile)
    setOpenIndex(i)
    // allow scrolling to the selected index after modal opens
    setTimeout(() => {
      if (mobile && reelRef.current) {
        const el = reelRef.current.querySelectorAll('.reel-item')[i]
        if (el) el.scrollIntoView({ behavior: 'auto' })
      }
    }, 60)
  }

  return (
    <>
      <section className="post-grid">
        {items.length === 0 && <div style={{ gridColumn: '1/-1', color: '#666' }}>No posts yet.</div>}
        {items.map((item, i) => (
          <PostTile key={i} item={item} onOpen={() => openAt(i)} />
        ))}
      </section>

      {openIndex !== null && (
        <PostModal
          items={items}
          current={openIndex}
          onClose={() => setOpenIndex(null)}
          mobileReel={isMobileReel}
          reelRef={reelRef}
        />
      )}
    </>
  )
}
