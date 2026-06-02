import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  const addProduct = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert([{
      name, category, size, color, price: parseFloat(price), quantity: parseInt(quantity)
    }]);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Product added!');
      setName(''); setCategory(''); setSize(''); setColor(''); setPrice(''); setQuantity('');
      setShowForm(false);
      loadProducts();
    }
  };

  const deleteProduct = async (id) => {
    if (confirm('Delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      loadProducts();
    }
  };

  useEffect(() => { loadProducts(); }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#1e293b' }}>Product Management</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          + Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={addProduct} style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <input type="text" placeholder="Product Name *" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <input type="text" placeholder="Size" value={size} onChange={(e) => setSize(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <input type="text" placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <input type="number" placeholder="Price (M) *" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <input type="number" placeholder="Quantity *" value={quantity} onChange={(e) => setQuantity(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ marginTop: '10px' }}>
            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>Save</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? <p>Loading...</p> : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>No products yet. Add your first product.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Size</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Color</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Price (M)</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Stock</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{p.name}</td>
                  <td style={{ padding: '12px' }}>{p.category || '-'}</td>
                  <td style={{ padding: '12px' }}>{p.size || '-'}</td>
                  <td style={{ padding: '12px' }}>{p.color || '-'}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>M{p.price}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{p.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button onClick={() => deleteProduct(p.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
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

export default Products;
