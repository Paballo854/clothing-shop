import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useLanguage } from './LanguageContext';

function Products() {
  const { translations: t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
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

  const startEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category || '');
    setSize(product.size || '');
    setColor(product.color || '');
    setPrice(product.price.toString());
    setQuantity(product.quantity.toString());
    setShowForm(true);
  };

  const addOrUpdateProduct = async (e) => {
    e.preventDefault();
    
    if (editingId) {
      const { error } = await supabase.from('products').update({
        name, category, size, color, price: parseFloat(price), quantity: parseInt(quantity)
      }).eq('id', editingId);
      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('Product updated!');
        resetForm();
        loadProducts();
      }
    } else {
      const { error } = await supabase.from('products').insert([{
        name, category, size, color, price: parseFloat(price), quantity: parseInt(quantity)
      }]);
      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('Product added!');
        resetForm();
        loadProducts();
      }
    }
  };

  const deleteProduct = async (id) => {
    if (confirm('Delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      loadProducts();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('');
    setSize('');
    setColor('');
    setPrice('');
    setQuantity('');
    setShowForm(false);
  };

  useEffect(() => { loadProducts(); }, []);

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '20px', color: '#1e293b', margin: 0 }}>{t.productManagement}</h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Manage inventory and stock</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>{showForm ? 'Cancel' : '+ ' + t.addProduct}</button>
      </div>

      {showForm && (
        <form onSubmit={addOrUpdateProduct} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#1e293b' }}>{editingId ? 'Edit Product' : t.newProduct}</h3>
          <input type="text" placeholder={t.productName + ' *'} value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
          <input type="text" placeholder={t.category} value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
          <input type="text" placeholder={t.size} value={size} onChange={(e) => setSize(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
          <input type="text" placeholder={t.color} value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
          <input type="number" placeholder={t.price + ' (M) *'} value={price} onChange={(e) => setPrice(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
          <input type="number" placeholder={t.quantityStock + ' *'} value={quantity} onChange={(e) => setQuantity(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{editingId ? 'Update' : 'Save'}</button>
            <button type="button" onClick={resetForm} style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{t.cancel}</button>
          </div>
        </form>
      )}

      {loading ? <p>{t.loading}</p> : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>{t.noProducts}</div>
      ) : (
        products.map(p => (
          <div key={p.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e293b' }}>{p.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => startEdit(p)} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                <button onClick={() => deleteProduct(p.id)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>{t.delete}</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {p.category && <span style={{ backgroundColor: '#eef2ff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', color: '#4f46e5' }}>{p.category}</span>}
              {p.size && <span style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', color: '#64748b' }}>{t.size}: {p.size}</span>}
              {p.color && <span style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', color: '#64748b' }}>{t.color}: {p.color}</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#4f46e5' }}>M{p.price}</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{t.stock}: {p.quantity}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Products;
