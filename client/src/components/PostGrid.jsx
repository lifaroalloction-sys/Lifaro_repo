import React from 'react'

function PostTile({src, alt}){
  return (
    <div className="post-tile">
      <img src={src} alt={alt} />
    </div>
  )
}

export default function PostGrid(){
  const sample = [
    '/images/p1.jpg','/images/p2.jpg','/images/p3.jpg',
    '/images/p4.jpg','/images/p5.jpg','/images/p6.jpg'
  ]
  return (
    <section className="post-grid">
      {sample.map((s,i)=> <PostTile key={i} src={s} alt={`post-${i}`} />)}
    </section>
  )
}
