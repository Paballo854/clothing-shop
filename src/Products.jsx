import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useLanguage } from './LanguageContext';
import PeriodSelector from './PeriodSelector';

function Products() {
  const { translations: t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*');
    
    if (currentPeriod) {
      query = query.eq('period', currentPeriod);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
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
    
    const productData = {
      name: name,
      category: category,
      size: size,
      color: color,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      period: currentPeriod
    };
    
    if (editingId) {
      const { error } = await supabase.from('products').update(productData).eq('id', editingId);
      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('Product updated!');
        resetForm();
        loadProducts();
      }
    } else {
      const { error } = await supabase.from('products').insert([productData]);
      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('Product added for ' + currentPeriod + '!');
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

  useEffect(() => {
    if (currentPeriod) {
      loadProducts();
    }
  }, [currentPeriod]);

  return (
    <div style={{ padding: '16px' }}>
      <PeriodSelector currentPeriod={currentPeriod} onPeriodChange={setCurrentPeriod} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '20px', color: '#1e293b', margin: 0 }}>{t.productManagement}</h1>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
            {currentPeriod ? 'Showing stock for: ' + currentPeriod : 'Select a period above'}
          </p>
        </div>
        {currentPeriod && (
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            {showForm ? 'Cancel' : '+ Add Product for ' + currentPeriod}
          </button>
        )}
      </div>

      {showForm && currentPeriod && (
        <form onSubmit={addOrUpdateProduct} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#1e293b' }}>{editingId ? 'Edit Product' : 'New Product for ' + currentPeriod}</h3>
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

      {!currentPeriod && (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>
          Please select or create a period above to manage products
        </div>
      )}

      {currentPeriod && loading && <p>{t.loading}</p>}

      {currentPeriod && !loading && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>
          No products for {currentPeriod}. Click + Add Product to add new stock.
        </div>
      )}

      {currentPeriod && !loading && products.length > 0 && products.map(function(p) {
        return (
          <div key={p.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e293b' }}>{p.name}</span>
                {p.period && <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '8px' }}>({p.period})</span>}
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
        );
      })}
    </div>
  );
}

export default Products;
