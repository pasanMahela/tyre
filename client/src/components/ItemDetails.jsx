// components/ItemDetails.jsx
import React from 'react';
import { Card, Button } from 'antd';

const ItemDetails = ({ item, onEdit }) => {
  return (
    <Card title="Item Details" style={{ marginTop: 20 }}>
      <p><strong>Item Code:</strong> {item.itemCode}</p>
      <p><strong>Item Name:</strong> {item.itemName}</p>
      <p><strong>Item Company:</strong> {item.itemCompany}</p>
      <p><strong>Description:</strong> {item.description}</p>
      <p><strong>Lower Limit:</strong> {item.lowerLimit}</p>
      <p><strong>Current Stock:</strong> {item.currentStock}</p>
      <p><strong>Purchase Price:</strong> {item.purchasePrice}</p>
      <p><strong>Retail Price:</strong> {item.retailPrice}</p>
      <p><strong>Item Discount:</strong> {item.itemDiscount}</p>
      <p><strong>New Stock:</strong> {item.newStock}</p>
      <Button type="primary" onClick={onEdit}>Edit Item</Button>
    </Card>
  );
};

export default ItemDetails;
