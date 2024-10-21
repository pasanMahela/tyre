import React, { useEffect, useState } from 'react';
import { Table, message, Button, Select, Input, Popconfirm, Modal, Form } from 'antd';
import { FaFilter, FaUndo, FaPrint } from 'react-icons/fa';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

function StockView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filterCompany, setFilterCompany] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortKey, setSortKey] = useState('itemCode');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRetailValue, setTotalRetailValue] = useState(0);
  const [totalPurchaseValue, setTotalPurchaseValue] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false); // Updated
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 70,
      render: (text) => (text ? text : '-'),
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 450,
      render: (text) => (text ? text : '-'),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (text) => (text ? text : '-'),
    },
    {
      title: 'Company',
      dataIndex: 'itemCompany',
      key: 'itemCompany',
      width: 130,
      render: (text) => (text ? text : '-'),
    },
    {
      title: 'Purchase Price (Rs.)',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      width: 120,
      render: (text) => (text ? `Rs. ${text}.00` : '-'),
    },
    {
      title: 'Retail Price (Rs.)',
      dataIndex: 'retailPrice',
      key: 'retailPrice',
      width: 120,
      render: (text) => (text ? `Rs. ${text}.00` : '-'),
    },
    {
      title: 'Location',
      dataIndex: 'itemLocation',
      key: 'itemLocation',
      width: 60,
      render: (text) => (text ? text : '-'),
    },
    {
      title: 'Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 60,
      render: (text) => (text !== undefined ? text : '-'),
    },
    {
      title: 'Action',
      key: 'action',
      width: 50,
      render: (text, record) => (
        <div className="flex space-x-2">
          {/* Edit Button */}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
          </Button>

          {/* Delete Button with confirmation */}
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record.itemCode)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/item/list');
        setItems(response.data);
        setFilteredItems(response.data);
        calculateTotalValues(response.data);
        setLoading(false);
      } catch (error) {
        message.error('Failed to fetch items');
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const calculateTotalValues = (items) => {
    let totalRetail = 0;
    let totalPurchase = 0;

    items.forEach((item) => {
      const { retailPrice, purchasePrice, currentStock } = item;

      if (currentStock > 0 && retailPrice > 0 && purchasePrice > 0) {
        totalRetail += retailPrice * currentStock;
        totalPurchase += purchasePrice * currentStock;
      }
    });

    setTotalRetailValue(totalRetail);
    setTotalPurchaseValue(totalPurchase);
  };

  const handleSortChange = (value) => {
    setSortKey(value);
    const sortedData = [...filteredItems].sort((a, b) => {
      if (a[value] === undefined || b[value] === undefined) return 0;
      return a[value].localeCompare(b[value]);
    });
    setFilteredItems(sortedData);
  };

  const applyFilters = () => {
    let filteredData = items;

    if (filterCompany) {
      filteredData = filteredData.filter(
        (item) => item.itemCompany === filterCompany
      );
    }

    if (filterCategory) {
      filteredData = filteredData.filter(
        (item) => item.category === filterCategory
      );
    }

    setFilteredItems(filteredData);
  };

  const handleLowStock = () => {
    const lowStockItems = items.filter(
      (item) => item.currentStock < item.lowerLimit
    );
    setFilteredItems(lowStockItems);
  };

  const resetFilters = () => {
    setFilteredItems(items);
    setFilterCompany('');
    setFilterCategory('');
    setSortKey('itemCode');
    setSearchTerm('');
    calculateTotalValues(items); // Recalculate total values after resetting filters
  };

  const handlePrint = () => {
    window.print(); // Triggers the browser's print dialog
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filteredData = items.filter(
      (item) =>
        item.itemName.toLowerCase().includes(value) ||
        item.itemCode.toLowerCase().includes(value)
    );
    setFilteredItems(filteredData);
  };

  // Handle Edit action
  const handleEdit = (item) => {
    setCurrentEditItem(item);
    setEditModalOpen(true); // Updated
    form.setFieldsValue(item); // Pre-fill the form with current item data
  };

  // Delete Function (use itemId)
const handleDelete = async (itemId) => {
  try {
    await axios.delete(`http://localhost:5000/api/item/delete/${itemId}`);
    const updatedItems = items.filter((item) => item._id !== itemId); // Using _id as MongoDB ID
    setItems(updatedItems);
    setFilteredItems(updatedItems);
    message.success('Item deleted successfully');
  } catch (error) {
    message.error('Failed to delete item');
  }
};


  // Handle form submission for edit
  // Edit Submit Function (use itemId)
const handleEditSubmit = async () => {
  try {
    const values = await form.validateFields();
    await axios.put(`http://localhost:5000/api/item/update/${currentEditItem._id}`, values); // Use _id
    message.success('Item updated successfully');

    const updatedItems = items.map((item) =>
      item._id === currentEditItem._id ? { ...item, ...values } : item // Use _id for comparison
    );
    setItems(updatedItems);
    setFilteredItems(updatedItems);  // Sync both lists
    setEditModalOpen(false);  // Close the modal
  } catch (error) {
    message.error('Failed to update item');
  }
};


  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-4">Stock View</h1>
      <div className="bg-white p-4 rounded-lg shadow-lg max-h-[500px] overflow-y-auto">
        {/* Filter, Sort, and Search Controls */}
        <div className="flex justify-between mb-4">
          <div className="flex space-x-4">
            <Button
              type="primary"
              icon={<FaFilter />}
              onClick={applyFilters}
            >
              Apply Filters
            </Button>
            <Button
              icon={<FaUndo />}
              onClick={resetFilters}
            >
              Reset Filters
            </Button>
            <Select
              placeholder="Filter by Company"
              value={filterCompany}
              onChange={(value) => {
                setFilterCompany(value);
                applyFilters();
              }}
              className="w-40"
            >
              {[...new Set(items.map((item) => item.itemCompany))].map(
                (company) => (
                  <Option key={company} value={company}>
                    {company}
                  </Option>
                )
              )}
            </Select>
            <Select
              placeholder="Filter by Category"
              value={filterCategory}
              onChange={(value) => {
                setFilterCategory(value);
                applyFilters();
              }}
              className="w-40"
            >
              {[...new Set(items.map((item) => item.category))].map(
                (category) => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                )
              )}
            </Select>
            <Select
              placeholder="Sort by"
              value={sortKey}
              onChange={handleSortChange}
              className="w-40"
            >
              <Option value="itemCode">Item Code</Option>
              <Option value="itemName">Item Name</Option>
              <Option value="itemCompany">Company</Option>
              <Option value="category">Category</Option>
              <Option value="itemLocation">Location</Option>
            </Select>
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Search by Name or Code"
              value={searchTerm}
              onChange={handleSearch}
              className="w-64"
            />
            <Button
              type="primary"
              icon={<FaPrint />}
              onClick={handlePrint}
            >
              Print Stock
            </Button>
            <Button type="primary" onClick={handleLowStock}>
              Low Stock
            </Button>
            <Button onClick={resetFilters}>Reset</Button>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="itemCode"
          loading={loading}
          bordered
          size='small'
          className="overflow-hidden"
          scroll={{ x: true }}
          pagination={false}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        title="Edit Item"
        open={editModalOpen} // Updated
        onOk={handleEditSubmit}
        onCancel={() => setEditModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Item Name"
            name="itemName"
            rules={[{ required: true, message: 'Please enter item name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please enter category' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Company"
            name="itemCompany"
            rules={[{ required: true, message: 'Please enter company' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Purchase Price"
            name="purchasePrice"
            rules={[{ required: true, message: 'Please enter purchase price' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Retail Price"
            name="retailPrice"
            rules={[{ required: true, message: 'Please enter retail price' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Current Stock"
            name="currentStock"
            rules={[{ required: true, message: 'Please enter current stock' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Total Stock Value */}
      <div className="bg-white p-4 mt-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold">Total Stock Value</h2>
        <p>Retail Rs. {totalRetailValue.toFixed(2)}</p>
        <p>Purchase Rs. {totalPurchaseValue.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default StockView;
