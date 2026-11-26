import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { State } from 'country-state-city';
import { FaShoppingBag, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

function Purchase() {
  const navigate = useNavigate();

  const companyState = (() => {
    try { return JSON.parse(localStorage.getItem('company'))?.state || ''; } catch { return ''; }
  })();

  const states = State.getStatesOfCountry('IN');
  const [nextBillNo, setNextBillNo] = useState('Loading...');
  const [manualBillNo, setManualBillNo] = useState('');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [parties, setParties] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedParty, setSelectedParty] = useState('');

  const [currentItem, setCurrentItem] = useState({
    itemName: '', itemCode: '', hsnCode: '', qty: 1, pPrice: 0, discount: 0, tax: 0, netAmount: 0
  });

  const [cartItems, setCartItems] = useState([]);
  const [showCreatePartyModal, setShowCreatePartyModal] = useState(false);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const [newParty, setNewParty] = useState({ partyName: '', partyNumber: '', group: 'Sundry Creditor', state: '', address: '' });
  const [newItem, setNewItem] = useState({ itemName: '', itemCode: '', hsnCode: '', uom: 'pc', tax: '0%', pPrice: '', sPrice: '', mrp: '', openingStock: '' });

  const GRAD_PURPLE = "linear-gradient(135deg,#667eea,#764ba2)";

  const fetchData = async () => {
    try {
      const resParties = await axios.get('http://localhost:5000/api/parties');
      const resItems = await axios.get('http://localhost:5000/api/items');
      setParties(resParties.data);
      setAllItems(resItems.data);

      const resBill = await axios.get('http://localhost:5000/api/purchases/next-bill-number');
      setNextBillNo(resBill.data.billNumber);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const calculateNet = (qty, price, discount, tax) => {
    let base = Number(qty) * Number(price);
    let afterDiscount = base - Number(discount);
    let taxAmount = afterDiscount * (Number(tax) / 100);
    let finalAmount = afterDiscount + taxAmount;
    return isNaN(finalAmount) ? 0 : finalAmount.toFixed(2);
  };

  const handleSelectItemDropdown = (e) => {
    const selectedName = e.target.value;
    if (!selectedName) {
      setCurrentItem({ itemName: '', itemCode: '', hsnCode: '', qty: 1, pPrice: 0, discount: 0, tax: 0, netAmount: 0 });
      return;
    }
    const item = allItems.find(i => i.itemName === selectedName);
    if (item) {
      const taxWithoutPercent = String(item.tax).replace('%', '');
      setCurrentItem({
        itemName: item.itemName, itemCode: item.itemCode, hsnCode: item.hsnCode,
        pPrice: item.pPrice, tax: taxWithoutPercent, qty: 1, discount: 0,
        netAmount: calculateNet(1, item.pPrice, 0, taxWithoutPercent)
      });
    }
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    let updatedItem = { ...currentItem, [name]: value };
    updatedItem.netAmount = calculateNet(updatedItem.qty, updatedItem.pPrice, updatedItem.discount, updatedItem.tax);
    setCurrentItem(updatedItem);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    let updatedItem = { ...editingItem, [name]: value };
    updatedItem.netAmount = calculateNet(updatedItem.qty, updatedItem.pPrice, updatedItem.discount, updatedItem.tax);
    setEditingItem(updatedItem);
  };

  const handleAction = () => {
    if (!currentItem.itemName) return alert('Please select an item first!');
    const existingItemIndex = cartItems.findIndex(item => item.itemName === currentItem.itemName);

    if (existingItemIndex !== -1) {
      const updatedCart = [...cartItems];
      const newQty = Number(updatedCart[existingItemIndex].qty) + Number(currentItem.qty);
      const newNetAmount = calculateNet(newQty, updatedCart[existingItemIndex].pPrice, updatedCart[existingItemIndex].discount, updatedCart[existingItemIndex].tax);
      updatedCart[existingItemIndex] = { ...updatedCart[existingItemIndex], qty: newQty, netAmount: newNetAmount };
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, currentItem]);
    }
    setCurrentItem({ itemName: '', itemCode: '', hsnCode: '', qty: 1, pPrice: 0, discount: 0, tax: 0, netAmount: 0 });
  };

  const handleEditClick = (index) => { setEditingItem(cartItems[index]); setEditingIndex(index); setShowUpdateModal(true); };
  const saveUpdatedItem = () => { const updatedCart = [...cartItems]; updatedCart[editingIndex] = editingItem; setCartItems(updatedCart); setShowUpdateModal(false); };
  const handleDeleteClick = (index) => setCartItems(cartItems.filter((_, i) => i !== index));

  const selectedPartyObj = parties.find(p => p.partyName === selectedParty);
  const partyState = selectedPartyObj ? (selectedPartyObj.state || '') : '';
  const isSameState = partyState.trim().toLowerCase() === companyState.trim().toLowerCase();

  const subTotal = cartItems.reduce((sum, item) => sum + (Number(item.qty) * Number(item.pPrice) - Number(item.discount)), 0);
  const gstAmt = cartItems.reduce((sum, item) => sum + ((Number(item.qty) * Number(item.pPrice) - Number(item.discount)) * Number(item.tax)) / 100, 0);

  const cgstAmt = isSameState ? gstAmt / 2 : 0;
  const sgstAmt = isSameState ? gstAmt / 2 : 0;
  const igstAmt = isSameState ? 0 : gstAmt;
  const finalTotal = subTotal + gstAmt;

  const showSubTotal = selectedParty ? subTotal : 0;
  const showFinalTotal = selectedParty ? finalTotal : 0;

  const handleSubmit = async () => {
    if (!selectedParty) return alert('Please select a party!');
    if (cartItems.length === 0) return alert('Please add items to the list!');

    await axios.post('http://localhost:5000/api/purchases', {
      date, partyName: selectedParty, items: cartItems, grandTotal: finalTotal, purchaseBillNo: manualBillNo
    });
    alert('Purchase Saved Successfully!');
    navigate('/dashboard/PurchaseList');
  };

  const saveNewParty = async () => {
    if (!newParty.partyName || !newParty.partyNumber) return alert('Name and Number required!');
    if (!newParty.state) return alert('Please select a state!');
    await axios.post('http://localhost:5000/api/parties', newParty);
    await fetchData();
    setSelectedParty(newParty.partyName);
    setShowCreatePartyModal(false);
    setNewParty({ partyName: '', partyNumber: '', group: 'Sundry Creditor', state: '', address: '' });
  };

  const saveNewItem = async () => {
    if (!newItem.itemName || !newItem.pPrice) return alert('Name and P.Price required!');
    await axios.post('http://localhost:5000/api/items', newItem);
    await fetchData();
    const taxWithoutPercent = newItem.tax.replace('%', '');
    setCurrentItem({
      itemName: newItem.itemName, itemCode: newItem.itemCode, hsnCode: newItem.hsnCode,
      pPrice: newItem.pPrice, tax: taxWithoutPercent, qty: 1, discount: 0,
      netAmount: calculateNet(1, newItem.pPrice, 0, taxWithoutPercent)
    });
    setShowCreateItemModal(false);
    setNewItem({ itemName: '', itemCode: '', hsnCode: '', uom: 'pc', tax: '0%', pPrice: '', sPrice: '', mrp: '', openingStock: '' });
  };

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: GRAD_PURPLE, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(118,75,162,0.3)' }}>
          <FaShoppingBag />
        </div>
        <h2 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>Purchase Entry</h2>
      </div>

      {/* TOP HEADER FORM */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small fw-bold text-secondary">Date</label>
              <input type="date" className="form-control shadow-sm" style={{ borderRadius: '8px' }} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold text-secondary">Party</label>
              <div className="input-group">
                <select className="form-select shadow-sm" style={{ borderRadius: '8px 0 0 8px' }} value={selectedParty} onChange={(e) => setSelectedParty(e.target.value)}>
                  <option value="">Select Party...</option>
                  {parties.filter(p => p.group === 'Sundry Creditor').map(p => <option key={p._id} value={p.partyName}>{p.partyName}</option>)}
                </select>
                <button className="btn text-white" style={{ background: GRAD_PURPLE, borderRadius: '0 8px 8px 0' }} onClick={() => setShowCreatePartyModal(true)}><FaPlus /></button>
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold text-secondary">Auto Bill Number</label>
              <input type="text" className="form-control bg-light fw-bold" style={{ borderRadius: '8px' }} value={nextBillNo} readOnly disabled />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold text-secondary">Purchase Bill No</label>
              <input type="text" className="form-control shadow-sm" style={{ borderRadius: '8px' }} value={manualBillNo} onChange={(e) => setManualBillNo(e.target.value)} placeholder="Enter Bill No" />
            </div>
          </div>
        </div>
      </div>  

      {/* MIDDLE ITEM FORM */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16, background: '#f8f9fa' }}>
        <div className="card-body p-4">
          <div className="mb-3">
            <label className="form-label small fw-bold text-secondary">Select Item to Add</label>
            <div className="input-group">
              <select className="form-select shadow-sm" style={{ borderRadius: '8px 0 0 8px' }} value={currentItem.itemName} onChange={handleSelectItemDropdown}>
                <option value="">Select Item...</option>
                {allItems.map(item => <option key={item._id} value={item.itemName}>{item.itemName}</option>)}
              </select>
              <button className="btn text-white" style={{ background: GRAD_PURPLE, borderRadius: '0 8px 8px 0' }} onClick={() => setShowCreateItemModal(true)}><FaPlus /></button>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-6 col-md-2">
              <label className="form-label small text-muted">Item Code</label>
              <input value={currentItem.itemCode} className="form-control bg-light" readOnly style={{ borderRadius: '6px' }} />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small text-muted">HSN</label>
              <input value={currentItem.hsnCode} className="form-control bg-light" readOnly style={{ borderRadius: '6px' }} />
            </div>
            <div className="col-4 col-md-1">
              <label className="form-label small text-muted">Qty</label>
              <input type="number" name="qty" value={currentItem.qty} onChange={handleItemChange} className="form-control" style={{ borderRadius: '6px' }} />
            </div>
            <div className="col-4 col-md-2">
              <label className="form-label small text-muted">P.Price</label>
              <input type="number" name="pPrice" value={currentItem.pPrice} readOnly className="form-control bg-light" style={{ borderRadius: '6px' }} />
            </div>
            <div className="col-4 col-md-1">
              <label className="form-label small text-muted">Disc</label>
              <input type="number" name="discount" value={currentItem.discount} onChange={handleItemChange} className="form-control" style={{ borderRadius: '6px' }} />
            </div>
            <div className="col-6 col-md-1">
              <label className="form-label small text-muted">Tax%</label>
              <input type="number" name="tax" value={currentItem.tax} onChange={handleItemChange} className="form-control" style={{ borderRadius: '6px' }} />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small text-success fw-bold">Net Amt</label>
              <input value={currentItem.netAmount} readOnly className="form-control fw-bold" style={{ backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '6px', border: '1px solid #bbf7d0' }} />
            </div>
            <div className="col-12 col-md-1 d-flex align-items-end">
              <button onClick={handleAction} className="btn text-white w-100" style={{ background: GRAD_PURPLE, borderRadius: '6px' }}>Add</button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM TABLE */}
      <div className="card border-0 shadow-sm overflow-hidden mb-4" style={{ borderRadius: 16 }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle text-center mb-0">
            <thead style={{ background: "#f7f7fd" }}>
              <tr className="small text-uppercase" style={{ color: "#6b7280" }}>
                <th className="py-3">Item Name</th><th className="py-3">Code</th><th className="py-3">Qty</th><th className="py-3">P.Price</th><th className="py-3">Discount</th><th className="py-3">Tax</th><th className="py-3">Net Amount</th><th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length === 0 ? (
                <tr><td colSpan="8" className="py-5 text-muted">No items added yet.</td></tr>
              ) : (
                cartItems.map((item, index) => (
                  <tr key={index}>
                    <td className="fw-semibold text-dark">{item.itemName}</td><td className="text-muted">{item.itemCode}</td><td>{item.qty}</td>
                    <td>₹{item.pPrice}</td><td>{item.discount}</td><td>{item.tax}%</td>
                    <td className="fw-bold text-success">₹{item.netAmount}</td>
                    <td>
                      <button className="btn btn-sm me-2" style={{ background: '#f3e8ff', color: '#764ba2', border: 'none', borderRadius: '6px' }} onClick={() => handleEditClick(index)}><FaEdit /></button>
                      <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px' }} onClick={() => handleDeleteClick(index)}><FaTrash /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER - TOTAL BOX */}
      <div className="d-flex justify-content-end">
        <div className="card border-0 shadow-sm p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: 16 }}>
          <div className="d-flex justify-content-between mb-2 text-muted">
            <span>Sub Total:</span>
            <span className="fw-semibold text-dark">₹ {showSubTotal.toFixed(2)}</span>
          </div>

          {selectedParty && (
            <>
              <div className="d-flex justify-content-between mb-2 text-muted">
                <span>GST Amt:</span>
                <span className="fw-semibold text-dark">₹ {gstAmt.toFixed(2)}</span>
              </div>
              {isSameState ? (
                <>
                  <div className="d-flex justify-content-between mb-2 text-muted small"><span>CGST Amt:</span><span>₹ {cgstAmt.toFixed(2)}</span></div>
                  <div className="d-flex justify-content-between mb-2 text-muted small"><span>SGST Amt:</span><span>₹ {sgstAmt.toFixed(2)}</span></div>
                </>
              ) : (
                <div className="d-flex justify-content-between mb-2 text-muted small"><span>IGST Amt:</span><span>₹ {igstAmt.toFixed(2)}</span></div>
              )}
            </>
          )}

          <hr />
          <div className="d-flex justify-content-between mb-4 align-items-center">
            <h5 className="mb-0 fw-bold">Grand Total:</h5>
            <h3 className="mb-0 text-success fw-bold">₹ {showFinalTotal.toFixed(2)}</h3>
          </div>

          <button onClick={handleSubmit} className="btn text-white w-100 py-3" style={{ background: GRAD_PURPLE, borderRadius: '10px', fontWeight: '700', fontSize: '1.1rem' }}>
            Submit 
          </button>
        </div>
      </div>

      {/* MODALS */}
      {/* Party Modal */}
      {showCreatePartyModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header text-white" style={{ background: GRAD_PURPLE, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <h5 className="modal-title fw-bold">Create New Party</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreatePartyModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-6"><input className="form-control" style={{ borderRadius: '8px' }} placeholder="Party Name" value={newParty.partyName} onChange={(e) => setNewParty({ ...newParty, partyName: e.target.value })} /></div>
                  <div className="col-6"><input className="form-control" style={{ borderRadius: '8px' }} placeholder="Number" value={newParty.partyNumber} onChange={(e) => setNewParty({ ...newParty, partyNumber: e.target.value })} /></div>
                  <div className="col-6"><select disabled className="form-select bg-light"><option>Sundry Creditor</option></select></div>
                  <div className="col-6">
                    <select className="form-select" style={{ borderRadius: '8px' }} value={newParty.state} onChange={(e) => setNewParty({ ...newParty, state: e.target.value })}>
                      <option value="">Select State</option>
                      {states.map((s) => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="col-12"><input className="form-control" style={{ borderRadius: '8px' }} placeholder="Address" value={newParty.address} onChange={(e) => setNewParty({ ...newParty, address: e.target.value })} /></div>
                </div>
                <div className="d-flex gap-3">
                  <button onClick={saveNewParty} className="btn text-white w-50" style={{ background: GRAD_PURPLE, borderRadius: '8px' }}>Save Party</button>
                  <button onClick={() => setShowCreatePartyModal(false)} className="btn btn-light border w-50" style={{ borderRadius: '8px' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showCreateItemModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '650px' }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header text-white" style={{ background: GRAD_PURPLE, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <h5 className="modal-title fw-bold">Create New Item</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateItemModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-4"><input className="form-control" style={{ borderRadius: '8px' }} placeholder="Item Name" value={newItem.itemName} onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })} /></div>
                  <div className="col-md-4"><input className="form-control" style={{ borderRadius: '8px' }} placeholder="Code" value={newItem.itemCode} onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })} /></div>
                  <div className="col-md-4"><input className="form-control" style={{ borderRadius: '8px' }} placeholder="HSN" value={newItem.hsnCode} onChange={(e) => setNewItem({ ...newItem, hsnCode: e.target.value })} /></div>
                  <div className="col-md-6"><select className="form-select" style={{ borderRadius: '8px' }} value={newItem.uom} onChange={(e) => setNewItem({ ...newItem, uom: e.target.value })}><option value="pc">pc</option><option value="Nos">Nos</option><option value="Kg">Kg</option><option value="Lit">Lit</option><option value="Box">Box</option></select></div>
                  <div className="col-md-6"><select className="form-select" style={{ borderRadius: '8px' }} value={newItem.tax} onChange={(e) => setNewItem({ ...newItem, tax: e.target.value })}><option value="0%">0%</option><option value="5%">5%</option><option value="12%">12%</option><option value="18%">18%</option><option value="28%">28%</option></select></div>
                  <div className="col-md-3"><input type="number" className="form-control" style={{ borderRadius: '8px' }} placeholder="P.Price" value={newItem.pPrice} onChange={(e) => setNewItem({ ...newItem, pPrice: e.target.value })} /></div>
                  <div className="col-md-3"><input type="number" className="form-control" style={{ borderRadius: '8px' }} placeholder="S.Price" value={newItem.sPrice} onChange={(e) => setNewItem({ ...newItem, sPrice: e.target.value })} /></div>
                  <div className="col-md-3"><input type="number" className="form-control" style={{ borderRadius: '8px' }} placeholder="MRP" value={newItem.mrp} onChange={(e) => setNewItem({ ...newItem, mrp: e.target.value })} /></div>
                  <div className="col-md-3"><input type="number" className="form-control" style={{ borderRadius: '8px' }} placeholder="Stock" value={newItem.openingStock} onChange={(e) => setNewItem({ ...newItem, openingStock: e.target.value })} /></div>
                </div>
                <div className="d-flex gap-3">
                  <button onClick={saveNewItem} className="btn text-white w-50" style={{ background: GRAD_PURPLE, borderRadius: '8px' }}>Save Item</button>
                  <button onClick={() => setShowCreateItemModal(false)} className="btn btn-light border w-50" style={{ borderRadius: '8px' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && editingItem && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header text-white" style={{ background: GRAD_PURPLE, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <h5 className="modal-title fw-bold">Update: {editingItem.itemName}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowUpdateModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-6"><label className="small fw-bold text-secondary">Qty</label><input type="number" name="qty" value={editingItem.qty} onChange={handleEditChange} className="form-control" style={{ borderRadius: '8px' }} /></div>
                  <div className="col-6"><label className="small fw-bold text-secondary">Discount</label><input type="number" name="discount" value={editingItem.discount} onChange={handleEditChange} className="form-control" style={{ borderRadius: '8px' }} /></div>
                  <div className="col-6"><label className="small fw-bold text-secondary">Tax (%)</label><input type="number" name="tax" value={editingItem.tax} onChange={handleEditChange} className="form-control" style={{ borderRadius: '8px' }} /></div>
                  <div className="col-6"><label className="small fw-bold text-success">Net Amount</label><input value={editingItem.netAmount} readOnly className="form-control fw-bold" style={{ backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '8px', border: '1px solid #bbf7d0' }} /></div>
                </div>
                <div className="d-flex gap-3">
                  <button onClick={saveUpdatedItem} className="btn text-white w-50" style={{ background: GRAD_PURPLE, borderRadius: '8px' }}>Save Changes</button>
                  <button onClick={() => setShowUpdateModal(false)} className="btn btn-light border w-50" style={{ borderRadius: '8px' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Purchase;