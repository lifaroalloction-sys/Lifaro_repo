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
  useEffect(()=> setIndex(current), [current])
  useEffect(()=>{
    const onKey = (e)=>{
      if(e.key === 'Escape') return onClose()
      if(e.key === 'ArrowDown' || e.key === 'ArrowRight') setIndex(i=> (i+1) % items.length)
      if(e.key === 'ArrowUp' || e.key === 'ArrowLeft') setIndex(i=> (i-1+items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [items.length, onClose])

  if(index == null) return null
  const next = ()=> setIndex((i)=> (i+1) % items.length)
  const prev = ()=> setIndex((i)=> (i-1+items.length) % items.length)

  const onWheel = (e)=>{
    const now = Date.now()
    if(now - wheelTime.current < 500) return
    if(e.deltaY > 20){ next(); wheelTime.current = now }
    else if(e.deltaY < -20){ prev(); wheelTime.current = now }
  }

  return (
    <div className="modal" onClick={onClose} onWheel={onWheel}>
      <div className="modal-inner" onClick={e=>e.stopPropagation()}>
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

export default function PostGrid({ initialPosts=[] }){
  const [items, setItems] = useState(initialPosts)
  const [openIndex, setOpenIndex] = useState(null)
  const [showUpload, setShowUpload] = useState(false)

  const handleAdd = (newItems)=> setItems(prev=> [...newItems, ...prev])

  return (
    <>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:16}}>
        <h3>POSTS</h3>
        <button className="btn primary" onClick={()=>setShowUpload(true)}>Upload Post</button>
      </div>

      <section className="post-grid">
        {items.length===0 && <div style={{gridColumn:'1/-1',color:'#666'}}>No posts yet — click "Upload Post" to add.</div>}
        {items.map((s,i)=> <PostTile key={i} src={s} alt={`post-${i}`} onOpen={()=>setOpenIndex(i)} />)}
      </section>

      {openIndex!==null && <PostModal items={items} current={openIndex} onClose={()=>setOpenIndex(null)} />}
      {showUpload && <UploadModal onClose={()=>setShowUpload(false)} onAdd={(newItems)=>{handleAdd(newItems); setShowUpload(false)}} />}
    </>
  )
}

function UploadModal({ onClose, onAdd }){
  const [url, setUrl] = useState('')
  const [date, setDate] = useState('')
  const [about, setAbout] = useState('')
  const [pickerLoaded, setPickerLoaded] = useState(false)
  const PICKER_CLIENT_ID = import.meta.env.VITE_PICKER_CLIENT_ID || ''
  const PICKER_APP_ID = import.meta.env.VITE_PICKER_APP_ID || ''
  const PICKER_ORIGIN = import.meta.env.VITE_PICKER_ORIGIN || window.location.origin
  const PICKER_PROMPT = import.meta.env.VITE_PICKER_PROMPT || 'consent'
  const [previewSrc, setPreviewSrc] = useState(null)
  const [previewType, setPreviewType] = useState(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(null)

  useEffect(()=>{
    if(window.customElements && window.customElements.get('drive-picker')){ setPickerLoaded(true); return }
    if(window._drivePickerLoading) return
    window._drivePickerLoading = true
    const s = document.createElement('script')
    s.src = 'https://unpkg.com/@googleworkspace/drive-picker-element@latest/dist/index.iife.min.js'
    s.async = true
    s.onload = ()=>{ setPickerLoaded(true); window._drivePickerLoading = false }
    s.onerror = ()=>{ window._drivePickerLoading = false }
    document.head.appendChild(s)
  },[])

  const extractDriveFileId = (u)=>{
    if(!u) return null
    const m = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if(m) return m[1]
    try{ const q = new URLSearchParams((u.split('?')[1]||'')); return q.get('id') }catch(e){ return null }
  }

  const openPicker = ()=>{
    if(!pickerLoaded) return
    const picker = document.createElement('drive-picker')
    if(PICKER_CLIENT_ID) picker.setAttribute('client-id', PICKER_CLIENT_ID)
    if(PICKER_APP_ID) picker.setAttribute('app-id', PICKER_APP_ID)
    if(PICKER_ORIGIN) picker.setAttribute('origin', PICKER_ORIGIN)
    if(PICKER_PROMPT) picker.setAttribute('prompt', PICKER_PROMPT)
    const view = document.createElement('drive-picker-docs-view')
    view.setAttribute('mime-types', 'image/jpeg,image/png,video/mp4,video/quicktime')
    picker.appendChild(view)
    picker.addEventListener('picker-picked', (e)=>{
      const docs = e.detail?.docs || []
      if(docs.length>0){
        const d = docs[0]
        const fileUrl = d.url || `https://drive.google.com/file/d/${d.id}/view?usp=sharing`
        setUrl(fileUrl)
        // trigger preview automatically
        setTimeout(()=> checkUrl(fileUrl), 50)
      }
      picker.remove()
    })
    picker.addEventListener('picker-canceled', ()=> picker.remove())
    picker.addEventListener('picker-error', (ev)=>{ console.error('Picker error', ev); picker.remove() })
    document.body.appendChild(picker)
  }

  async function checkUrl(overrideUrl){
    const u = overrideUrl || url
    setError(null)
    setChecking(true)
    setPreviewSrc(null)
    try{
      const fileId = extractDriveFileId(u)
      if(fileId){
        const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
        const proxy = API_BASE ? `${API_BASE}/api/drive/media/${fileId}` : `/api/drive/media/${fileId}`
        try{
          const resp = await fetch(proxy, { method: 'GET' })
          if(resp.ok){
            const ct = (resp.headers.get('content-type')||'').toLowerCase()
            if(ct.startsWith('image/')){ setPreviewSrc(proxy); setPreviewType('image'); setChecking(false); return }
            if(ct.startsWith('video/')){ setPreviewSrc(proxy); setPreviewType('video'); setChecking(false); return }
            const blob = await resp.blob(); const blobUrl = URL.createObjectURL(blob)
            if(blob.type.startsWith('image/')){ setPreviewSrc(blobUrl); setPreviewType('image'); setChecking(false); return }
            if(blob.type.startsWith('video/')){ setPreviewSrc(blobUrl); setPreviewType('video'); setChecking(false); return }
          } else if(resp.status === 403){
            setError('Backend returned 403 Forbidden. Check service account permissions or backend CORS settings.')
            setChecking(false); return
          }
          // fallthrough to public URL
        }catch(err){
          const runningOnGithubPages = window.location.host.includes('github.io')
          if(runningOnGithubPages && !API_BASE){
            setError('Backend unreachable. On GitHub Pages set VITE_API_BASE to your backend URL to preview private Drive files.')
          } else {
            setError('Could not reach backend proxy. Ensure the backend is running and CORS allows your site origin.')
          }
          setChecking(false); return
        }

        // fallback to public Drive view
        const publicUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
        try{
          const r2 = await fetch(publicUrl, { method: 'GET' })
          if(r2.ok){
            const ct2 = (r2.headers.get('content-type')||'').toLowerCase()
            if(ct2.startsWith('image/')){ setPreviewSrc(publicUrl); setPreviewType('image'); setChecking(false); return }
            if(ct2.startsWith('video/')){ setPreviewSrc(publicUrl); setPreviewType('video'); setChecking(false); return }
            const blob2 = await r2.blob(); const burl2 = URL.createObjectURL(blob2)
            if(blob2.type.startsWith('image/')){ setPreviewSrc(burl2); setPreviewType('image'); setChecking(false); return }
            if(blob2.type.startsWith('video/')){ setPreviewSrc(burl2); setPreviewType('video'); setChecking(false); return }
          } else if(r2.status === 403){
            setError('Drive returned 403: file is not publicly shared. Run or deploy the backend and set VITE_API_BASE to preview private files.')
            setChecking(false); return
          }
          }catch(e){ /* ignore */ }

        // If public URL failed (403) and we have a Google API key, try Drive REST API as a fallback
        const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''
        if(API_KEY){
          try{
            const driveApi = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`
            const r3 = await fetch(driveApi, { method: 'GET' })
            if(r3.ok){
              const ct3 = (r3.headers.get('content-type')||'').toLowerCase()
              const blob3 = await r3.blob()
              const url3 = URL.createObjectURL(blob3)
              if(ct3.startsWith('image/')){ setPreviewSrc(url3); setPreviewType('image'); setChecking(false); return }
              if(ct3.startsWith('video/')){ setPreviewSrc(url3); setPreviewType('video'); setChecking(false); return }
            } else if(r3.status === 403){
              setError('Drive API returned 403. The file may not be publicly shared or API key is restricted.')
              setChecking(false); return
            }
          }catch(err){
            // ignore and fall through
          }
        }
      } else {
        // non-Drive URL - try as direct media URL
        try{
          const resp = await fetch(u, { method: 'GET' })
          if(resp.ok){
            const ct = (resp.headers.get('content-type')||'').toLowerCase()
            if(ct.startsWith('image/')){ setPreviewSrc(u); setPreviewType('image'); setChecking(false); return }
            if(ct.startsWith('video/')){ setPreviewSrc(u); setPreviewType('video'); setChecking(false); return }
          }
        }catch(e){}
      }

      setError('Unable to fetch media from the provided URL. If the URL is a Drive folder or private file, run the backend and set VITE_API_BASE.')
    }catch(e){ setError('Error while checking URL') }
    setChecking(false)
  }

  const doPost = ()=>{
    if(!previewSrc){ setError('No media to post'); return }
    const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
    const postUrl = API_BASE ? `${API_BASE}/api/posts` : '/api/posts'
    fetch(postUrl, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ mediaUrl: previewSrc, date, about })
    }).then(r=> onAdd([previewSrc])).catch(()=> onAdd([previewSrc]))
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="upload-modal" onClick={e=>e.stopPropagation()}>
        <h3>New Post</h3>
        <div className="upload-grid">
          <div className="upload-form">
            <label>Drive URL or media URL</label>
            <input id="drive-url-input" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://drive.google.com/file/d/... or https://..." />
            <label>Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
            <label>About</label>
            <textarea value={about} onChange={e=>setAbout(e.target.value)} />
            <div style={{marginTop:8, display:'flex', gap:8}}>
              <button className="btn primary" onClick={()=>checkUrl()} disabled={checking}>{checking? 'Checking...':'Check URL'}</button>
              <button className="btn" onClick={openPicker} disabled={!pickerLoaded || !PICKER_CLIENT_ID}>{!PICKER_CLIENT_ID? 'Picker (needs CLIENT_ID)': 'Open Picker'}</button>
              <button className="btn" onClick={doPost} style={{marginLeft:8}}>Post</button>
            </div>
            {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
          </div>
          <div className="upload-preview">
            {previewSrc ? (
              previewType==='image' ? <img src={previewSrc} alt="preview" style={{maxWidth:'100%',maxHeight:400}} /> : <video src={previewSrc} controls style={{maxWidth:'100%',maxHeight:400}} />
            ) : (
              <div style={{color:'#666'}}>Paste URL and click "Check URL" to preview media here.</div>
            )}
          </div>
        </div>
        <button className="modal-close" onClick={onClose}>✕</button>
      </div>
    </div>
  )
}
