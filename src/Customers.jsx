import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading:', error);
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  };

  const addCustomer = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('customers').insert([{ first_name: name, surname: surname, phone: phone }]);
      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('Customer added successfully!');
        setName('');
        setSurname('');
        setPhone('');
        loadCustomers();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const deleteCustomer = async (id) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) {
        alert('Error: ' + error.message);
      } else {
        loadCustomers();
      }
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#1e293b' }}>Customer Management</h1>
      
      <form onSubmit={addCustomer} style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="First Name *" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', flex: 1 }}
          />
          <input 
            type="text" 
            placeholder="Surname *" 
            value={surname} 
            onChange={(e) => setSurname(e.target.value)} 
            required 
            style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', flex: 1 }}
          />
          <input 
            type="tel" 
            placeholder="Phone Number *" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            required 
            style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', flex: 1 }}
          />
          <button 
            type="submit" 
            style={{ padding: '8px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Add Customer
          </button>
        </div>
      </form>

      {loading && <p>Loading customers...</p>}

      {!loading && customers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          No customers yet. Add your first customer above.
        </div>
      )}

      {!loading && customers.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>First Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Surname</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
               </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{customer.first_name}</td>
                  <td style={{ padding: '12px' }}>{customer.surname}</td>
                  <td style={{ padding: '12px' }}>{customer.phone}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => deleteCustomer(customer.id)} 
                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Customers;
