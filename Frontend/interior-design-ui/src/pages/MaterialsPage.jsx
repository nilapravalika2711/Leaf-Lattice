import { useEffect, useState } from 'react'
import { imageUrl, materialsApi } from '../api/client.js'

export default function MaterialsPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  async function load() { setLoading(true); try { setItems(await materialsApi.list()) } catch (e) { setNotice({ type: 'error', text: e.message }) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  function reset() { setEditing(null); setName(''); setDescription(''); setPrice(''); setFile(null); setPreview('') }
  function edit(item) { setEditing(item.id); setName(item.name); setDescription(item.description); setPrice(String(item.price)); setFile(null); setPreview(imageUrl(item.imagePath)); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  async function submit(e) {
    e.preventDefault(); setBusy(true); setNotice(null)
    if (!Number.isFinite(Number(price)) || Number(price) < 0) { setBusy(false); setNotice({ type: 'error', text: 'Enter a valid non-negative price.' }); return }
    if (file && file.size > 5 * 1024 * 1024) { setBusy(false); setNotice({ type: 'error', text: 'Image must be 5 MB or smaller.' }); return }
    const form = new FormData(); form.append('Name', name.trim()); form.append('Description', description.trim()); form.append('Price', price); if (file) form.append('File', file)
    try { if (editing) await materialsApi.update(editing, form); else await materialsApi.create(form); setNotice({ type: 'success', text: editing ? 'Material updated.' : 'Material added.' }); reset(); await load() }
    catch (err) { setNotice({ type: 'error', text: err.message }) } finally { setBusy(false) }
  }
  async function remove(item) { if (!window.confirm(`Delete “${item.name}”?`)) return; setNotice(null); try { await materialsApi.remove(item.id); setNotice({ type: 'success', text: 'Material deleted.' }); await load() } catch (e) { setNotice({ type: 'error', text: e.message }) } }
  return <div className="page-content">
    <header className="page-heading"><div><p className="eyebrow">Finishes & furnishings</p><h1>Materials</h1><p className="muted">Keep your material catalogue and pricing up to date.</p></div><span className="count-pill">{items.length} {items.length === 1 ? 'material' : 'materials'}</span></header>
    {notice && <div className={`notice ${notice.type}`}>{notice.text}<button onClick={() => setNotice(null)} aria-label="Dismiss">×</button></div>}
    <section className="panel form-panel"><div className="panel-heading"><div><h2>{editing ? 'Edit material' : 'Add a material'}</h2><p className="muted">Set the catalogue details and unit price.</p></div>{editing && <button className="text-button" onClick={reset}>Cancel edit</button>}</div>
      <form className="material-form" onSubmit={submit}>
        <label className="upload-drop material-upload"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { const chosen = e.target.files?.[0] || null; setFile(chosen); setPreview(chosen ? URL.createObjectURL(chosen) : preview) }} /><span className="upload-icon">＋</span><strong>{file ? file.name : 'Add a material photo'}</strong><small>PNG, JPG or WebP · up to 5 MB</small>{preview && <img className="small-preview" src={preview} alt="Material preview" />}</label>
        <div className="form-fields two-col"><label>Material name<input required minLength="2" maxLength="120" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Natural oak flooring" /></label><label>Price (₹)<input type="number" min="0" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" /></label><label className="span-two">Description<textarea rows="3" maxLength="2000" value={description} onChange={e => setDescription(e.target.value)} placeholder="Color, finish, supplier notes…" /></label><button className="button primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add material'}</button></div>
      </form>
    </section>
    <div className="section-title"><h2>Material catalogue</h2><span>{items.length} items</span></div>
    {loading ? <div className="loading">Loading materials…</div> : items.length ? <div className="material-grid">{items.map(item => <article className="material-card" key={item.id}><div className="material-photo">{item.imagePath ? <img src={imageUrl(item.imagePath)} alt={item.name} loading="lazy" /> : <span>◈</span>}</div><div className="material-info"><div className="material-heading"><h3>{item.name}</h3><strong>{new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(item.price)}</strong></div><p>{item.description || 'No description added.'}</p><div className="card-actions"><button className="button subtle" onClick={() => edit(item)}>Edit</button><button className="button danger-ghost" onClick={() => remove(item)}>Delete</button></div></div></article>)}</div> : <div className="empty-state"><span>◈</span><h3>No materials yet</h3><p>Add the finishes and furnishings you use. They will be selectable when you create a design.</p></div>}
  </div>
}
