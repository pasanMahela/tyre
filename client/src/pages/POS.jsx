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
  Radio,
} from 'antd';
import { DollarOutlined, ExclamationCircleOutlined, DeleteOutlined, MinusOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;
const { confirm } = Modal;

function POS() {
  const [form] = Form.useForm();
  
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('cartItems');
    return savedItems ? JSON.parse(savedItems) : [];
  });

  const [currentItem, setCurrentItem] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [netValue, setNetValue] = useState(0);
  const [cashPaid, setCashPaid] = useState(0);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState('percentage');

  useEffect(() => {
    const savedTotalAmount = localStorage.getItem('totalAmount');
    const savedDiscount = localStorage.getItem('discount');
    const savedNetValue = localStorage.getItem('netValue');
    const savedCashPaid = localStorage.getItem('cashPaid');
    const savedBalance = localStorage.getItem('balance');

    if (savedTotalAmount) setTotalAmount(parseFloat(savedTotalAmount));
    if (savedDiscount) setDiscount(parseFloat(savedDiscount));
    if (savedNetValue) setNetValue(parseFloat(savedNetValue));
    if (savedCashPaid) setCashPaid(parseFloat(savedCashPaid));
    if (savedBalance) setBalance(parseFloat(savedBalance));
  }, []);

  useEffect(() => {
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
        price: response.data.retailPrice || 0,
      });
      // Focus the quantity field after finding the item
      setTimeout(() => {
        document.getElementById('quantity-input').focus();
      }, 0);
    } catch (error) {
      message.error('Error fetching item details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!currentItem) {
      message.warning('No item selected.');
      return;
    }

    const quantity = form.getFieldValue('quantity') || 1;
    const discountValue = form.getFieldValue('discount') || 0;
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
    const discountAmount =
      discountType === 'percentage'
        ? totalPrice * (discountValue / 100)
        : discountValue;

    const discountedPrice = totalPrice - discountAmount;

    const newItem = {
      ...currentItem,
      quantity,
      discount: discountValue,
      totalPrice: discountedPrice,
      price,
    };

    const existingItemIndex = items.findIndex((item) => item.itemCode === newItem.itemCode);
    let updatedItems;

    if (existingItemIndex >= 0) {
      const existingItem = items[existingItemIndex];
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + newItem.quantity,
        totalPrice: existingItem.totalPrice + newItem.totalPrice,
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

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (form.getFieldValue('itemCode')) {
        // If item code is entered, trigger the search
        handleSearch();
      } else if (currentItem) {
        // If current item exists, add it to the cart
        handleAddItem();
      }
    }
  };

  const handleCashPaidChange = (value) => {
    setCashPaid(value);
    setBalance(value - netValue);
  };

  useEffect(() => {
    const newNetValue = totalAmount - (totalAmount * discount) / 100;
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

        printBill(saleData);

        // Clear the cart and localStorage after successful sale
        setItems([]);
        setTotalAmount(0);
        setDiscount(0);
        setNetValue(0);
        setCashPaid(0);
        setBalance(0);
        form.resetFields();
        
        localStorage.removeItem('cartItems');
        localStorage.removeItem('totalAmount');
        localStorage.removeItem('discount');
        localStorage.removeItem('netValue');
        localStorage.removeItem('cashPaid');
        localStorage.removeItem('balance');
      } catch (error) {
        notification.error({ message: 'Error closing sale.' });
      }
    };

    // Function to handle printing the bill
    const printBill = (saleData) => {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Bill</title>
            <style>
              body { font-family: Arial, sans-serif; }
              h2 { text-align: center; }
              ul { list-style-type: none; padding: 0; }
              li { margin: 5px 0; }
            </style>
          </head>
          <body>
            <h2>Receipt</h2>
            <p>Date: ${saleData.date}</p>
            <p>Payment Type: ${saleData.paymentType}</p>
            <h3>Items:</h3>
            <ul>
              ${saleData.items.map(item => `
                <li>${item.itemName} - Qty: ${item.quantity}, Price: ${item.price.toFixed(2)}, Total: ${item.totalPrice.toFixed(2)}</li>
              `).join('')}
            </ul>
            <h4>Total Amount: ${saleData.totalAmount.toFixed(2)}</h4>
            <h4>Discount: ${saleData.discount.toFixed(2)}</h4>
            <h4>Net Value: ${saleData.netValue.toFixed(2)}</h4>
            <h4>Cash Paid: ${saleData.cashPaid.toFixed(2)}</h4>
            <h4>Balance: ${saleData.balance.toFixed(2)}</h4>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    };

    const handleRemoveItem = (itemCode) => {
      confirm({
        title: 'Are you sure you want to remove this item?',
        icon: <ExclamationCircleOutlined />,
        onOk() {
          const updatedItems = items.filter((item) => item.itemCode !== itemCode);
          setItems(updatedItems);
          const newTotalAmount = updatedItems.reduce((total, item) => total + item.totalPrice, 0);
          setTotalAmount(newTotalAmount);
          setNetValue(newTotalAmount);
        },
      });
    };

    const handleDecreaseQuantity = (itemCode) => {
      const updatedItems = items.map((item) => {
        if (item.itemCode === itemCode && item.quantity > 1) {
          return {
            ...item,
            quantity: item.quantity - 1,
            totalPrice: (item.quantity - 1) * item.price,
          };
        }
        return item;
      }).filter(item => item.quantity > 0);
    
      setItems(updatedItems);
      const newTotalAmount = updatedItems.reduce((total, item) => total + item.totalPrice, 0);
      setTotalAmount(newTotalAmount);
      setNetValue(newTotalAmount);
    };

    const columns = [
      {
        title: <div style={{ backgroundColor: '#1E5DBC', color: 'white', padding: '8px' }}>Code</div>,
        dataIndex: 'itemCode',
        key: 'itemCode',
        width: '10%',
        align: 'left',
      },
      {
        title: <div style={{ backgroundColor: '#1E5DBC', color: 'white', padding: '8px' }}>Item Name</div>,
        dataIndex: 'itemName',
        key: 'itemName',
        width: '30%',
        align: 'left',
      },
      {
        title: <div style={{ backgroundColor: '#1E5DBC', color: 'white', padding: '8px' }}>Price</div>,
        dataIndex: 'price',
        key: 'price',
        width: '10%',
        align: 'right',
        render: (price) => <Text>{price.toFixed(2)}</Text>,
      },
      {
        title: <div style={{ backgroundColor: '#1E5DBC', color: 'white', padding: '8px' }}>Qty</div>,
        dataIndex: 'quantity',
        key: 'quantity',
        width: '10%',
        align: 'right',
      },
      {
        title: <div style={{ backgroundColor: '#1E5DBC', color: 'white', padding: '8px' }}>Discount</div>,
        dataIndex: 'discount',
        key: 'discount',
        width: '10%',
        align: 'right',
      },
      {
        title: <div style={{ backgroundColor: '#1E5DBC', color: 'white', padding: '8px' }}>Total Price</div>,
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        width: '15%',
        align: 'right',
        render: (totalPrice) => <Text>{totalPrice.toFixed(2)}</Text>,
      },
      {
        title: <div style={{ backgroundColor: '#1E5DBC', color: 'white', padding: '8px' }}>Action</div>,
        key: 'actions',
        width: '7%',
        align: 'center',
        render: (_, record) => (
          <Space>
            <Button
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveItem(record.itemCode)}
              style={{ color: 'red' }}
            />
            <Button
              type="link"
              icon={<MinusOutlined />}  // Use Antd MinusOutlined icon
              onClick={() => handleDecreaseQuantity(record.itemCode)}
              style={{ color: 'red' }}
            >
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <div className="container mx-auto p-10 bg-white rounded-lg shadow-lg">
      <Title level={2} className="text-center text-indigo-600 mb-6">
        Point of Sale (POS) Interface
      </Title>
      
      {/* Item Search and Details Section */}
      <Card className="mb-4 p-1 bg-gray-50 rounded-md shadow-md">
        <Row gutter={16}>
          <Col span={8}>
            <Form form={form} layout="inline">
              <Form.Item name="itemCode" label="Item Code">
                <Input 
                  placeholder="Enter item code" 
                  onKeyDown={handleKeyDown} // Add key down handler
                />
              </Form.Item>
              <Button type="primary" onClick={handleSearch} loading={loading}>
                Find Item
              </Button>
            </Form>
          </Col>
          {currentItem && (
            <Card className="bg-white">
              <Form form={form} layout="inline">
                <Form.Item name="itemName" label="Item Name">
                  <Input value={currentItem.itemName} readOnly />
                </Form.Item>
                <Form.Item name="retailPrice" label="Retail Price">
                  <InputNumber min={0} />
                </Form.Item>
                <Form.Item name="quantity" label="Quantity">
                  <InputNumber 
                    id="quantity-input" // Set ID to focus on it later
                    min={1} 
                    onChange={(value) => handlePriceChange(value, form.getFieldValue('retailPrice'))} 
                    onKeyDown={handleKeyDown} // Add key down handler
                  />
                </Form.Item>
                <Form.Item label="Discount">
                  <Radio.Group value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                    <Radio value="percentage">Percentage</Radio>
                    <Radio value="currency">Currency</Radio>
                  </Radio.Group>
                  <InputNumber min={0} />
                </Form.Item>
                <Form.Item label="Price">
                  <InputNumber readOnly value={form.getFieldValue('price')} />
                </Form.Item>
                <Button type="primary" onClick={handleAddItem}>
                  Add to Cart
                </Button>
              </Form>
            </Card>
          )}
        </Row>
      </Card>

        {/* Cart Table Section */}
        <Table
          dataSource={items}
          columns={columns}
          pagination={false}
          size="small"
          rowKey="itemCode"
          rowClassName={() => 'light-blue-row'}  // Add a class for the first row
          footer={() => (
            <div style={{ textAlign: 'right', paddingRight: '82px', paddingTop:'10px' }}> {/* Add padding to footer */}
              <Text strong>Total Amount:</Text> Rs. {totalAmount.toFixed(2)}
            </div>
          )}
        />

        <Divider />

        {/* Payment Section */}
  <Card className="p-1 mt-1">
    <Row gutter={16} justify="end"> {/* Align items to the right */}
      <Col span={24}>
        <Form layout="inline"> {/* Use inline layout for horizontal alignment */}
          <Form.Item label="Total Amount Rs." style={{ marginBottom: 0 }}>
            <InputNumber 
              value={totalAmount.toFixed(2)} 
              readOnly 
              style={{ width: '120px' }} // Set a fixed width for consistency
            />
          </Form.Item>
          <Form.Item label="Discount % / Rs." style={{ marginBottom: 0 }}>
            <InputNumber 
              min={0} 
              value={discount} 
              onChange={setDiscount} 
              style={{ width: '120px' }} // Same fixed width
            />
          </Form.Item>
          <Form.Item label="Net Value Rs." style={{ marginBottom: 0 }}>
            <InputNumber 
              value={netValue.toFixed(2)} 
              readOnly 
              style={{ width: '120px' }} // Same fixed width
            />
          </Form.Item>
          <Form.Item label="Cash Paid Rs." style={{ marginBottom: 0 }}>
            <InputNumber 
              value={cashPaid} 
              min={0} 
              onChange={handleCashPaidChange} 
              style={{ width: '120px' }} // Same fixed width
            />
          </Form.Item>
          <Form.Item label="Balance Rs." style={{ marginBottom: 0 }}>
            <InputNumber 
              value={balance.toFixed(2)} 
              readOnly 
              style={{ width: '120px' }} // Same fixed width
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              onClick={handleCloseSale} 
              disabled={items.length === 0}
            >
              Complete Sale
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  </Card>

      </div>
    );
  }

  export default POS;
