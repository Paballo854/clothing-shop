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
      alert('Credit sale recorded successfully');
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
      alert('Error recording payment: ' + paymentError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from('credits')
      .update({ amount_paid: newAmountPaid, status: newStatus })
      .eq('id', selectedCredit);

    if (updateError) {
      alert('Error updating credit: ' + updateError.message);
    } else {
      alert('Payment of M' + amount + ' recorded! Remaining balance: M' + newBalance);
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#1e293b', marginBottom: '20px' }}>Credit Sales</h1>

      <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>New Credit Sale</h2>
        <form onSubmit={addCreditSale}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
              <option value="">Select Customer *</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.first_name} {c.surname} ({c.phone})</option>
              ))}
            </select>

            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
              <option value="">Select Product *</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} - M{p.price} (Stock: {p.quantity})</option>
              ))}
            </select>

            <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} min="1" required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />

            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <button type="submit" style={{ marginTop: '15px', backgroundColor: '#3b82f6', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Add Credit Sale
          </button>
        </form>
      </div>

      {!showPaymentForm ? (
        <button onClick={() => setShowPaymentForm(true)} style={{ backgroundColor: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}>
          Record Payment
        </button>
      ) : (
        <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Record Payment</h2>
          <form onSubmit={recordPayment}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <select value={selectedCredit} onChange={(e) => setSelectedCredit(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                <option value="">Select Credit *</option>
                {credits.filter(c => c.status !== 'Paid').map(c => (
                  <option key={c.id} value={c.id}>
                    {getCustomerName(c.customer_id)} - {c.product_name} - Owes: M{(c.total_amount - c.amount_paid).toFixed(2)}
                  </option>
                ))}
              </select>
              <input type="number" placeholder="Payment Amount *" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ marginTop: '15px' }}>
              <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>Submit Payment</button>
              <button type="button" onClick={() => { setShowPaymentForm(false); setSelectedCredit(null); setPaymentAmount(''); }} style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Active Credits</h2>
      {loading ? <p>Loading...</p> : credits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>No credit sales yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Total (M)</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Paid (M)</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Balance (M)</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Due Date</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
               </tr>
            </thead>
            <tbody>
              {credits.map(c => {
                const balance = c.total_amount - c.amount_paid;
                const isOverdue = balance > 0 && new Date(c.due_date) < new Date();
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: isOverdue ? '#fee2e2' : 'white' }}>
                    <td style={{ padding: '12px' }}>{getCustomerName(c.customer_id)}</td>
                    <td style={{ padding: '12px' }}>{c.product_name}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{c.quantity}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>M{c.total_amount}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>M{c.amount_paid}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: balance > 0 ? '#dc2626' : '#10b981' }}>M{balance}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{c.due_date}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: c.status === 'Paid' ? '#10b981' : (isOverdue ? '#ef4444' : '#f59e0b'),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {c.status === 'Paid' ? 'PAID' : (isOverdue ? 'OVERDUE' : 'ACTIVE')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CreditSales;
