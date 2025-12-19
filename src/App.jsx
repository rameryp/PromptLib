import { useState, useEffect } from 'react'
import { db, auth, logout } from './firebase-config'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore'
import { Edit2, Trash2, BarChart2, List } from 'lucide-react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Login from './Login'
import Statistics from './Statistics'
import './App.css'

function NavLink({ to, children, icon: Icon }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={`nav-link ${isActive ? 'active' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.2s',
        fontWeight: isActive ? 600 : 400
      }}
    >
      {Icon && <Icon size={18} />}
      {children}
    </Link>
  )
}

function MainApp() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const [prompts, setPrompts] = useState([])

  // Subscribe to Firestore updates
  useEffect(() => {
    if (!user) {
      setPrompts([])
      return
    }

    const q = query(collection(db, 'prompts'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const promptsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }))
      setPrompts(promptsData)
    })

    return () => unsubscribe()
  }, [user])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState(null)

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    content: '',
    llm: 'GPT-4o',
    category: 'Coding',
    status: 'Draft'
  })

  // Filter State
  const [filters, setFilters] = useState({
    llm: 'All',
    category: 'All',
    status: 'All',
    creator: 'All'
  })

  // ... options arrays remain the same ...
  const llmOptions = [
    'Generic',
    'GPT-4o',
    'GPT-4 Turbo',
    'Claude 3.5 Sonnet',
    'Claude 3 Opus',
    'Gemini 1.5 Pro',
    'Gemini Flash 1.5',
    'Google Nano Banana',
    'Llama 3',
    'Mistral Large',
    'Grok 1.5',
    'Other'
  ]

  const categoryOptions = [
    'Coding',
    'Writing',
    'Data Analysis',
    'Creative',
    'Productivity',
    'Business',
    'Education',
    'Other'
  ]

  // Removed localStorage useEffect

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const openNewPromptModal = () => {
    setFormData({
      id: null,
      name: '',
      description: '',
      content: '',
      llm: 'GPT-4o',
      category: 'Coding',
      status: 'Draft'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (prompt, e) => {
    if (e) e.stopPropagation();
    setFormData({ ...prompt })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.description || !formData.content) return

    try {
      if (formData.id) {
        // Update existing in Firestore
        const promptRef = doc(db, 'prompts', formData.id)
        const { id, ...updateData } = formData // Remove ID from data payload
        await updateDoc(promptRef, updateData)

        // Also update selected prompt if currently viewing it
        if (selectedPrompt && selectedPrompt.id === formData.id) {
          setSelectedPrompt(formData)
        }
      } else {
        // Create new in Firestore
        // Remove 'id' from formData before sending to create
        const { id, ...newPromptData } = formData
        await addDoc(collection(db, 'prompts'), {
          ...newPromptData,
          createdAt: new Date().toISOString(),
          creator: user.displayName || user.email,
          userId: user.uid // Critical for ownership security rules
        })
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error saving prompt:", error)
      alert("Error saving prompt. See console for details.")
    }
  }

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this prompt?')) {
      try {
        await deleteDoc(doc(db, 'prompts', id))
        if (selectedPrompt && selectedPrompt.id === id) {
          setSelectedPrompt(null) // Close detail view if deleted
        }
      } catch (error) {
        console.error("Error deleting prompt:", error)
        alert("Error deleting prompt.")
      }
    }
  }

  const handleCopy = (text, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text)
  }

  // Filter Logic
  // Derive unique creators for the filter dropdown
  const uniqueCreators = [...new Set(prompts.map(p => p.creator).filter(Boolean))]

  const filteredPrompts = prompts.filter(prompt => {
    const matchLLM = filters.llm === 'All' || prompt.llm === filters.llm
    const matchCategory = filters.category === 'All' || prompt.category === filters.category
    const matchStatus = filters.status === 'All' || prompt.status === filters.status
    const matchCreator = filters.creator === 'All' || prompt.creator === filters.creator
    return matchLLM && matchCategory && matchStatus && matchCreator
  })

  if (loading) return <div className="loading-screen">Loading...</div>
  if (!user) return <Login />

  return (
    <>
      <header className="app-header">
        <div className="container header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div className="logo" onClick={() => setSelectedPrompt(null)} style={{ cursor: 'pointer' }}>
              Prompt Library
            </div>

            <nav style={{ display: 'flex', gap: '0.5rem' }}>
              <NavLink to="/" icon={List}>Library</NavLink>
              <NavLink to="/stats" icon={BarChart2}>Statistics</NavLink>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="user-profile">
              <img src={user.photoURL} alt={user.displayName} title={user.displayName} />
            </div>
            <button className="btn btn-primary" onClick={openNewPromptModal}>
              + New Prompt
            </button>
            <button className="btn btn-ghost" onClick={logout} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/stats" element={<Statistics prompts={prompts} />} />
          <Route path="/" element={
            selectedPrompt ? (
              // Detail View
              <div className="detail-view">
                <button className="btn btn-ghost" onClick={() => setSelectedPrompt(null)} style={{ marginBottom: '1rem' }}>
                  &larr; Back to Library
                </button>

                <div className="detail-card">
                  <div className="detail-header">
                    <div>
                      <div className="badges" style={{ marginBottom: '0.5rem' }}>
                        <span className={`tag ${selectedPrompt.status === 'Validated' ? 'tag-validated' : 'tag-draft'}`}>
                          {selectedPrompt.status}
                        </span>
                        <span className="tag tag-category">
                          {selectedPrompt.category}
                        </span>
                        <span className="llm-badge">{selectedPrompt.llm}</span>
                      </div>
                      <h1 className="detail-title">{selectedPrompt.name}</h1>
                      <div className="prompt-meta" style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Created by <span style={{ color: 'var(--text-primary)' }}>{selectedPrompt.creator || 'Unknown'}</span>
                      </div>
                    </div>
                    <div className="detail-actions">
                      <button className="btn btn-primary" onClick={(e) => openEditModal(selectedPrompt, e)}>
                        Edit Prompt
                      </button>
                      <button className="btn btn-ghost" onClick={(e) => handleDelete(selectedPrompt.id, e)}>
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Description</h3>
                    <p>{selectedPrompt.description}</p>
                  </div>

                  <div className="detail-section">
                    <div className="prompt-header">
                      <h3>Prompt Content</h3>
                      <button
                        className="btn-copy"
                        onClick={() => handleCopy(selectedPrompt.content)}
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                    <div className="detail-code-block">
                      <pre>{selectedPrompt.content}</pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // List View
              <>
                <div className="filter-bar">
                  <div className="filter-group">
                    <label htmlFor="filter-llm">LLM</label>
                    <select
                      id="filter-llm"
                      name="llm"
                      value={filters.llm}
                      onChange={handleFilterChange}
                      className="filter-select"
                    >
                      <option value="All">All Models</option>
                      {llmOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="filter-category">Category</label>
                    <select
                      id="filter-category"
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="filter-select"
                    >
                      <option value="All">All Categories</option>
                      {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="filter-status">Status</label>
                    <select
                      id="filter-status"
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="filter-select"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Draft">Draft</option>
                      <option value="Validated">Validated</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="filter-creator">Creator</label>
                    <select
                      id="filter-creator"
                      name="creator"
                      value={filters.creator}
                      onChange={handleFilterChange}
                      className="filter-select"
                    >
                      <option value="All">All Creators</option>
                      {uniqueCreators.map(creator => (
                        <option key={creator} value={creator}>{creator}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-stats">
                    Showing {filteredPrompts.length} of {prompts.length} prompts
                  </div>
                </div>

                <div className="grid">
                  {filteredPrompts.length === 0 ? (
                    <div className="empty-state">
                      <h3>No prompts found</h3>
                      <p>Try adjusting your filters or create a new prompt.</p>
                      {(filters.llm !== 'All' || filters.category !== 'All' || filters.status !== 'All' || filters.creator !== 'All') && (
                        <button
                          className="btn btn-ghost"
                          onClick={() => setFilters({ llm: 'All', category: 'All', status: 'All', creator: 'All' })}
                          style={{ marginTop: '1rem' }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredPrompts.map(prompt => (
                      <div
                        key={prompt.id}
                        className="card clickable-card"
                        onClick={() => setSelectedPrompt(prompt)}
                      >
                        <div className="card-header">
                          <div className="badges">
                            <span className={`tag ${prompt.status === 'Validated' ? 'tag-validated' : 'tag-draft'}`}>
                              {prompt.status}
                            </span>
                            <span className="tag tag-category">
                              {prompt.category}
                            </span>
                          </div>
                          <div className="card-actions">
                            <button
                              onClick={(e) => openEditModal(prompt, e)}
                              className="btn-icon"
                              aria-label="Edit prompt"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(prompt.id, e)}
                              className="btn-icon btn-delete"
                              aria-label="Delete prompt"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <h3 className="card-title">{prompt.name}</h3>
                        <p className="card-desc">{prompt.description}</p>

                        <div className="prompt-preview">
                          <div className="prompt-header">
                            <span>Prompt</span>
                          </div>
                          <pre>{prompt.content}</pre>
                        </div>

                        <div className="card-footer">
                          <span className="llm-badge">{prompt.llm}</span>
                          <span className="creator-badge" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            By {prompt.creator ? prompt.creator.split(' ')[0] : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          />
        </Routes>
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') setIsModalOpen(false)
        }}>
          <div className="modal-content">
            <h2 style={{ marginBottom: '1.5rem' }}>{formData.id ? 'Edit Prompt' : 'Create New Prompt'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Prompt Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Python Debugger"
                  autoFocus
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categoryOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="llm">Target LLM</label>
                  <select
                    id="llm"
                    name="llm"
                    value={formData.llm}
                    onChange={handleInputChange}
                    required
                  >
                    {llmOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Short description of what this prompt does..."
                  rows="2"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Prompt Content</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Paste your prompt here..."
                  rows="6"
                  className="code-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Draft">Draft</option>
                  <option value="Validated">Validated</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {formData.id ? 'Update Prompt' : 'Save Prompt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )
      }
    </>
  )
}

const App = () => {
  return (
    <Router>
      <MainApp />
    </Router>
  )
}

export default App
