import { useState, useEffect } from 'react'
import { api } from './api'

const emptyForm = { product_name: '', description: '', price: '', quantity: '' }

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'))
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  async function load() {
    try {
      setProducts(await api.list())
    } catch (e) {
      setError(e.message)
      setLoggedIn(!!localStorage.getItem('token')) // false if token expired
    }
  }

  useEffect(() => {
    if (loggedIn) load()
  }, [loggedIn])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    try {
      const { token } = await api.login(email, password)
      localStorage.setItem('token', token)
      setLoggedIn(true)
    } catch (err) {
      setError(err.message)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setLoggedIn(false)
    setProducts([])
  }

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function cancel() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    try {
      if (editingId) await api.update(editingId, form)
      else await api.create(form)
      cancel()
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  function startEdit(p) {
    setEditingId(p.id)
    setForm({
      product_name: p.product_name,
      description: p.description || '',
      price: p.price,
      quantity: p.quantity,
    })
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    try {
      await api.remove(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      {error && <p style={{ color: '#b00020' }}>{error}</p>}

      {!loggedIn ? (
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <input type="email" placeholder="Email" value={email}
                 onChange={(e) => setEmail(e.target.value)} required /><br />
          <input type="password" placeholder="Password" value={password}
                 onChange={(e) => setPassword(e.target.value)} required /><br />
          <button>Login</button>
        </form>
      ) : (
        <section>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Products</h2>
            <button onClick={handleLogout}>Logout</button>
          </header>

          <form onSubmit={handleSave} style={{ display: 'grid', gap: '.5rem', marginBottom: '1rem' }}>
            <h3>{editingId ? 'Edit product' : 'Add product'}</h3>
            <input name="product_name" placeholder="Product name" maxLength={100}
                   value={form.product_name} onChange={change} required />
            <textarea name="description" placeholder="Description"
                      value={form.description} onChange={change} />
            <input name="price" type="number" step="0.01" min="0" placeholder="Price"
                   value={form.price} onChange={change} required />
            <input name="quantity" type="number" min="0" placeholder="Quantity"
                   value={form.quantity} onChange={change} required />
            <div>
              <button>{editingId ? 'Update' : 'Add'}</button>
              {editingId && <button type="button" onClick={cancel}>Cancel</button>}
            </div>
          </form>

          <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th>Name</th><th>Description</th><th>Price</th><th>Qty</th><th></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.product_name}</td>
                  <td>{p.description}</td>
                  <td>{p.price}</td>
                  <td>{p.quantity}</td>
                  <td>
                    <button onClick={() => startEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!products.length && <tr><td colSpan="5">No products yet.</td></tr>}
            </tbody>
          </table>
        </section>
      )}
    </main>
  )
}
