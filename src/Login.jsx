import { useState } from 'react';
import { supabase } from './lib/supabase';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
      if (!result.error) {
        alert('Account created successfully! Please sign in.');
        setIsSignUp(false);
      }
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
      if (!result.error) {
        onLogin(result.data.user);
      }
    }

    if (result.error) {
      setError(result.error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/photo.jpeg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Dark Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        zIndex: 0
      }}></div>

      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 48px',
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2,
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '700', fontSize: '24px', color: 'white', letterSpacing: '-0.5px' }}>StyleStore Pro</span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white',
            padding: '12px 32px',
            border: 'none',
            borderRadius: '40px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 15px rgba(79,70,229,0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(79,70,229,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(79,70,229,0.4)';
          }}
        >
          Sign In →
        </button>
      </nav>

      {/* Hero Section - Centered */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '120px 48px',
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        flex: 1
      }}>
        <div style={{
          backgroundColor: 'rgba(79,70,229,0.15)',
          backdropFilter: 'blur(10px)',
          display: 'inline-block',
          padding: '8px 20px',
          borderRadius: '100px',
          marginBottom: '24px',
          border: '1px solid rgba(79,70,229,0.3)'
        }}>
          <span style={{ color: '#a5b4fc', fontSize: '13px', fontWeight: '600', letterSpacing: '1px' }}>CLOTHING STORE MANAGEMENT</span>
        </div>
        
        <h1 style={{
          fontSize: '60px',
          fontWeight: '800',
          margin: '0 0 20px 0',
          color: 'white',
          lineHeight: '1.2',
          letterSpacing: '-1px'
        }}>
          Manage Your Clothing Store
          <br />
          <span style={{ color: '#a5b4fc' }}>Like a Professional</span>
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: '#cbd5e1',
          lineHeight: '1.6',
          marginBottom: '40px',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Complete system for clothing and shoe stores. Track customers, manage inventory, sell on credit, and get paid faster.
        </p>

        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white',
            padding: '16px 40px',
            border: 'none',
            borderRadius: '50px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 20px rgba(79,70,229,0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,70,229,0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,0.4)';
          }}
        >
          Get Started Free →
        </button>
      </div>

      {/* Simple Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 2,
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        padding: '20px 48px',
        borderTop: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
            © 2024 StyleStore Pro. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '40px',
            width: '90%',
            maxWidth: '440px',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#94a3b8'
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ color: '#1a1a2e', fontSize: '24px', margin: '0', fontWeight: '700' }}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>
                {isSignUp ? 'Start managing your store today' : 'Sign in to continue'}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}
              />

              {error && (
                <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4f46e5',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                {isSignUp ? '← Back to Sign In' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
