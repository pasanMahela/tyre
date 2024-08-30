import React, { useState } from 'react';
import { Input, Button, Form, InputNumber, message } from 'antd';
import axios from 'axios';

function StockAdd() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [currentStock, setCurrentStock] = useState(0);

  // Fetch item details based on item code
  const handleSearch = async () => {
    const itemCode = form.getFieldValue('itemCode');
    
    if (!itemCode) {
      message.error('Please enter an item code.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/item/view/code/${itemCode}`);
      if (response.data) {
        form.setFieldsValue({
          itemName: response.data.itemName,
          itemCompany: response.data.itemCompany,
          description: response.data.description,
          lowerLimit: response.data.lowerLimit,
          currentStock: response.data.currentStock,
          purchasePrice: response.data.purchasePrice,
          retailPrice: response.data.retailPrice,
          itemDiscount: response.data.itemDiscount
        });
        setItemId(response.data._id);
        setCurrentStock(response.data.currentStock);
      } else {
        message.error('Item not found.');
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
      message.error('Failed to fetch item details. Please check the item code and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update stock based on form values
  const handleAddToStock = async () => {
    const { newStock, purchasePrice, retailPrice, itemDiscount } = form.getFieldsValue();
    const newStockValue = newStock || 0;
    const totalStock = currentStock + newStockValue;

    if (!itemId) {
      message.error('Item not found. Please search for an item first.');
      return;
    }

    if (newStockValue <= 0) {
      message.error('Please enter a valid stock quantity.');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/item/update/${itemId}`, {
        currentStock: totalStock,
        purchasePrice,
        retailPrice,
        itemDiscount
      });
      message.success(`Stock updated successfully! Total stock: ${totalStock}`);
      form.resetFields();
      setItemId(null);
      setCurrentStock(0);
    } catch (error) {
      console.error('Error updating stock:', error);
      message.error('Failed to update stock. Please try again.');
    }
  };

  // Handle form submission with Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!itemId) {
        handleSearch();
      } else {
        handleAddToStock();
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Add Stocks</h2>
      <Form form={form} layout="vertical" onKeyPress={handleKeyPress}>
        <Form.Item 
          label="Item Code" 
          name="itemCode"
          rules={[{ required: true, message: 'Please enter the item code.' }]}
        >
          <div className="flex">
            <Input 
              className="flex-grow rounded-l-md border-r-0 mr-36"
              disabled={loading}
            />
            <Button 
              onClick={handleSearch} 
              loading={loading}
              className="rounded-r-md"
              tabIndex={0}
            >
              Search
            </Button>
          </div>
        </Form.Item>

        <Form.Item label="Item Name" name="itemName">
          <Input disabled className="rounded-md" />
        </Form.Item>

        <Form.Item label="Item Company" name="itemCompany">
          <Input disabled className="rounded-md" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input disabled className="rounded-md" />
        </Form.Item>

        <Form.Item label="Lower Limit" name="lowerLimit">
          <InputNumber min={0} disabled className="w-full rounded-md" />
        </Form.Item>

        <Form.Item label="Current Stock" name="currentStock">
          <InputNumber min={0} value={currentStock} disabled className="w-full rounded-md" />
        </Form.Item>

        <Form.Item 
          label="Purchase Price Rs." 
          name="purchasePrice"
          rules={[{ type: 'number', min: 0, message: 'Purchase price cannot be negative.' }]}
        >
          <InputNumber min={0} className="w-full rounded-md" />
        </Form.Item>

        <Form.Item 
          label="Retail Price Rs." 
          name="retailPrice"
          rules={[{ type: 'number', min: 0, message: 'Retail price cannot be negative.' }]}
        >
          <InputNumber min={0} className="w-full rounded-md" />
        </Form.Item>

        <Form.Item 
          label="Item Discount %" 
          name="itemDiscount"
          rules={[{ type: 'number', min: 0, max: 100, message: 'Discount must be between 0 and 100.' }]}
        >
          <InputNumber min={0} max={100} className="w-full rounded-md" />
        </Form.Item>

        <Form.Item 
          label="New Stock" 
          name="newStock"
          rules={[{ required: true, type: 'number', min: 1, message: 'Please enter a valid stock quantity.' }]}
        >
          <InputNumber min={1} className="w-full rounded-md" />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            onClick={handleAddToStock} 
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            tabIndex={0}
          >
            Add to Stock
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default StockAdd;
