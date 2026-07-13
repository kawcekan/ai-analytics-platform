import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { 
  BarChart3, 
  Upload, 
  Activity, 
  Database, 
  LogOut, 
  Sparkles,
  LayoutDashboard,
  Settings
} from 'lucide-react'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // New state for file processing
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processStatus, setProcessStatus] = useState(null)

  const BACKEND_URL = 'https://ai-analytics-platform-eta.vercel.app'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setProcessStatus(null)
    }
  }

  const handleInitializeProcessing = async () => {
    if (!file) {
      alert("Please upload a file first!")
      return
    }

    setIsProcessing(true)
    setProcessStatus("Processing data...")

    try {
      // In a real app we'd parse the file here or send it as FormData.
      // We'll send a dummy payload that matches our FastAPI schema for now.
      const response = await fetch(`${BACKEND_URL}/api/clean`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: [1, 2, 3] }) // dummy data to satisfy the backend
      })

      const result = await response.json()
      
      if (response.ok) {
        setProcessStatus(`Success! Message from backend: ${result.message}`)
      } else {
        setProcessStatus("Error connecting to backend.")
      }
    } catch (error) {
      setProcessStatus("Failed to reach the ML Engine.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return <div className="login-container"><h1 style={{color: 'white'}}>Loading System...</h1></div>
  }

  if (!session) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Nexus Analytics</h1>
          <p>AI-Powered Data Intelligence Platform</p>
          <button className="google-btn" onClick={signInWithGoogle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <nav className="sidebar">
        <h2><Sparkles color="#00f2fe" size={28} /> Nexus</h2>
        <ul>
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </li>
          <li className={activeTab === 'upload' ? 'active' : ''} onClick={() => setActiveTab('upload')}>
            <Database size={20} /> Data Hub
          </li>
          <li className={activeTab === 'models' ? 'active' : ''} onClick={() => setActiveTab('models')}>
            <Activity size={20} /> ML Engine
          </li>
          <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /> Settings
          </li>
        </ul>
        <div className="user-info">
          <p>{session.user.email}</p>
          <button onClick={signOut}><LogOut size={16} style={{marginRight: '8px', verticalAlign: 'middle'}}/> Sign Out</button>
        </div>
      </nav>
      
      <main className="main-content">
        <header>
          <h1>Welcome back, {session.user.user_metadata.full_name || 'Explorer'}</h1>
          <p>Here is what's happening with your data today.</p>
        </header>
        
        <section className="cards-grid">
          <div className="card">
            <h3><Upload color="#00f2fe" size={24} /> Upload Dataset</h3>
            <div className="file-upload-wrapper">
              <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
              <span>{file ? file.name : "Drag & Drop or Click to Browse"}</span>
            </div>
            <button 
              className="action-btn" 
              onClick={handleInitializeProcessing}
              disabled={isProcessing}
              style={{ opacity: isProcessing ? 0.7 : 1 }}
            >
              {isProcessing ? "Processing..." : "Initialize Processing"}
            </button>
            {processStatus && (
              <p style={{ marginTop: '15px', color: processStatus.includes('Success') ? '#34a853' : '#ea4335', fontWeight: 'bold' }}>
                {processStatus}
              </p>
            )}
          </div>
          
          <div className="card">
            <h3><BarChart3 color="#00f2fe" size={24} /> System Health</h3>
            <div className="status-item">
              <span>FastAPI Backend</span>
              <span className="status-badge">Online</span>
            </div>
            <div className="status-item">
              <span>Supabase Auth</span>
              <span className="status-badge">Online</span>
            </div>
            <div className="status-item">
              <span>ML Compute Engine</span>
              <span className={processStatus && processStatus.includes('Success') ? "status-badge" : "status-badge offline"}>
                {processStatus && processStatus.includes('Success') ? "Active" : "Awaiting Data"}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
