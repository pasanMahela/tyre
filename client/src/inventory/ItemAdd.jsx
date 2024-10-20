import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Modal, Spin, Table, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'; // AntD Icons for Edit and Delete
import axios from 'axios';
import EditItemModal from './EditItemModal';
import 'tailwindcss/tailwind.css'; // Import Tailwind CSS

const { Option } = Select;

function ItemAdd() {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [addedItems, setAddedItems] = useState([]); // List of added items
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null); // Item to edit

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/category/view');
        setCategories(response.data);
      } catch (error) {
        message.error('Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Add new item to backend
  const onFinish = async (values) => {
    setFormLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/item/add', values);
      if (response.status === 201) {
        message.success('Item added successfully!');
        setAddedItems([...addedItems, { ...response.data.item, id: Date.now() }]); // Update state
        form.resetFields(); // Reset form fields
      }
    } catch (error) {
      message.error(`Failed to add item: ${error.response?.data?.message || 'Please try again.'}`);
    } finally {
      setFormLoading(false);
    }
  };

  // Add new category to backend
  const handleAddCategory = async () => {
    if (newCategory) {
      const newCategoryValue = newCategory.toLowerCase().replace(/\s+/g, '');
      try {
        const response = await axios.post('http://localhost:5000/api/category/add', {
          label: newCategory,
          value: newCategoryValue,
        });
        setCategories([...categories, response.data]);
        setNewCategory('');
        setIsModalVisible(false);
        message.success('Category added successfully!');
      } catch (error) {
        message.error('Failed to add category.');
      }
    }
  };

  // Handle editing of an item
  const handleEdit = (item) => {
    setCurrentItem(item);
    setIsEditModalVisible(true);
  };

  // Close the edit modal
  const handleEditClose = () => {
    setIsEditModalVisible(false);
  };

  // Update item in backend and update the list on frontend
  const handleItemUpdated = async (updatedItem) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/item/update/${updatedItem.id}`, updatedItem);
      if (response.status === 200) {
        setAddedItems(addedItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))); // Update state
        message.success('Item updated successfully!');
      } else {
        message.error('Failed to update item in the backend.');
      }
    } catch (error) {
      message.error('Error updating item.');
    } finally {
      setIsEditModalVisible(false);
    }
  };

  // Delete item from backend and update the list on frontend
  const handleDelete = async (itemId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/item/delete/${itemId}`);
      
      if (response.status === 200) {
        // Successfully deleted item, now update the frontend state
        setAddedItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
        message.success('Item deleted successfully!');
      } else {
        message.error('Failed to delete item.');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('Error deleting item.');
    }
  };

  // Table columns including Edit and Delete actions with icons
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
      title: 'Item Company',
      dataIndex: 'itemCompany',
      key: 'itemCompany',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Lower Limit',
      dataIndex: 'lowerLimit',
      key: 'lowerLimit',
    },
    {
      title: 'Item Location',
      dataIndex: 'itemLocation',
      key: 'itemLocation',
    },
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      key: 'barcode',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="link"
          />
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              type="link"
              danger
            />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Item</h2>

      {/* Form for Adding New Items */}
      <Form form={form} layout="horizontal" onFinish={onFinish} className="space-y-8">
        <Form.Item
          label="Item Name"
          name="itemName"
          rules={[{ required: true, message: 'Please input the item name!' }]}
        >
          <Input placeholder="e.g., Widget A" disabled={formLoading} />
        </Form.Item>

        <Form.Item
          label="Item Company"
          name="itemCompany"
          rules={[{ required: true, message: 'Please input the item company!' }]}
        >
          <Input placeholder="e.g., Company X" disabled={formLoading} />
        </Form.Item>

        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: 'Please select a category!' }]}
        >
          {loading ? (
            <Spin />
          ) : (
            <Select placeholder="Select a category" disabled={formLoading}>
              {categories.map((category) => (
                <Option key={category.value} value={category.value}>
                  {category.label}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter a description!' }]}
        >
          <Input placeholder="Brief description of the item" disabled={formLoading} />
        </Form.Item>

        <Form.Item
          label="Lower Limit"
          name="lowerLimit"
          rules={[{ required: true, message: 'Please input the lower limit!' }]}
        >
          <Input type="number" placeholder="e.g., 10" disabled={formLoading} />
        </Form.Item>

        <Form.Item
          label="Item Location"
          name="itemLocation"
          rules={[{ required: true, message: 'Please input the item location!' }]}
        >
          <Input placeholder="e.g., Warehouse A" disabled={formLoading} />
        </Form.Item>

        <Form.Item
          label="Barcode"
          name="barcode"
          rules={[{ required: true, message: 'Please input the barcode!' }]}
        >
          <Input placeholder="e.g., 123456789" disabled={formLoading} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={formLoading}
            className="w-full"
          >
            {formLoading ? 'Adding...' : 'Add New Item'}
          </Button>
        </Form.Item>
      </Form>

      {/* Table to Display Added Items */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">Added Items</h3>
        <Table
          columns={columns}
          dataSource={addedItems}
          pagination={false}
          className="bg-white rounded-lg shadow-md hover:bg-gray-50 transition-all"
          rowClassName={() => 'hover:bg-gray-100'}
        />
      </div>

      {/* Modal for Adding New Category */}
      <Modal
        title="Add New Category"
        open={isModalVisible}
        onOk={handleAddCategory}
        onCancel={() => setIsModalVisible(false)}
        okText="Add"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter new category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          autoFocus
          className="border border-gray-300 rounded px-4 py-2"
        />
      </Modal>

      {/* Modal for Editing Item */}
      <EditItemModal
        visible={isEditModalVisible}
        onClose={handleEditClose}
        item={currentItem}
        onItemUpdated={handleItemUpdated}
      />
    </div>
  );
}

export default ItemAdd;
