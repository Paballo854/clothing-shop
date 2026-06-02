import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useLanguage } from './LanguageContext';

function CreditSales() {
  const { translations: t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [credits, setCredits] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [dueDate, setDueDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEditPayment, setShowEditPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadProducts();
    loadCredits();
    loadPayments();
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

  const loadPayments = async () => {
    const { data } = await supabase.from('payments').select('*').order('payment_date', { ascending: false });
    if (data) setPayments(data);
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
      amount: amount,
      payment_date: new Date().toISOString()
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
      alert('Payment of M' + amount + ' recorded! Remaining: M' + newBalance);
      setPaymentAmount('');
      setSelectedCredit(null);
      setShowPaymentForm(false);
      loadCredits();
      loadPayments();
    }
  };

  const startEditPayment = (payment, credit) => {
    setEditingPayment({
      id: payment.id,
      credit_id: payment.credit_id,
      oldAmount: payment.amount,
      newAmount: payment.amount,
      credit: credit
    });
    setShowEditPayment(true);
  };

  const updatePayment = async (e) => {
    e.preventDefault();
    if (!editingPayment) return;

    const amountDiff = editingPayment.newAmount - editingPayment.oldAmount;
    const credit = editingPayment.credit;
    const newAmountPaid = credit.amount_paid + amountDiff;
    const newBalance = credit.total_amount - newAmountPaid;
    const newStatus = newBalance <= 0 ? 'Paid' : 'Active';

    // Update payment amount
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ amount: editingPayment.newAmount })
      .eq('id', editingPayment.id);

    if (paymentError) {
      alert('Error updating payment: ' + paymentError.message);
      return;
    }

    // Update credit
    const { error: updateError } = await supabase
      .from('credits')
      .update({ amount_paid: newAmountPaid, status: newStatus })
      .eq('id', credit.id);

    if (updateError) {
      alert('Error updating credit: ' + updateError.message);
    } else {
      alert('Payment updated! New balance: M' + newBalance);
      setShowEditPayment(false);
      setEditingPayment(null);
      loadCredits();
      loadPayments();
    }
  };

  const deletePayment = async (payment, credit) => {
    if (confirm('Delete this payment? This will increase the customer\'s balance.')) {
      const newAmountPaid = credit.amount_paid - payment.amount;
      const newBalance = credit.total_amount - newAmountPaid;
      const newStatus = newBalance <= 0 ? 'Paid' : 'Active';

      // Delete payment
      const { error: deleteError } = await supabase
        .from('payments')
        .delete()
        .eq('id', payment.id);

      if (deleteError) {
        alert('Error deleting payment: ' + deleteError.message);
        return;
      }

      // Update credit
      const { error: updateError } = await supabase
        .from('credits')
        .update({ amount_paid: newAmountPaid, status: newStatus })
        .eq('id', credit.id);

      if (updateError) {
        alert('Error updating credit: ' + updateError.message);
      } else {
        alert('Payment deleted! Remaining balance: M' + newBalance);
        loadCredits();
        loadPayments();
      }
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.first_name + ' ' + customer.surname : 'Unknown';
  };

  const getPaymentsForCredit = (creditId) => {
    return payments.filter(p => p.credit_id === creditId);
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '20px', color: '#1e293b', marginBottom: '16px' }}>{t.creditSalesTitle}</h1>

      {/* New Credit Sale Form */}
      <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>{t.newCreditSale}</h2>
        <form onSubmit={addCreditSale}>
          <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }}>
            <option value="">{t.selectCustomer} *</option>
            {customers.map(c => (<option key={c.id} value={c.id}>{c.first_name} {c.surname}</option>))}
          </select>

          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }}>
            <option value="">{t.selectProduct} *</option>
            {products.map(p => (<option key={p.id} value={p.id}>{p.name} - M{p.price}</option>))}
          </select>

          <input type="number" placeholder={t.quantity} value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
          <input type="date" placeholder={t.dueDate} value={dueDate} onChange={(e) => setDueDate(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
          <button type="submit" style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>{t.addCreditSale}</button>
        </form>
      </div>

      {/* Record Payment Button */}
      <button onClick={() => setShowPaymentForm(!showPaymentForm)} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
        {showPaymentForm ? t.cancelPayment : t.recordPayment}
      </button>

      {/* Record Payment Form */}
      {showPaymentForm && (
        <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>{t.recordPayment}</h2>
          <form onSubmit={recordPayment}>
            <select value={selectedCredit} onChange={(e) => setSelectedCredit(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }}>
              <option value="">{t.selectCredit} *</option>
              {credits.filter(c => c.status !== 'Paid').map(c => (
                <option key={c.id} value={c.id}>{getCustomerName(c.customer_id)} - {c.product_name} - {t.balance}: M{(c.total_amount - c.amount_paid).toFixed(2)}</option>
              ))}
            </select>
            <input type="number" placeholder={t.paymentAmount + ' *'} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }} />
            <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>{t.submitPayment}</button>
          </form>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditPayment && editingPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowEditPayment(false)}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Edit Payment</h2>
            <form onSubmit={updatePayment}>
              <input
                type="number"
                placeholder="Payment Amount"
                value={editingPayment.newAmount}
                onChange={(e) => setEditingPayment({ ...editingPayment, newAmount: parseFloat(e.target.value) })}
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Update</button>
                <button type="button" onClick={() => setShowEditPayment(false)} style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credits List with Payment History */}
      <h2 style={{ fontSize: '16px', marginBottom: '12px' }}>{t.activeCredits}</h2>
      {loading ? <p>{t.loading}</p> : credits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>{t.noCredits}</div>
      ) : (
        credits.map(c => {
          const balance = c.total_amount - c.amount_paid;
          const isOverdue = balance > 0 && new Date(c.due_date) < new Date();
          const creditPayments = getPaymentsForCredit(c.id);
          
          return (
            <div key={c.id} style={{ backgroundColor: isOverdue ? '#fee2e2' : 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#1e293b' }}>{getCustomerName(c.customer_id)}</span>
                <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '12px', backgroundColor: c.status === 'Paid' ? '#10b981' : (isOverdue ? '#ef4444' : '#f59e0b'), color: 'white' }}>{c.status === 'Paid' ? t.statusPaid : (isOverdue ? t.overdue : t.active)}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{t.product}: {c.product_name} x{c.quantity}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                <span>{t.total}: <strong>M{c.total_amount}</strong></span>
                <span>{t.paid}: <strong>M{c.amount_paid}</strong></span>
                <span style={{ color: '#dc2626' }}>{t.balance}: <strong>M{balance}</strong></span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>{t.due}: {c.due_date}</div>
              
              {/* Payment History */}
              {creditPayments.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Payment History:</div>
                  {creditPayments.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span>M{p.amount} - {new Date(p.payment_date).toLocaleDateString()}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => startEditPayment(p, c)} style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>Edit</button>
                        <button onClick={() => deletePayment(p, c)} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default CreditSales;
