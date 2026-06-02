import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './Login';
import Customers from './Customers';
import Products from './Products';
import CreditSales from './CreditSales';
import { useLanguage } from './LanguageContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, translations: t, toggleLanguage } = useLanguage();
  
  const [stats, setStats] = useState({
    totalSales: 0,
    creditOutstanding: 0,
    productsInStock: 0,
    totalStockValue: 0,
    overduePayments: 0
  });

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

  const loadStats = async () => {
    const { data: products } = await supabase.from('products').select('price, quantity');
    let totalStockValue = 0;
    let totalStockQuantity = 0;
    
    if (products) {
      products.forEach(p => {
        totalStockValue += (p.price || 0) * (p.quantity || 0);
        totalStockQuantity += (p.quantity || 0);
      });
    }
    
    const { data: credits } = await supabase.from('credits').select('total_amount, amount_paid, status, due_date');
    let totalOutstanding = 0;
    let overdue = 0;
    let totalSales = 0;
    const today = new Date();
    
    if (credits) {
      credits.forEach(c => {
        totalSales += c.total_amount;
        
        if (c.status !== 'Paid') {
          const balance = c.total_amount - c.amount_paid;
          totalOutstanding += balance;
          
          const dueDate = new Date(c.due_date);
          if (dueDate < today && balance > 0) {
            overdue += 1;
          }
        }
      });
    }
    
    setStats({
      totalSales: totalSales,
      creditOutstanding: totalOutstanding,
      productsInStock: totalStockQuantity,
      totalStockValue: totalStockValue,
      overduePayments: overdue
    });
  };

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

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
        <div>{t.loading}</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const Dashboard = () => (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>{t.totalSales}</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>M{stats.totalSales.toFixed(2)}</div>
          <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>{t.allTime}</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>{t.creditOutstanding}</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>M{stats.creditOutstanding.toFixed(2)}</div>
          <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>{t.activeDebts}</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>{t.totalStockValue}</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>M{stats.totalStockValue.toFixed(2)}</div>
          <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>{stats.productsInStock} {t.itemsInStock}</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#1e293b', padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>{t.overduePayments}</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.overduePayments}</div>
          <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>{t.needFollowUp}</div>
        </div>
      </div>

      <h2 style={{ color: '#1e293b', fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>{t.quickActions}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div onClick={() => setPage('customers')} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '28px' }}>👥</div>
          <h3 style={{ margin: '6px 0 0', fontSize: '13px', color: '#1e293b' }}>{t.customers}</h3>
        </div>
        <div onClick={() => setPage('products')} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '28px' }}>👟</div>
          <h3 style={{ margin: '6px 0 0', fontSize: '13px', color: '#1e293b' }}>{t.products}</h3>
        </div>
        <div onClick={() => setPage('credits')} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '28px' }}>💰</div>
          <h3 style={{ margin: '6px 0 0', fontSize: '13px', color: '#1e293b' }}>{t.creditSales}</h3>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '28px' }}>📊</div>
          <h3 style={{ margin: '6px 0 0', fontSize: '13px', color: '#1e293b' }}>{t.reports}</h3>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
        {t.noTransactions}
      </div>
    </div>
  );

  return (
    <div style={{ 
      fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif", 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      paddingBottom: '60px'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '12px 16px', 
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '18px', margin: 0, fontWeight: '700', color: '#1e293b' }}>👕 StyleStore Pro</h1>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0 0' }}>{user.email}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={toggleLanguage}
              style={{
                background: '#eef2ff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                color: '#4f46e5'
              }}
            >
              {language === 'en' ? 'Sesotho' : 'English'}
            </button>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px'
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
        
        {menuOpen && (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button onClick={() => { setPage('dashboard'); setMenuOpen(false); }} style={{ backgroundColor: page === 'dashboard' ? '#3b82f6' : 'transparent', color: page === 'dashboard' ? 'white' : '#64748b', padding: '10px', border: page === 'dashboard' ? 'none' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', width: '100%', textAlign: 'left', paddingLeft: '12px' }}>📊 {t.dashboard}</button>
            <button onClick={() => { setPage('customers'); setMenuOpen(false); }} style={{ backgroundColor: page === 'customers' ? '#3b82f6' : 'transparent', color: page === 'customers' ? 'white' : '#64748b', padding: '10px', border: page === 'customers' ? 'none' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', width: '100%', textAlign: 'left', paddingLeft: '12px' }}>👥 {t.customers}</button>
            <button onClick={() => { setPage('products'); setMenuOpen(false); }} style={{ backgroundColor: page === 'products' ? '#3b82f6' : 'transparent', color: page === 'products' ? 'white' : '#64748b', padding: '10px', border: page === 'products' ? 'none' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', width: '100%', textAlign: 'left', paddingLeft: '12px' }}>👟 {t.products}</button>
            <button onClick={() => { setPage('credits'); setMenuOpen(false); }} style={{ backgroundColor: page === 'credits' ? '#3b82f6' : 'transparent', color: page === 'credits' ? 'white' : '#64748b', padding: '10px', border: page === 'credits' ? 'none' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', width: '100%', textAlign: 'left', paddingLeft: '12px' }}>💰 {t.creditSales}</button>
            <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: 'white', padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', width: '100%', textAlign: 'left', paddingLeft: '12px' }}>🚪 {t.logout}</button>
          </div>
        )}
      </div>

      <div>
        {page === 'dashboard' && <Dashboard />}
        {page === 'customers' && <Customers />}
        {page === 'products' && <Products />}
        {page === 'credits' && <CreditSales />}
      </div>
    </div>
  );
}

export default App;
