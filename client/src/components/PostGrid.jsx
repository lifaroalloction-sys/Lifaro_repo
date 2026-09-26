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
        const direct = `https://drive.google.com/uc?export=view&id=${fileId}`
        // try as image
        await new Promise((res,rej)=>{
          const img = new Image()
          img.onload = ()=>{ setPreviewSrc(direct); setPreviewType('image'); res() }
          img.onerror = ()=>{ res() }
          img.src = direct
        })
        if(previewSrc) { setChecking(false); return }
        // try as video
        const videoTest = document.createElement('video')
        await new Promise((res)=>{
          let done=false
          const to= setTimeout(()=>{ if(!done){ done=true; res() } },3000)
          videoTest.onloadedmetadata = ()=>{ if(!done){ done=true; clearTimeout(to); setPreviewSrc(direct); setPreviewType('video'); res() } }
          videoTest.onerror = ()=>{ if(!done){ done=true; clearTimeout(to); res() } }
          videoTest.src = direct
        })
        if(previewSrc){ setChecking(false); return }
      }

      // fallback: try loading the URL directly as image
      await new Promise((res)=>{
        const img = new Image()
        img.onload = ()=>{ setPreviewSrc(url); setPreviewType('image'); res() }
        img.onerror = ()=>{ res() }
        img.src = url
      })
      if(previewSrc){ setChecking(false); return }

      // try video tag directly
      await new Promise((res)=>{
        const v = document.createElement('video')
        let done=false
        const to= setTimeout(()=>{ if(!done){ done=true; res() } },3000)
        v.onloadedmetadata = ()=>{ if(!done){ done=true; clearTimeout(to); setPreviewSrc(url); setPreviewType('video'); res() } }
        v.onerror = ()=>{ if(!done){ done=true; clearTimeout(to); res() } }
        v.src = url
      })

      if(!previewSrc){ setError('Unable to fetch media from the provided URL. If the URL is a Drive folder, the backend must be used.'); }
    }catch(e){ setError('Error while checking URL') }
    setChecking(false)
  }

  const doPost = ()=>{
    if(!previewSrc){ setError('No media to post'); return }
    onAdd([previewSrc])
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
