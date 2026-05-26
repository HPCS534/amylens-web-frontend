import './WireframesGallery.css'

// Import all wireframe images generated from the SDD (use eager glob for Vite compatibility)
const modules = import.meta.glob('/src/assets/wireframes/*.{png,jpg,jpeg}', { eager: true })
const images = Object.keys(modules)
  .sort()
  .map((p) => ({ path: p, src: modules[p].default || modules[p] }))

export default function WireframesGallery() {
  return (
    <section className="wireframes-gallery">
      <h2>SDD Wireframes</h2>
      <p className="note">Auto-extracted from `Software Design Description.pdf`</p>
      <div className="grid">
        {images.map((img) => (
          <figure key={img.path} className="wireframe-item">
            <img src={img.src} alt={img.path} />
            <figcaption>{img.path.split('/').pop()}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
