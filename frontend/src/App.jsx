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
  const [backendResults, setBackendResults] = useState(null)
  
  const [mobileNumber, setMobileNumber] = useState('')
  const [isSavingMobile, setIsSavingMobile] = useState(false)

  const BACKEND_URL = 'https://ai-analytics-platform-eta.vercel.app'

  useEffect(() => {
    if (session?.user?.user_metadata?.mobile) {
      setMobileNumber(session.user.user_metadata.mobile)
    }
  }, [session])

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

  const saveMobileNumber = async () => {
    setIsSavingMobile(true)
    const { error } = await supabase.auth.updateUser({
      data: { mobile: mobileNumber }
    })
    setIsSavingMobile(false)
    if (error) alert("Error saving mobile number")
    else alert("Mobile number saved successfully!")
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
    setBackendResults(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${BACKEND_URL}/api/clean`, {
        method: 'POST',
        body: formData // sending actual file via FormData
      })

      const result = await response.json()
      
      if (response.ok) {
        setProcessStatus(`Success! Message from backend: ${result.message}`)
        setBackendResults(result)
      } else {
        setProcessStatus(`Error connecting to backend: ${result.detail || 'Unknown error'}`)
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

  const handleDownloadCSV = () => {
    if (!backendResults || !backendResults.cleaned_csv) return;
    const blob = new Blob([backendResults.cleaned_csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "cleaned_dataset.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
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

          {backendResults && (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <h3><Database color="#00f2fe" size={24} /> Data Cleaning & EDA Results</h3>
              <div style={{ display: 'flex', gap: '20px', marginTop: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <h4>Cleaning Metrics</h4>
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
                    <li style={{ marginBottom: '8px' }}>Initial Rows: <strong>{backendResults.metrics.initial_rows}</strong></li>
                    <li style={{ marginBottom: '8px' }}>Duplicates Removed: <strong style={{color: '#00f2fe'}}>{backendResults.metrics.duplicates_removed}</strong></li>
                    <li style={{ marginBottom: '8px' }}>Final Cleaned Rows: <strong>{backendResults.metrics.cleaned_rows}</strong></li>
                    <li style={{ marginBottom: '8px' }}>Total Columns: <strong>{backendResults.metrics.columns}</strong></li>
                  </ul>
                  <button className="action-btn" onClick={() => setActiveTab('upload')} style={{ marginTop: '15px', padding: '10px', fontSize: '0.9em' }}>
                    View Cleaned Data
                  </button>
                </div>
                
                <div style={{ flex: 2, minWidth: '300px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflowX: 'auto' }}>
                  <h4>EDA: Summary Statistics (Preview)</h4>
                  {Object.keys(backendResults.summary_statistics).length > 0 ? (
                    <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse', fontSize: '0.9em', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <th style={{ padding: '8px' }}>Column</th>
                          <th style={{ padding: '8px' }}>Mean</th>
                          <th style={{ padding: '8px' }}>Min</th>
                          <th style={{ padding: '8px' }}>Max</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(backendResults.summary_statistics).slice(0, 5).map(([col, stats]) => (
                          <tr key={col} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '8px', color: '#00f2fe' }}>{col}</td>
                            <td style={{ padding: '8px' }}>{stats.mean ? stats.mean.toFixed(2) : 'N/A'}</td>
                            <td style={{ padding: '8px' }}>{stats.min ? stats.min.toFixed(2) : 'N/A'}</td>
                            <td style={{ padding: '8px' }}>{stats.max ? stats.max.toFixed(2) : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ marginTop: '10px' }}>No numeric columns to summarize.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )
    }

    if (activeTab === 'upload') {
      return (
        <section className="cards-grid">
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3><Database color="#00f2fe" size={24} /> Data Hub</h3>
            {backendResults ? (
              <div style={{ marginTop: '20px' }}>
                <p style={{ marginBottom: '20px' }}>Your dataset has been cleaned, standardized, and imputed. It is ready for export.</p>
                <button className="action-btn" onClick={handleDownloadCSV} style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Database size={18} /> Download Cleaned Dataset (CSV)
                </button>
              </div>
            ) : (
              <p style={{ marginTop: '20px', color: '#aaa' }}>No data processed yet. Please upload a dataset in the Dashboard.</p>
            )}
          </div>
        </section>
      )
    }

    if (activeTab === 'models') {
      return (
        <section className="cards-grid">
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3><Activity color="#00f2fe" size={24} /> Automated Visualization & ML Engine</h3>
            {backendResults ? (
              <div style={{ marginTop: '20px' }}>
                <p>Generating visualizations based on your EDA results...</p>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
                  {Object.entries(backendResults.summary_statistics).slice(0, 3).map(([col, stats]) => (
                    <div key={col} style={{ flex: 1, minWidth: '250px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      <h4 style={{ color: '#00f2fe', marginBottom: '15px', textAlign: 'center' }}>{col} Distribution Map</h4>
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '150px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px' }}>
                        
                        <div style={{ width: '25%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75em', marginBottom: '4px', color: '#fff' }}>{stats.min ? stats.min.toFixed(2) : '0'}</span>
                          <div style={{ width: '100%', background: 'linear-gradient(to top, #00f2fe, #4facfe)', height: `${Math.min(100, Math.max(10, (stats.min / stats.max) * 100))}%`, borderRadius: '4px 4px 0 0' }}></div>
                        </div>

                        <div style={{ width: '25%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75em', marginBottom: '4px', color: '#fff' }}>{stats.mean ? stats.mean.toFixed(2) : '0'}</span>
                          <div style={{ width: '100%', background: 'linear-gradient(to top, #00f2fe, #4facfe)', height: `${Math.min(100, Math.max(20, (stats.mean / stats.max) * 100))}%`, borderRadius: '4px 4px 0 0' }}></div>
                        </div>

                        <div style={{ width: '25%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75em', marginBottom: '4px', color: '#fff' }}>{stats.max ? stats.max.toFixed(2) : '0'}</span>
                          <div style={{ width: '100%', background: 'linear-gradient(to top, #00f2fe, #4facfe)', height: '90%', borderRadius: '4px 4px 0 0' }}></div>
                        </div>

                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px', fontSize: '0.8em', color: '#aaa' }}>
                        <span>Min</span>
                        <span>Mean</span>
                        <span>Max</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ marginTop: '20px', color: '#aaa' }}>No models trained yet. Please process data in the Dashboard first.</p>
            )}
          </div>
        </section>
      )
    }

    if (activeTab === 'settings') {
      const userMeta = session.user.user_metadata
      return (
        <section className="cards-grid">
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3><Settings color="#00f2fe" size={24} /> User Settings</h3>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '300px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <img src={userMeta.avatar_url || 'https://via.placeholder.com/60'} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2em' }}>{userMeta.full_name}</h4>
                    <p style={{ margin: 0, color: '#aaa' }}>{session.user.email}</p>
                  </div>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#00f2fe' }}>Mobile Number</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="tel" 
                      value={mobileNumber} 
                      onChange={(e) => setMobileNumber(e.target.value)} 
                      placeholder="Enter mobile number" 
                      style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    />
                    <button className="action-btn" onClick={saveMobileNumber} disabled={isSavingMobile} style={{ width: 'auto' }}>
                      {isSavingMobile ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )
    }
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
        
        {renderContent()}
      </main>
    </div>
  )
}

export default App
