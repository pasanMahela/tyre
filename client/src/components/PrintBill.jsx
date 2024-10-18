import React from 'react';

const PrintBill = ({ saleData }) => {
  return (
    <div>
      <h2>Receipt</h2>
      <p>Date: {saleData.date}</p>
      <p>Payment Type: {saleData.paymentType}</p>
      <h3>Items:</h3>
      <ul>
        {saleData.items.map(item => (
          <li key={item.itemCode}>
            {item.itemName} - Qty: {item.quantity}, Price: {item.price.toFixed(2)}, Total: {item.totalPrice.toFixed(2)}
          </li>
        ))}
      </ul>
      <h4>Total Amount: {saleData.totalAmount.toFixed(2)}</h4>
      <h4>Discount: {saleData.discount.toFixed(2)}</h4>
      <h4>Net Value: {saleData.netValue.toFixed(2)}</h4>
      <h4>Cash Paid: {saleData.cashPaid.toFixed(2)}</h4>
      <h4>Balance: {saleData.balance.toFixed(2)}</h4>
    </div>
  );
};

export default PrintBill;
