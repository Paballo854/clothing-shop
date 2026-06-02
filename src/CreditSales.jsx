import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

function CreditSales() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [credits, setCredits] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [dueDate, setDueDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadProducts();
    loadCredits();
  }, []);

  const loadCustomers = async () => {
    const { data } = await supabase.from('customers').select('*').order('first_name');
    if (data) setCustomers(data);
  };

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('name');
    if (data) setProducts(data);
  };

  const loadCredits = async () => {
    setLoading(true);
    const { data } = await supabase.from('credits').select('*').order('created_at', { ascending: false });
    if (data) setCredits(data);
    setLoading(false);
  };

  const addCreditSale = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedProduct || !dueDate) {
      alert('Please fill all required fields');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const totalAmount = product.price * quantity;

    const { error } = await supabase.from('credits').insert([{
      customer_id: selectedCustomer,
      product_id: selectedProduct,
      product_name: product.name,
      quantity: quantity,
      total_amount: totalAmount,
      amount_paid: 0,
      due_date: dueDate,
      status: 'Active'
    }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Credit sale recorded!');
      setSelectedCustomer('');
      setSelectedProduct('');
      setQuantity(1);
      setDueDate('');
      loadCredits();
    }
  };

  const recordPayment = async (e) => {
    e.preventDefault();
    if (!selectedCredit || !paymentAmount) return;

    const credit = credits.find(c => c.id === selectedCredit);
    if (!credit) return;

    const amount = parseFloat(paymentAmount);
    const newAmountPaid = credit.amount_paid + amount;
    const newBalance = credit.total_amount - newAmountPaid;
    const newStatus = newBalance <= 0 ? 'Paid' : 'Active';

    const { error: paymentError } = await supabase.from('payments').insert([{
      credit_id: selectedCredit,
      amount: amount
    }]);

    if (paymentError) {
      alert('Error: ' + paymentError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from('credits')
      .update({ amount_paid: newAmountPaid, status: newStatus })
      .eq('id', selectedCredit);

    if (updateError) {
      alert('Error: ' + updateError.message);
    } else {
      alert('Payment of M' + amount + ' recorded! Balance: M' + newBalance);
      setPaymentAmount('');
      setSelectedCredit(null);
      setShowPaymentForm(false);
      loadCredits();
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.first_name + ' ' + customer.surname : 'Unknown';
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '16px' }}>Credit Sales</h1>

      {/* New Credit Sale Form */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>New Credit Sale</h2>
        <form onSubmit={addCreditSale}>
          <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }}>
            <option value="">Select Customer *</option>
            {customers.map(c => (<option key={c.id} value={c.id}>{c.first_name} {c.surname}</option>))}
          </select>

          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }}>
            <option value="">Select Product *</option>
            {products.map(p => (<option key={p.id} value={p.id}>{p.name} - M{p.price}</option>))}
          </select>

          <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
          <button type="submit" style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Add Credit Sale</button>
        </form>
      </div>

      {/* Record Payment Button */}
      <button onClick={() => setShowPaymentForm(!showPaymentForm)} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
        {showPaymentForm ? 'Cancel Payment' : 'Record Payment'}
      </button>

      {/* Record Payment Form */}
      {showPaymentForm && (
        <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Record Payment</h2>
          <form onSubmit={recordPayment}>
            <select value={selectedCredit} onChange={(e) => setSelectedCredit(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }}>
              <option value="">Select Credit *</option>
              {credits.filter(c => c.status !== 'Paid').map(c => (
                <option key={c.id} value={c.id}>{getCustomerName(c.customer_id)} - {c.product_name} - Owed: M{(c.total_amount - c.amount_paid).toFixed(2)}</option>
              ))}
            </select>
            <input type="number" placeholder="Payment Amount *" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
            <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Submit Payment</button>
          </form>
        </div>
      )}

      {/* Credits List - Mobile Cards View */}
      <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>Active Credits</h2>
      {loading ? <p>Loading...</p> : credits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>No credit sales yet.</div>
      ) : (
        credits.map(c => {
          const balance = c.total_amount - c.amount_paid;
          const isOverdue = balance > 0 && new Date(c.due_date) < new Date();
          return (
            <div key={c.id} style={{ backgroundColor: isOverdue ? '#fee2e2' : 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#1e293b' }}>{getCustomerName(c.customer_id)}</span>
                <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '12px', backgroundColor: c.status === 'Paid' ? '#10b981' : (isOverdue ? '#ef4444' : '#f59e0b'), color: 'white' }}>{c.status === 'Paid' ? 'PAID' : (isOverdue ? 'OVERDUE' : 'ACTIVE')}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>Product: {c.product_name} x{c.quantity}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                <span>Total: <strong>M{c.total_amount}</strong></span>
                <span>Paid: <strong>M{c.amount_paid}</strong></span>
                <span style={{ color: '#dc2626' }}>Balance: <strong>M{balance}</strong></span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Due: {c.due_date}</div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default CreditSales;
