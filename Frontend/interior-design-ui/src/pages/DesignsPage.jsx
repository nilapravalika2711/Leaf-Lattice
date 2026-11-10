import { useEffect, useState } from 'react'
import { designsApi, imageUrl, imagesApi, materialsApi } from '../api/client.js'
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

export default function DesignsPage() {
  const [designs, setDesigns] = useState([])
  const [images, setImages] = useState([])
  const [materials, setMaterials] = useState([])
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Living Room')
  const [price, setPrice] = useState('')
  const [imageIds, setImageIds] = useState([])
  const [materialIds, setMaterialIds] = useState([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  async function load() {
    setLoading(true)
    try { const [d, i, m] = await Promise.all([designsApi.list(), imagesApi.list(), materialsApi.list()]); setDesigns(d); setImages(i); setMaterials(m) }
    catch (e) { setNotice({ type: 'error', text: e.message }) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  function reset() { setEditing(null); setName(''); setDescription(''); setCategory('Living Room'); setPrice(''); setImageIds([]); setMaterialIds([]) }
  function toggle(id, selected, setSelected) { setSelected(old => old.includes(id) ? old.filter(value => value !== id) : [...old, id]) }
  function edit(item) {
    setEditing(item.id); setName(item.name); setDescription(item.description); setCategory(item.category); setPrice(String(item.totalPrice))
    setImageIds(item.images.map(x => x.id)); setMaterialIds(item.materials.map(x => x.id)); window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  async function submit(e) {
    e.preventDefault(); setNotice(null)
    if (!imageIds.length) { setNotice({ type: 'error', text: 'Select at least one image for the design.' }); return }
    if (!Number.isFinite(Number(price)) || Number(price) < 0) { setNotice({ type: 'error', text: 'Enter a valid total design price.' }); return }
    setBusy(true)
    const data = { name: name.trim(), description: description.trim(), category, totalPrice: Number(price), imageIds, materialIds }
    try { if (editing) await designsApi.update(editing, data); else await designsApi.create(data); setNotice({ type: 'success', text: editing ? 'Design updated.' : 'Design saved.' }); reset(); await load() }
    catch (err) { setNotice({ type: 'error', text: err.message }) } finally { setBusy(false) }
  }
  async function remove(item) { if (!window.confirm(`Delete the “${item.name}” design?`)) return; setNotice(null); try { await designsApi.remove(item.id); setNotice({ type: 'success', text: 'Design deleted.' }); await load() } catch (e) { setNotice({ type: 'error', text: e.message }) } }
  return <div className="page-content">
    <header className="page-heading"><div><p className="eyebrow">Curated concepts</p><h1>Designs</h1><p className="muted">Bring your images and materials together into complete design concepts.</p></div><span className="count-pill">{designs.length} {designs.length === 1 ? 'design' : 'designs'}</span></header>
    {notice && <div className={`notice ${notice.type}`}>{notice.text}<button onClick={() => setNotice(null)} aria-label="Dismiss">×</button></div>}
    <section className="panel design-form-panel"><div className="panel-heading"><div><h2>{editing ? 'Edit design' : 'Create a design'}</h2><p className="muted">Choose from your saved library and set the complete project price.</p></div>{editing && <button className="text-button" onClick={reset}>Cancel edit</button>}</div>
      <form onSubmit={submit} className="design-form">
        <div className="form-fields two-col"><label>Design name<input required minLength="2" maxLength="120" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Modern living room" /></label><label>Category<select value={category} onChange={e => setCategory(e.target.value)}>{['Living Room','Bedroom','Kitchen','Bathroom','Office','Dining Room','Outdoor','Other'].map(x => <option key={x}>{x}</option>)}</select></label><label className="span-two">Description<textarea rows="3" maxLength="3000" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the mood, layout, and key details…" /></label><label>Total design price (₹)<input required type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="150000" /><small>Set the complete project price; material prices are not added automatically.</small></label></div>
        <section className="selection-section"><div className="selection-heading"><div><h3>Design images <span className="required-mark">*</span></h3><p>Select one or more library images.</p></div><span>{imageIds.length} selected</span></div>{images.length ? <div className="select-image-grid">{images.map(img => <button type="button" className={`select-image ${imageIds.includes(img.id) ? 'selected' : ''}`} key={img.id} onClick={() => toggle(img.id, imageIds, setImageIds)}><img src={imageUrl(img.imagePath)} alt=""/><span className="select-check">{imageIds.includes(img.id) ? '✓' : '+'}</span><small>{img.name}</small></button>)}</div> : <p className="inline-empty">Upload images in the Images tab first.</p>}</section>
        {imageIds.length > 0 && <div className="selection-preview"><strong>Selected previews</strong><div>{images.filter(x => imageIds.includes(x.id)).map(x => <img key={x.id} src={imageUrl(x.imagePath)} alt={x.name} title={x.name} />)}</div></div>}
        <section className="selection-section"><div className="selection-heading"><div><h3>Materials</h3><p>Choose all finishes and furnishings for this concept.</p></div><span>{materialIds.length} selected</span></div>{materials.length ? <div className="material-select-list">{materials.map(item => <label className={`material-option ${materialIds.includes(item.id) ? 'selected' : ''}`} key={item.id}><input type="checkbox" checked={materialIds.includes(item.id)} onChange={() => toggle(item.id, materialIds, setMaterialIds)} />{item.imagePath ? <img src={imageUrl(item.imagePath)} alt=""/> : <span className="material-placeholder">◈</span>}<span className="material-option-copy"><strong>{item.name}</strong><small>{money(item.price)}</small></span></label>)}</div> : <p className="inline-empty">Add materials in the Materials tab first.</p>}</section>
        {materialIds.length > 0 && <div className="chosen-materials"><strong>Selected materials</strong><div>{materials.filter(x => materialIds.includes(x.id)).map(x => <button type="button" key={x.id} onClick={() => toggle(x.id, materialIds, setMaterialIds)} title="Remove material">{x.name}<span>×</span></button>)}</div></div>}
        <div className="design-submit"><span>{imageIds.length} images · {materialIds.length} materials</span><button className="button primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save design changes' : 'Save design'}</button></div>
      </form>
    </section>
    <div className="section-title"><h2>Saved designs</h2><span>{designs.length} concepts</span></div>
    {loading ? <div className="loading">Loading your designs…</div> : designs.length ? <div className="design-grid">{designs.map(item => <article className="design-card" key={item.id}><div className="design-gallery">{item.images.slice(0,3).map((img,index) => <img key={img.id} src={imageUrl(img.imagePath)} alt={img.name} className={`gallery-image gallery-${index + 1}`} loading="lazy" />)}{!item.images.length && <div className="gallery-empty">No image selected</div>}{item.images.length > 3 && <span className="gallery-count">+{item.images.length - 3}</span>}</div><div className="design-card-body"><div className="design-card-title"><div><span className="category-tag">{item.category}</span><h3>{item.name}</h3></div><strong>{money(item.totalPrice)}</strong></div><p className="design-description">{item.description || 'No description added.'}</p><div className="design-materials"><span>Materials</span><div>{item.materials.length ? item.materials.map(m => <span key={m.id}>{m.name}</span>) : <em>None selected</em>}</div></div><div className="card-actions"><button className="button subtle" onClick={() => edit(item)}>Edit design</button><button className="button danger-ghost" onClick={() => remove(item)}>Delete</button></div></div></article>)}</div> : <div className="empty-state"><span>⌂</span><h3>Your first concept starts here</h3><p>Select saved images and materials above to build a complete design card.</p></div>}
  </div>
}
