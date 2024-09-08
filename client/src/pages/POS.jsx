import React, { useState, useEffect } from 'react';
import { Input, Button, Table, Form, InputNumber, message, Typography } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;

function POS() {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [netValue, setNetValue] = useState(0);
  const [cashPaid, setCashPaid] = useState(0);
  const [balance, setBalance] = useState(0);

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
        message.error('Wrong item number.');
        return;
      }

      setCurrentItem(fetchedItem);
      form.setFieldsValue({ 
        quantity: 1, 
        discount: 0, 
        price: fetchedItem.retailPrice || 0 
      });
    } catch (error) {
      message.error('Error fetching item details.');
      console.error('Error fetching item:', error);
    }
  };

  const handleAddItem = () => {
    if (!currentItem) {
      message.warning("No item selected.");
      return;
    }

    const quantity = form.getFieldValue('quantity') || 1;
    const discount = form.getFieldValue('discount') || 0;
    const price = form.getFieldValue('price') || currentItem.retailPrice || 0;

    if (quantity <= 0 || price <= 0) {
      message.error('Price and quantity must be greater than 0.');
      return;
    }

    // Check if stock is available
    if (quantity > currentItem.currentStock) {
      message.error('Insufficient stock available.');
      return;
    }

    const totalPrice = quantity * price;
    const discountedPrice = totalPrice - (totalPrice * discount / 100);

    const newItem = {
      ...currentItem,
      quantity,
      discount,
      totalPrice: discountedPrice,
      price,
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);

    const newTotalAmount = updatedItems.reduce((total, item) => total + item.totalPrice, 0);
    setTotalAmount(newTotalAmount);
    setNetValue(newTotalAmount); // Keep net value as the sum of all item prices (already discounted individually)
    form.resetFields();
    setCurrentItem(null);
  };

  const handleRemoveItem = (itemCode) => {
    const updatedItems = items.filter(item => item.itemCode !== itemCode);
    setItems(updatedItems);
    const newTotalAmount = updatedItems.reduce((total, item) => total + item.totalPrice, 0);
    setTotalAmount(newTotalAmount);
    setNetValue(newTotalAmount); // Recalculate net value based on updated items
  };

  const handleCashPaidChange = (value) => {
    setCashPaid(value);
    setBalance(value - netValue);
  };

  useEffect(() => {
    const newNetValue = totalAmount - (totalAmount * discount / 100); // Apply global discount if needed
    setNetValue(newNetValue);
    setBalance(cashPaid - newNetValue);
  }, [totalAmount, discount, cashPaid]);

  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      align: 'center',
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      align: 'center',
    },
    {
      title: 'Price Rs.',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      render: (price) => <Text>{price.toFixed(2)}</Text>,
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'Discount (%)',
      dataIndex: 'discount',
      key: 'discount',
      align: 'center',
    },
    {
      title: 'Total Price Rs.',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'center',
      render: (totalPrice) => <Text>{totalPrice.toFixed(2)}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Button type="link" danger onClick={() => handleRemoveItem(record.itemCode)}>
          Remove
        </Button>
      ),
    },
  ];

  const handleCloseSale = async () => {
    if (cashPaid < netValue) {
      message.error('Insufficient payment.');
      return;
    }

    try {
      const saleData = {
        items,
        totalAmount,
        discount,
        netValue,
        cashPaid,
        balance,
        date: moment().format('YYYY-MM-DD'),
      };

      await axios.post('http://localhost:5000/api/sales', saleData);
      message.success('Sale completed successfully!');
      setItems([]); // Clear the cart
      form.resetFields();
      setTotalAmount(0);
      setDiscount(0);
      setNetValue(0);
      setCashPaid(0);
      setBalance(0);
    } catch (error) {
      message.error('Error closing sale.');
      console.error('Error closing sale:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <Title level={2} className="text-center mb-6 text-indigo-600">
        Point of Sale (POS) Interface
      </Title>

      <Form form={form} layout="inline" className="mb-4 space-x-4">
        <Form.Item name="itemCode" label="Item Code">
          <Input placeholder="Enter item code" className="rounded-md" />
        </Form.Item>
        <Button onClick={handleSearch} type="primary" className="rounded-md bg-indigo-500 hover:bg-indigo-600">
          Find
        </Button>

        {currentItem && (
          <>
            <Form.Item name="itemName" label="Item Name">
              <Input disabled value={currentItem.itemName} className="rounded-md" />
            </Form.Item>
            <Form.Item label="Price Rs.">
              <InputNumber min={1} value={currentItem.retailPrice} name="price" />
            </Form.Item>
            <Form.Item name="quantity" label="Qty">
              <InputNumber min={1} className="rounded-md" />
            </Form.Item>
            <Form.Item name="discount" label="Discount (%)">
              <InputNumber min={0} max={100} className="rounded-md" />
            </Form.Item>
            <Button type="primary" onClick={handleAddItem} className="rounded-md bg-indigo-500 hover:bg-indigo-600">
              Add
            </Button>
          </>
        )}
      </Form>

      <Table dataSource={items} columns={columns} rowKey="itemCode" pagination={false} />

      <div className="mt-6">
        <div className="mb-4 text-lg">
          <Text strong>Gross Value Rs.: </Text>{totalAmount ? totalAmount.toFixed(2) : '0.00'}
        </div>

        <Form.Item label="Discount (%)">
          <InputNumber value={discount} onChange={setDiscount} className="rounded-md" />
        </Form.Item>

        <div className="mb-4 text-lg">
          <Text strong>Net Value Rs.: </Text>{netValue ? netValue.toFixed(2) : '0.00'}
        </div>

        <Form.Item label="Customer Name">
          <Input placeholder="Enter customer name" className="rounded-md" />
        </Form.Item>

        <Form.Item label="Cash Paid Rs.">
          <InputNumber value={cashPaid} onChange={handleCashPaidChange} className="rounded-md" />
        </Form.Item>

        <div className="mb-4 text-lg">
          <Text strong>Balance Rs.: </Text>{balance ? balance.toFixed(2) : '0.00'}
        </div>

        <Button 
          onClick={handleCloseSale} 
          type="primary" 
          disabled={items.length === 0} 
          className="rounded-md bg-indigo-500 hover:bg-indigo-600"
        >
          Sale & Print
        </Button>
      </div>
    </div>
  );
}

export default POS;
