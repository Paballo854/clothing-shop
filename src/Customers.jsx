import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    let query = supabase.from('customers').select('*');
    
    if (searchTerm) {
      query = query.or('first_name.ilike.%' + searchTerm + '%,surname.ilike.%' + searchTerm + '%,phone.ilike.%' + searchTerm + '%');
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error) setCustomers(data || []);
    setLoading(false);
  };

  const addCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.from('customers').insert([{
      first_name: firstName,
      surname: surname,
      phone: phone,
      email: email,
      address: address
    }]);
    
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Customer added!');
      setFirstName('');
      setSurname('');
      setPhone('');
      setEmail('');
      setAddress('');
      setShowForm(false);
      fetchCustomers();
    }
    setLoading(false);
  };

  const deleteCustomer = async (id) => {
    if (confirm('Delete this customer?')) {
      await supabase.from('customers').delete().eq('id', id);
      fetchCustomers();
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', color: '#1e293b', margin: 0 }}>Customer Management</h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Add, view, and manage customers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '10px 16px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          {showForm ? 'Cancel' : '+ Add Customer'}
        </button>
      </div>

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>New Customer</h2>
          <form onSubmit={addCustomer}>
            <input type="text" placeholder="First Name *" required value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
            <input type="text" placeholder="Surname *" required value={surname} onChange={(e) => setSurname(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
            <input type="tel" placeholder="Phone Number *" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
            <input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
            <input type="text" placeholder="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Save</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <input
        type="text"
        placeholder="Search by name, surname, or phone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>No customers found.</div>
      ) : (
        customers.map(function(c) {
          return (
            <div key={c.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e293b' }}>{c.first_name} {c.surname}</span>
                </div>
                <button onClick={() => deleteCustomer(c.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Phone: {c.phone}</div>
              {c.email && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Email: {c.email}</div>}
              {c.address && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Address: {c.address}</div>}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Customers;
