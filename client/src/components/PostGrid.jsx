import React, {useState} from 'react'

function PostTile({src, alt, onOpen}){
  return (
    <div className="post-tile" onClick={onOpen} role="button" tabIndex={0}>
      <img src={src} alt={alt} />
    </div>
  )
}

function PostModal({items, current, onClose}){
  const [index, setIndex] = useState(current)
  const wheelTime = React.useRef(0)
  React.useEffect(()=> setIndex(current), [current])
  React.useEffect(()=>{
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

export default function PostGrid(){
  const [items, setItems] = useState([])
  const [openIndex, setOpenIndex] = useState(null)
  const [showUpload, setShowUpload] = useState(false)

  const handleAdd = (newItems)=>{
    // prepend new items so newest appear first
    setItems((prev)=>[...newItems, ...prev])
  }

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

function UploadModal({onClose,onAdd}){
  const [url,setUrl] = useState('')
  const [date,setDate] = useState('')
  const [about,setAbout] = useState('')
  const [previewSrc,setPreviewSrc] = useState(null)
  const [previewType,setPreviewType] = useState(null)
  const [checking,setChecking] = useState(false)
  const [error,setError] = useState(null)

  const extractDriveFileId = (u)=>{
    const m = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if(m) return m[1]
    const q = new URLSearchParams((u.split('?')[1]||''))
    if(q.get('id')) return q.get('id')
    return null
  }

  const checkUrl = async ()=>{
    setError(null)
    setChecking(true)
    setPreviewSrc(null)
    try{
      // if it's a Google Drive file link, convert to direct view URL
      let fileId = null
      try{ fileId = extractDriveFileId(url) }catch(e){fileId=null}
      if(fileId){
        // allow configuring backend base URL via Vite env
        const API_BASE = import.meta.env.VITE_API_BASE || ''
        const proxy = `${API_BASE}/api/drive/media/${fileId}`
        // try image
        await new Promise((res)=>{
          if(fileId){
            const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
            const proxy = API_BASE ? `${API_BASE}/api/drive/media/${fileId}` : `/api/drive/media/${fileId}`

            // probe the proxy using fetch so we can inspect HTTP status and content-type
            try{
              const resp = await fetch(proxy, { method: 'GET' })
              if(resp.ok){
                const ct = (resp.headers.get('content-type')||'').toLowerCase()
                if(ct.startsWith('image/')){ setPreviewSrc(proxy); setPreviewType('image'); setChecking(false); return }
                if(ct.startsWith('video/')){ setPreviewSrc(proxy); setPreviewType('video'); setChecking(false); return }
                // unknown type -> create blob URL and inspect
                const blob = await resp.blob()
                const blobUrl = URL.createObjectURL(blob)
                if(blob.type.startsWith('image/')){ setPreviewSrc(blobUrl); setPreviewType('image'); setChecking(false); return }
                if(blob.type.startsWith('video/')){ setPreviewSrc(blobUrl); setPreviewType('video'); setChecking(false); return }
              } else if(resp.status === 404){
                // backend not serving this path — fall through to public fallback below
              } else if(resp.status === 403){
                setError('Backend returned 403 Forbidden. Check service account permissions or backend CORS settings.')
                setChecking(false)
                return
              } else {
                setError(`Backend returned ${resp.status} ${resp.statusText}`)
                setChecking(false)
                return
              }
            }catch(err){
              // network error / CORS / unreachable
              const runningOnGithubPages = window.location.host.includes('github.io')
              if(runningOnGithubPages && !API_BASE){
                setError('Backend unreachable. On GitHub Pages you must set VITE_API_BASE to your deployed backend URL to preview private Drive files.')
              } else {
                setError('Could not reach backend proxy. Ensure the backend is running and CORS allows your site origin.')
              }
              setChecking(false)
              return
            }

            // fallback to public Drive preview URL (works only for files shared publicly)
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
                setChecking(false)
                return
              }
            }catch(e){
              // ignore and fall through
            }
          }
      if(!previewSrc){ setError('Unable to fetch media from the provided URL. If the URL is a Drive folder, the backend must be used.'); }
    }catch(e){ setError('Error while checking URL') }
    setChecking(false)
  }

  const doPost = ()=>{
    if(!previewSrc){ setError('No media to post'); return }
    // persist post to server if available
    fetch('/api/posts', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ mediaUrl: previewSrc, date, about })
    }).then(r=>{
      if(r.ok) onAdd([previewSrc])
      else onAdd([previewSrc])
    }).catch(()=> onAdd([previewSrc]))
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="upload-modal" onClick={e=>e.stopPropagation()}>
        <h3>New Post</h3>
        <div className="upload-grid">
          <div className="upload-form">
            <label>Drive URL or media URL</label>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://drive.google.com/file/d/... or https://..." />
            <label>Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
            <label>About</label>
            <textarea value={about} onChange={e=>setAbout(e.target.value)} />
            <div style={{marginTop:8}}>
              <button className="btn primary" onClick={checkUrl} disabled={checking}>{checking? 'Checking...':'Check URL'}</button>
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
