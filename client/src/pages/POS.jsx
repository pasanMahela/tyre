import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Table,
  Form,
  InputNumber,
  message,
  Typography,
  Space,
  Modal,
  Card,
  Row,
  Col,
  Divider,
  notification,
  Spin
} from 'antd';
import { DollarOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;
const { confirm } = Modal;

function POS() {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [netValue, setNetValue] = useState(0);
  const [cashPaid, setCashPaid] = useState(0);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved cart data from localStorage on mount
    const savedItems = localStorage.getItem('cartItems');
    const savedTotalAmount = localStorage.getItem('totalAmount');
    const savedDiscount = localStorage.getItem('discount');
    const savedNetValue = localStorage.getItem('netValue');
    const savedCashPaid = localStorage.getItem('cashPaid');
    const savedBalance = localStorage.getItem('balance');

    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedTotalAmount) setTotalAmount(parseFloat(savedTotalAmount));
    if (savedDiscount) setDiscount(parseFloat(savedDiscount));
    if (savedNetValue) setNetValue(parseFloat(savedNetValue));
    if (savedCashPaid) setCashPaid(parseFloat(savedCashPaid));
    if (savedBalance) setBalance(parseFloat(savedBalance));
  }, []);

  useEffect(() => {
    // Save cart data to localStorage on state change
    localStorage.setItem('cartItems', JSON.stringify(items));
    localStorage.setItem('totalAmount', totalAmount.toString());
    localStorage.setItem('discount', discount.toString());
    localStorage.setItem('netValue', netValue.toString());
    localStorage.setItem('cashPaid', cashPaid.toString());
    localStorage.setItem('balance', balance.toString());
  }, [items, totalAmount, discount, netValue, cashPaid, balance]);

  const handleSearch = async () => {
    const itemCode = form.getFieldValue('itemCode');
    if (!itemCode) {
      message.error('Please enter an item code.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/item/view/code/${itemCode}`);
      setCurrentItem(response.data);
      form.setFieldsValue({
        quantity: 1,
        discount: 0,
        price: response.data.retailPrice || 0
      });
    } catch (error) {
      message.error('Error fetching item details.');
    } finally {
      setLoading(false);
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

    const existingItemIndex = items.findIndex(item => item.itemCode === newItem.itemCode);
    let updatedItems;

    if (existingItemIndex >= 0) {
      const existingItem = items[existingItemIndex];
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + newItem.quantity,
        totalPrice: existingItem.totalPrice + newItem.totalPrice
      };
      updatedItems = [...items];
      updatedItems[existingItemIndex] = updatedItem;
    } else {
      updatedItems = [...items, newItem];
    }

    setItems(updatedItems);
    const newTotalAmount = updatedItems.reduce((total, item) => total + item.totalPrice, 0);
    setTotalAmount(newTotalAmount);
    setNetValue(newTotalAmount);
    form.resetFields();
    setCurrentItem(null);
  };

  const handleRemoveItem = (itemCode) => {
    confirm({
      title: 'Are you sure you want to remove this item?',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        const updatedItems = items.filter(item => item.itemCode !== itemCode);
        setItems(updatedItems);
        const newTotalAmount = updatedItems.reduce((total, item) => total + item.totalPrice, 0);
        setTotalAmount(newTotalAmount);
        setNetValue(newTotalAmount);
      }
    });
  };

  const handleCashPaidChange = (value) => {
    setCashPaid(value);
    setBalance(value - netValue);
  };

  useEffect(() => {
    const newNetValue = totalAmount - (totalAmount * discount / 100);
    setNetValue(newNetValue);
    setBalance(cashPaid - newNetValue);
  }, [totalAmount, discount, cashPaid]);

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
        paymentType: 'Cash',
      };

      await axios.post('http://localhost:5000/api/sales', saleData);
      notification.success({ message: 'Sale completed successfully!' });

      setItems([]);
      form.resetFields();
      setTotalAmount(0);
      setDiscount(0);
      setNetValue(0);
      setCashPaid(0);
      setBalance(0);
    } catch (error) {
      notification.error({ message: 'Error closing sale.' });
    }
  };

  const columns = [
    { title: 'Item Code', dataIndex: 'itemCode', key: 'itemCode', align: 'center' },
    { title: 'Item Name', dataIndex: 'itemName', key: 'itemName', align: 'center' },
    { title: 'Price Rs.', dataIndex: 'price', key: 'price', align: 'center', render: price => <Text>{price.toFixed(2)}</Text> },
    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    { title: 'Discount (%)', dataIndex: 'discount', key: 'discount', align: 'center' },
    { title: 'Total Price Rs.', dataIndex: 'totalPrice', key: 'totalPrice', align: 'center', render: totalPrice => <Text>{totalPrice.toFixed(2)}</Text> },
    { title: 'Actions', key: 'actions', align: 'center', render: (_, record) => (
        <Button type="link" danger onClick={() => handleRemoveItem(record.itemCode)}>Remove</Button>
      )
    }
  ];

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
      <Title level={2} className="text-center text-indigo-600 mb-6">Point of Sale (POS) Interface</Title>
      <Card>
        <Row gutter={16}>
          <Col span={8}>
            <Form form={form} layout="inline">
              <Form.Item name="itemCode" label="Item Code">
                <Input placeholder="Enter item code" />
              </Form.Item>
              <Button type="primary" onClick={handleSearch} loading={loading} disabled={loading}>
                {loading ? <LoadingOutlined /> : 'Find'}
              </Button>
            </Form>
            {currentItem && (
               <Card className="mb-4 p-4 bg-gray-50 rounded-md shadow-md">
               <Form layout="inline" className="w-full space-y-4">
                 <div className="flex items-center justify-between w-full">
                   <Text type="secondary" className="mr-4">
                     <strong>Stock Available:</strong> {currentItem.currentStock}
                   </Text>
                   <Form.Item label="Item Name" className="flex-1">
                     <Input disabled value={currentItem.itemName} className="w-full bg-gray-100 rounded" />
                   </Form.Item>
                 </div>
                 <div className="flex items-center justify-between w-full space-x-4">
                   <Form.Item label="Price Rs." className="w-1/4">
                     <InputNumber min={1} value={currentItem.retailPrice} name="price" className="w-full rounded-md" />
                   </Form.Item>
                   <Form.Item name="quantity" label="Qty" className="w-1/4">
                     <InputNumber min={1} className="w-full rounded-md" />
                   </Form.Item>
                   <Form.Item name="discount" label="Discount (%)" className="w-1/4">
                     <InputNumber min={0} max={100} className="w-full rounded-md" />
                   </Form.Item>
                   <Button type="primary" onClick={handleAddItem} className="w-1/4 bg-indigo-600 hover:bg-indigo-700 rounded-md">
                     Add
                   </Button>
                 </div>
               </Form>
             </Card>
             
            )}
          </Col>
          <Col span={16}>
            <Table columns={columns} dataSource={items} rowKey="itemCode" pagination={false} summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={4} align="right">
                    <Text strong>Total Amount Rs.:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="center">
                    <Text>{totalAmount.toFixed(2)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )} />
          </Col>
        </Row>
      </Card>
      <Divider />
      <Card>
        <Form layout="inline">
          <Form.Item label="Discount (%)">
            <InputNumber min={0} max={100} value={discount} onChange={setDiscount} />
          </Form.Item>
          <Form.Item label="Cash Paid Rs.">
            <InputNumber min={0} value={cashPaid} onChange={handleCashPaidChange} />
          </Form.Item>
          <Form.Item label="Balance Rs.">
            <Text>{balance.toFixed(2)}</Text>
          </Form.Item>
        </Form>
        <Button type="primary" onClick={handleCloseSale} icon={<DollarOutlined />} className="bg-green-500 hover:bg-green-600 mt-4">
          Close Sale
        </Button>
      </Card>
    </div>
  );
}

export default POS;
