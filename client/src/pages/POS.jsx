import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import { DollarOutlined, ExclamationCircleOutlined, DeleteOutlined, MinusOutlined, PercentageOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;
const { confirm } = Modal;

function POS() {

  const location = useLocation();
  const [notification, setNotification] = useState('');
  
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

  useEffect(() => {
    // Check if the state contains a message from login
    if (location.state?.message) {
      setNotification(location.state.message);

      // Clear the message after a few seconds
      const timer = setTimeout(() => {
        setNotification('');
      }, 3000); // Show for 3 seconds

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [location.state]);

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
    
      const itemRows = saleData.items.map(item => `
        <tr>
          <td>${item.itemName}</td>
          <td>${item.price.toFixed(2)}</td>
          <td>${item.quantity}</td>
          <td>Rs. ${(item.totalPrice).toFixed(2)}</td>
        </tr>
      `).join('');
    
      printWindow.document.write(`
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: 'Poppins', sans-serif;
                margin: 0;
                background-color: #f5f5f5;
                color: #333;
              }
              .invoice-container {
                max-width: 650px;
                margin: 30px auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 10px;
              }
              .header h1 {
                letter-spacing: 4px;
                margin: 0;
                font-weight: 600;
                font-size: 24px;
                color: #444;
              }
              .header p {
                margin: 2px 0;
                font-size: 14px;
                color: #777;
              }
              .invoice-details {
                text-align: right;
                margin: 15px 0;
                font-size: 14px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                background-color: #fdfdfd;
              }
              th, td {
                padding: 12px;
                border-bottom: 1px solid #e0e0e0;
                text-align: left;
              }
              th {
                background-color: #f7f7f7;
                text-transform: uppercase;
                font-size: 12px;
                color: #555;
              }
              .total {
                text-align: right;
                font-weight: bold;
                background-color: #fafafa;
              }
              .summary {
                margin-top: 25px;
                display: flex;
                justify-content: space-between;
                background-color: #f7f7f7;
                padding: 15px;
                border-radius: 8px;
              }
              .summary div {
                display: flex;
                flex-direction: column;
                gap: 5px;
                font-size: 15px;
              }
              .summary div strong {
                font-weight: 600;
                color: #444;
              }
              .summary .value {
                text-align: right;
              }
              .thank-you {
                text-align: center;
                margin-top: 30px;
                font-weight: 600;
                font-size: 16px;
                color: #4CAF50;
              }
              @media print {
                body {
                  background-color: #fff;
                }
                .invoice-container {
                  box-shadow: none;
                  border: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="header">
                <h1>RUHUNU</h1>
                <p>TYRE HOUSE</p>
                <p>New Town Galnewa</p>
                <p>Phone: 025 1111111</p>
              </div>
    
              <div class="invoice-details">
                <p><strong>Date:</strong> ${moment(saleData.date).format('YYYY-MM-DD')}</p>
              </div>
    
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="total">TOTAL</td>
                    <td>Rs. ${saleData.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
    
              <div class="summary">
                <div>
                  <strong>Total:</strong>
                  <strong>Discount:</strong>
                  <strong>Net Total:</strong>
                  <strong>Cash Paid:</strong>
                  <strong>Balance:</strong>
                </div>
                <div class="value">
                  <span>Rs. ${saleData.totalAmount.toFixed(2)}</span>
                  <span>Rs. ${saleData.discount.toFixed(2)}</span>
                  <span>Rs. ${saleData.netValue.toFixed(2)}</span>
                  <span>Rs. ${saleData.cashPaid.toFixed(2)}</span>
                  <span>Rs. ${saleData.balance.toFixed(2)}</span>
                </div>
              </div>
    
              <div class="thank-you">Thank You!</div>
            </div>
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
        {/* Show notification if available */}
      {notification && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{notification}</span>
        </div>
      )}
      <Title level={2} className="text-center text-indigo-600 mb-6">
        Point of Sale (POS) Interface
      </Title>
      
      {/* Item Search and Details Section */}
      <Card className="mb-4 p-1 bg-gray-50 rounded-md shadow-md">
        <Row gutter={16}>
          <Col span={8}>
            <Form form={form} layout="inline" className='mb-2'>
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
              {/* Item Name with increased size */}
              <Form.Item name="itemName" label="Item Name">
                <Input value={currentItem.itemName} readOnly style={{ width: '350px' }} />
              </Form.Item>
          
              {/* Current Stock Label */}
              <Form.Item label="Current Stock">
                <Input value={currentItem.currentStock} readOnly style={{ width: '50px' }} />
              </Form.Item>
          
              {/* Quantity with decreased size */}
              <Form.Item name="quantity" label="Quantity">
                <InputNumber
                  id="quantity-input" // Set ID to focus on it later
                  min={1}
                  onChange={(value) => handlePriceChange(value, form.getFieldValue('retailPrice'))}
                  onKeyDown={handleKeyDown} // Add key down handler
                  style={{ width: '50px' }} // Decreased width
                />
              </Form.Item>
          
              {/* Discount with icons for percentage and currency */}
              <Form.Item label="Discount">
                <Radio.Group value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                  <Radio value="percentage">
                    <PercentageOutlined /> {/* Antd Percentage icon */}
                  </Radio>
                  <Radio value="currency">
                    <DollarOutlined /> {/* Antd Dollar icon */}
                  </Radio>
                </Radio.Group>
                <InputNumber min={0} />
              </Form.Item>
          
              {/* Price with two decimal places */}
              <Form.Item label="Price (Rs.)">
                <InputNumber readOnly style={{ width: '100px' }} value={form.getFieldValue('price')?.toFixed(2)} />
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
