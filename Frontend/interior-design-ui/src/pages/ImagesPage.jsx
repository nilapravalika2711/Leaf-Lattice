import { useEffect, useState } from 'react'
import { imagesApi, imageUrl } from '../api/client.js'

function FileInput({ file, onChange, currentUrl }) {
  return <div className="file-field">
    <label className="upload-drop">
      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onChange} />
      <span className="upload-icon">＋</span><strong>{file ? file.name : 'Choose an image'}</strong><small>PNG, JPG or WebP · up to 5 MB</small>
    </label>
    {(file || currentUrl) && <div className="file-preview"><img src={currentUrl} alt="Selected preview" /></div>}
  </div>
}

export default function ImagesPage() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  async function load() { setLoading(true); try { setItems(await imagesApi.list()) } catch (e) { setNotice({ type: 'error', text: e.message }) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  function reset() { setEditing(null); setName(''); setDescription(''); setFile(null); setPreview('') }
  function edit(item) { setEditing(item.id); setName(item.name); setDescription(item.description); setFile(null); setPreview(imageUrl(item.imagePath)); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  async function submit(e) {
    e.preventDefault(); setBusy(true); setNotice(null)
    if (file && file.size > 5 * 1024 * 1024) { setBusy(false); setNotice({ type: 'error', text: 'Image must be 5 MB or smaller.' }); return }
    const form = new FormData(); form.append('Name', name.trim()); form.append('Description', description.trim()); if (file) form.append('File', file)
    try { if (editing) await imagesApi.update(editing, form); else await imagesApi.create(form); setNotice({ type: 'success', text: editing ? 'Image details updated.' : 'Image added to your library.' }); reset(); await load() }
    catch (err) { setNotice({ type: 'error', text: err.message }) } finally { setBusy(false) }
  }
  async function remove(item) { if (!window.confirm(`Delete “${item.name}”?`)) return; setNotice(null); try { await imagesApi.remove(item.id); setNotice({ type: 'success', text: 'Image deleted.' }); await load() } catch (e) { setNotice({ type: 'error', text: e.message }) } }
  return <div className="page-content">
    <header className="page-heading"><div><p className="eyebrow">Your visual library</p><h1>Images</h1><p className="muted">Manage the photography and inspiration used across your designs.</p></div><span className="count-pill">{items.length} {items.length === 1 ? 'image' : 'images'}</span></header>
    {notice && <div className={`notice ${notice.type}`}>{notice.text}<button onClick={() => setNotice(null)} aria-label="Dismiss">×</button></div>}
    <section className="panel form-panel"><div className="panel-heading"><div><h2>{editing ? 'Edit image' : 'Add to image library'}</h2><p className="muted">Upload a new image or update its details.</p></div>{editing && <button className="text-button" onClick={reset}>Cancel edit</button>}</div>
      <form className="image-form" onSubmit={submit}>
        <FileInput file={file} onChange={e => { const chosen = e.target.files?.[0] || null; setFile(chosen); setPreview(chosen ? URL.createObjectURL(chosen) : preview) }} currentUrl={preview} />
        <div className="form-fields"><label>Image name<input required minLength="2" maxLength="120" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sunlit living room" /></label><label>Description<textarea rows="4" maxLength="2000" value={description} onChange={e => setDescription(e.target.value)} placeholder="A short note about this image" /></label><button className="button primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Upload image'}</button></div>
      </form>
    </section>
    <div className="section-title"><h2>Image library</h2><span>{items.length} items</span></div>
    {loading ? <div className="loading">Loading your images…</div> : items.length ? <div className="image-grid">{items.map(item => <article className="image-card" key={item.id}><div className="card-image"><img src={imageUrl(item.imagePath)} alt={item.name} loading="lazy" /></div><div className="card-body"><div><h3>{item.name}</h3><p>{item.description || 'No description added.'}</p></div><div className="card-actions"><button className="button subtle" onClick={() => edit(item)}>Edit</button><button className="button danger-ghost" onClick={() => remove(item)}>Delete</button></div></div></article>)}</div> : <div className="empty-state"><span>▧</span><h3>Your image library is ready</h3><p>Upload your first project image above. It will also be available for your designs.</p></div>}
  </div>
}

