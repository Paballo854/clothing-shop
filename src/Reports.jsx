import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useLanguage } from './LanguageContext';

function Reports() {
  const { translations: t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    totalCredit: 0,
    totalPaid: 0,
    totalOutstanding: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [recentCredits, setRecentCredits] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [unsoldProducts, setUnsoldProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    
    const { data: customersData } = await supabase.from('customers').select('*');
    setCustomers(customersData || []);
    
    const { data: allProducts } = await supabase.from('products').select('*');
    const { data: credits } = await supabase.from('credits').select('*');
    
    // Find unsold products
    if (allProducts && allProducts.length > 0 && credits) {
      const soldProductNames = new Set();
      credits.forEach(c => {
        soldProductNames.add(c.product_name);
      });
      
      const unsold = allProducts.filter(p => !soldProductNames.has(p.name));
      setUnsoldProducts(unsold);
    }
    
    if (credits && credits.length > 0) {
      let totalSales = 0;
      let totalPaid = 0;
      let totalOutstanding = 0;
      
      credits.forEach(c => {
        totalSales += c.total_amount;
        totalPaid += c.amount_paid;
        totalOutstanding += (c.total_amount - c.amount_paid);
      });
      
      setSalesData({
        totalSales: totalSales,
        totalCredit: credits.length,
        totalPaid: totalPaid,
        totalOutstanding: totalOutstanding
      });
      
      const productMap = new Map();
      credits.forEach(c => {
        const current = productMap.get(c.product_name) || { quantity: 0, amount: 0 };
        current.quantity += c.quantity;
        current.amount += c.total_amount;
        productMap.set(c.product_name, current);
      });
      
      const topProductsArray = Array.from(productMap.entries())
        .map(function(item) {
          return { name: item[0], quantity: item[1].quantity, amount: item[1].amount };
        })
        .sort(function(a, b) {
          return b.amount - a.amount;
        })
        .slice(0, 5);
      
      setTopProducts(topProductsArray);
      
      const recent = [...credits].sort(function(a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
      }).slice(0, 10);
      setRecentCredits(recent);
      
      if (customersData && customersData.length > 0) {
        const customerMap = new Map();
        credits.forEach(c => {
          const current = customerMap.get(c.customer_id) || { total: 0, count: 0 };
          current.total += c.total_amount;
          current.count += 1;
          customerMap.set(c.customer_id, current);
        });
        
        const topCustomersArray = Array.from(customerMap.entries())
          .map(function(entry) {
            const customerId = entry[0];
            const data = entry[1];
            const customer = customersData.find(function(c) { return c.id === customerId; });
            return {
              name: customer ? customer.first_name + ' ' + customer.surname : 'Unknown',
              total: data.total,
              count: data.count
            };
          })
          .sort(function(a, b) {
            return b.total - a.total;
          })
          .slice(0, 5);
        
        setTopCustomers(topCustomersArray);
      }
    }
    
    setLoading(false);
  };

  const getCustomerName = function(customerId) {
    const customer = customers.find(function(c) { return c.id === customerId; });
    return customer ? customer.first_name + ' ' + customer.surname : 'Unknown';
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '16px' }}> {t.reportsTitle}</h1>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>{t.loading}</div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{t.totalSalesRevenue}</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4f46e5' }}>M{salesData.totalSales.toFixed(2)}</div>
              <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>{t.fromCreditSales} {salesData.totalCredit}</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{t.totalPaid}</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>M{salesData.totalPaid.toFixed(2)}</div>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{t.outstanding}</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ef4444' }}>M{salesData.totalOutstanding.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Top Selling Products */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#1e293b' }}> 🏆 {t.topSellingProducts}</h2>
            {topProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>{t.noSalesYet}</div>
            ) : (
              topProducts.map(function(p, idx) {
                return (
                  <div key={idx} style={{ padding: '10px 0', borderBottom: idx < topProducts.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>{p.name}</span>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{p.quantity} {t.soldUnits}</div>
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#4f46e5' }}>M{p.amount.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Unsold Products */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#1e293b' }}> 📦 {t.unsoldProducts}</h2>
            {unsoldProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#10b981' }}>
                ✅ {t.allProductsSold}
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '12px' }}>
                  ⚠️ {unsoldProducts.length} {t.unsoldDescription}:
                </p>
                {unsoldProducts.map(function(p, idx) {
                  return (
                    <div key={idx} style={{ padding: '10px 0', borderBottom: idx < unsoldProducts.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: '600', color: '#dc2626' }}>{p.name}</span>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{t.stock}: {p.quantity} | {t.price}: M{p.price}</div>
                          {p.category && <div style={{ fontSize: '10px', color: '#94a3b8' }}>{p.category} {p.size ? '| ' + t.size + ': ' + p.size : ''} {p.color ? '| ' + p.color : ''}</div>}
                        </div>
                        <div style={{ fontSize: '12px', color: '#f59e0b' }}>{t.notSoldYet}</div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                  💡 {t.promotionTip}
                </div>
              </div>
            )}
          </div>

          {/* Top Customers */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#1e293b' }}> 👥 {t.topCustomers}</h2>
            {topCustomers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>{t.noCustomersYet}</div>
            ) : (
              topCustomers.map(function(c, idx) {
                return (
                  <div key={idx} style={{ padding: '10px 0', borderBottom: idx < topCustomers.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>{c.name}</span>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{c.count} {t.purchases}</div>
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#4f46e5' }}>M{c.total.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Recent Credit Sales */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#1e293b' }}> 📋 {t.recentCreditSales}</h2>
            {recentCredits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>{t.noCreditSalesYet}</div>
            ) : (
              recentCredits.map(function(c, idx) {
                const balance = c.total_amount - c.amount_paid;
                const isPaid = balance === 0;
                return (
                  <div key={idx} style={{ padding: '10px 0', borderBottom: idx < recentCredits.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>{c.product_name}</span>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{t.customer}: {getCustomerName(c.customer_id)}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{t.due}: {c.due_date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: '#4f46e5' }}>M{c.total_amount}</div>
                        <div style={{ fontSize: '10px', color: isPaid ? '#10b981' : '#ef4444' }}>
                          {isPaid ? t.statusPaid : t.balance + ': M' + balance.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
