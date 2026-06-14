import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

function PeriodSelector({ currentPeriod, onPeriodChange }) {
  const [periods, setPeriods] = useState([]);
  const [showNewPeriod, setShowNewPeriod] = useState(false);
  const [newPeriod, setNewPeriod] = useState('');

  // Get current date for default period
  const getCurrentPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return year + '-' + month;
  };

  const loadPeriods = async () => {
    // Get periods from products
    const { data: productPeriods } = await supabase
      .from('products')
      .select('period')
      .not('period', 'is', null);
    
    // Get periods from credits
    const { data: creditPeriods } = await supabase
      .from('credits')
      .select('period')
      .not('period', 'is', null);
    
    const allPeriods = new Set();
    if (productPeriods) {
      productPeriods.forEach(function(p) {
        if (p.period) allPeriods.add(p.period);
      });
    }
    if (creditPeriods) {
      creditPeriods.forEach(function(c) {
        if (c.period) allPeriods.add(c.period);
      });
    }
    
    const periodList = Array.from(allPeriods).sort().reverse();
    setPeriods(periodList);
  };

  const createNewPeriod = async () => {
    if (!newPeriod) return;
    onPeriodChange(newPeriod);
    setShowNewPeriod(false);
    setNewPeriod('');
    loadPeriods();
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const currentDefault = getCurrentPeriod();

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}> Current Period:</span>
          <select
            value={currentPeriod || currentDefault}
            onChange={(e) => onPeriodChange(e.target.value)}
            style={{
              marginLeft: '8px',
              padding: '6px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#f8fafc'
            }}
          >
            {periods.map(function(p) {
              return <option key={p} value={p}>{p}</option>;
            })}
            <option value={currentDefault}>{currentDefault} (Current)</option>
          </select>
        </div>
        
        <button
          onClick={() => setShowNewPeriod(!showNewPeriod)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          + New Month/Period
        </button>
      </div>

      {showNewPeriod && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '13px', color: '#1e293b', marginBottom: '8px' }}>Create New Period (e.g., 2024-06 or June 2024):</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="e.g., 2024-06 or June 2024"
              value={newPeriod}
              onChange={(e) => setNewPeriod(e.target.value)}
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={createNewPeriod}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Create
            </button>
            <button
              onClick={() => setShowNewPeriod(false)}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
            Examples: "2024-06", "June 2024", "2024 - June"
          </div>
        </div>
      )}
      
      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
        Tip: Select a period to see only stock and debts from that month
      </div>
    </div>
  );
}

export default PeriodSelector;
