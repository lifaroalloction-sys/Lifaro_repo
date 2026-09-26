import React, { useState } from 'react'

function getDriveFileId(url) {
  if (!url) return null

  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]

  const queryMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (queryMatch) return queryMatch[1]

  return null
}

export default function PostGrid() {
  const [url, setUrl] = useState('https://drive.google.com/file/d/13m3Q0PCLJA6b6Q-Trc6XYuySZGiyTuq9/view?usp=sharing')
  const [imageSrc, setImageSrc] = useState('https://drive.google.com/thumbnail?id=13m3Q0PCLJA6b6Q-Trc6XYuySZGiyTuq9&sz=w2000')
  const [error, setError] = useState('')

  const loadMedia = () => {
    const id = getDriveFileId(url)
    if (!id) {
      setError('Invalid Google Drive file URL')
      return
    }

    setError('')
    setImageSrc(`https://drive.google.com/thumbnail?id=${id}&sz=w2000`)
  }

  const handleImageError = (e) => {
    const id = getDriveFileId(url)
    if (!id) {
      setError('Invalid Google Drive file URL')
      return
    }

    e.target.src = `https://drive.google.com/uc?export=view&id=${id}`
    e.target.onerror = () => {
      setError('Image could not be displayed. Make sure the file is publicly shared.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top left, #25204d, transparent 40%), radial-gradient(circle at bottom right, #32124d, transparent 40%), #080812',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: 1100 }}>
        <h1 style={{ textAlign: 'center', fontSize: 42, marginBottom: 10 }}>📸 Drive Media Viewer</h1>
        <div style={{ textAlign: 'center', color: '#aaa', marginBottom: 35 }}>Paste a Google Drive image or video link</div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 30 }}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Google Drive URL here..."
            style={{
              flex: 1,
              padding: '17px 20px',
              borderRadius: 14,
              border: '1px solid #444',
              background: 'rgba(255,255,255,0.06)',
              color: 'white',
              fontSize: 16,
              outline: 'none'
            }}
          />
          <button onClick={loadMedia} style={{ padding: '0 28px', border: 'none', borderRadius: 14, background: 'linear-gradient(135deg, #7b4dff, #bd45ff)', color: 'white', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>
            Load Media
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 30 }}>
          <button style={{ padding: '12px 20px', border: 'none', borderRadius: 14, background: 'linear-gradient(135deg, #7b4dff, #bd45ff)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
            🖼️ Image
          </button>
        </div>

        <div style={{ width: '100%', minHeight: 500, borderRadius: 22, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Google Drive Image"
              onError={handleImageError}
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: '80px 20px' }}>Paste a Google Drive URL and click Load Media</div>
          )}
        </div>

        {error && <div style={{ textAlign: 'center', color: '#ff6685', marginTop: 20 }}>{error}</div>}
      </div>
    </div>
  )
}
