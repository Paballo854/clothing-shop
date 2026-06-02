import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './Login';
import Customers from './Customers';
import Products from './Products';
import CreditSales from './CreditSales';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const Dashboard = () => (
    <div style={{ 
      maxWidth: '1280px', 
      margin: '0 auto', 
      padding: '20px'
    }}>
      {/* Stats Cards - Mobile friendly grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '32px' 
      }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Total Sales</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>M0.00</div>
          <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>Today</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Credit Outstanding</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>M0.00</div>
          <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>Active Debts</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Products in Stock</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>0</div>
          <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>Available</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#1e293b', padding: '20px', borderRadius: '16px' }}>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Overdue Payments</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>0</div>
          <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px' }}>Need Follow Up</div>
        </div>
      </div>

      <h2 style={{ color: '#1e293b', fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>Quick Actions</h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div onClick={() => setPage('customers')} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px' }}>👥</div>
          <h3 style={{ margin: '8px 0 0', fontSize: '14px', color: '#1e293b' }}>Customers</h3>
        </div>
        <div onClick={() => setPage('products')} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px' }}>👟</div>
          <h3 style={{ margin: '8px 0 0', fontSize: '14px', color: '#1e293b' }}>Products</h3>
        </div>
        <div onClick={() => setPage('credits')} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px' }}>💰</div>
          <h3 style={{ margin: '8px 0 0', fontSize: '14px', color: '#1e293b' }}>Credit Sales</h3>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px' }}>📊</div>
          <h3 style={{ margin: '8px 0 0', fontSize: '14px', color: '#1e293b' }}>Reports</h3>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
        No recent transactions. Add your first sale!
      </div>
    </div>
  );

  return (
    <div style={{ 
      fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif", 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc'
    }}>
      {/* Mobile-friendly header */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '16px', 
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h1 style={{ fontSize: '20px', margin: 0, fontWeight: '700', color: '#1e293b' }}>👕 StyleStore Pro</h1>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>{user.email}</p>
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'block'
            }}
          >
            ☰
          </button>
        </div>
        
        {/* Navigation links - mobile responsive */}
        <div style={{ 
          display: menuOpen ? 'flex' : 'flex',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row',
          gap: '8px',
          marginTop: menuOpen ? '16px' : '16px',
          flexWrap: 'wrap'
        }}>
          <button onClick={() => { setPage('dashboard'); setMenuOpen(false); }} style={{ backgroundColor: page === 'dashboard' ? '#3b82f6' : 'transparent', color: page === 'dashboard' ? 'white' : '#64748b', padding: '8px 16px', border: page === 'dashboard' ? 'none' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Dashboard</button>
          <button onClick={() => { setPage('customers'); setMenuOpen(false); }} style={{ backgroundColor: page === 'customers' ? '#3b82f6' : 'transparent', color: page === 'customers' ? 'white' : '#64748b', padding: '8px 16px', border: page === 'customers' ? 'none' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Customers</button>
          <button onClick={() => { setPage('products'); setMenuOpen(false); }} style={{ backgroundColor: page === 'products' ? '#3b82f6' : 'transparent', color: page === 'products' ? 'white' : '#64748b', padding: '8px 16px', border: page === 'products' ? 'none' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Products</button>
          <button onClick={() => { setPage('credits'); setMenuOpen(false); }} style={{ backgroundColor: page === 'credits' ? '#3b82f6' : 'transparent', color: page === 'credits' ? 'white' : '#64748b', padding: '8px 16px', border: page === 'credits' ? 'none' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Credit Sales</button>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {page === 'dashboard' && <Dashboard />}
        {page === 'customers' && <Customers />}
        {page === 'products' && <Products />}
        {page === 'credits' && <CreditSales />}
      </div>

      <footer style={{ backgroundColor: 'white', borderTop: '1px solid #e2e8f0', padding: '16px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>© 2024 StyleStore Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
