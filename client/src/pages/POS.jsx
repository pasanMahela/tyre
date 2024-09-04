import React, { useState } from 'react';
import { Input, Button, Table, Form, InputNumber, message } from 'antd';
import axios from 'axios';

function POS() {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);

  const handleSearch = async () => {
    const itemCode = form.getFieldValue('itemCode');
    if (!itemCode) {
      message.error('Please enter an item code.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/item/view/code/${itemCode}`);
      const fetchedItem = response.data;

      if (!fetchedItem) {
        message.error('Item not found.');
        return;
      }

      setCurrentItem(fetchedItem);
      form.setFieldsValue({ ...fetchedItem, quantity: 1 });
    } catch (error) {
      message.error('Error fetching item details.');
      console.error('Error fetching item:', error);
    }
  };

  const handleAddItem = () => {
    if (!currentItem) return;

    const quantity = form.getFieldValue('quantity');
    if (quantity <= 0) {
      message.error('Quantity must be greater than 0.');
      return;
    }

    const newItem = {
      ...currentItem,
      quantity,
      totalPrice: quantity * currentItem.price,
    };
    setItems([...items, newItem]);
    form.resetFields();
    setCurrentItem(null);
  };

  const handleRemoveItem = (itemCode) => {
    const updatedItems = items.filter(item => item.itemCode !== itemCode);
    setItems(updatedItems);
  };

  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: 'Price Rs.',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Total Price Rs.',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => handleRemoveItem(record.itemCode)}>
          Remove
        </Button>
      ),
    },
  ];

  const totalAmount = items.reduce((total, item) => total + item.totalPrice, 0);

  const handleCloseSale = async () => {
    try {
      const saleData = {
        items,
        totalAmount,
        // Add more fields as required, like customer details, payment method, etc.
      };

      await axios.post('http://localhost:5000/api/sales', saleData);
      message.success('Sale completed successfully!');
      setItems([]); // Clear the cart
    } catch (error) {
      message.error('Error closing sale.');
      console.error('Error closing sale:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-center text-2xl mb-4">Point of Sale (POS) Interface</h2>

      <Form form={form} layout="inline" className="mb-4">
        <Form.Item name="itemCode" label="Item Code">
          <Input placeholder="Enter item code" />
        </Form.Item>
        <Button onClick={handleSearch} type="primary">Find</Button>

        {currentItem && (
          <>
            <Form.Item name="itemName" label="Item Name">
              <Input disabled />
            </Form.Item>
            <Form.Item name="quantity" label="Qty">
              <InputNumber min={1} />
            </Form.Item>
            <Button type="primary" onClick={handleAddItem}>
              Add
            </Button>
          </>
        )}
      </Form>

      <Table dataSource={items} columns={columns} rowKey="itemCode" pagination={false} />

      <div className="mt-4">
        <div className="text-xl mb-2">
          <strong>Gross Value Rs.: </strong>
          {totalAmount.toFixed(2)}
        </div>

        {/* Additional summary details go here */}

        <Button type="primary" className="mt-2" onClick={handleCloseSale}>
          Close Sale & Print
        </Button>
      </div>
    </div>
  );
}

export default POS;
