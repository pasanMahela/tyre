import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Modal, Spin, Tooltip, Table } from 'antd';
import axios from 'axios';
import EditItemModal from './EditItemModal';
import 'tailwindcss/tailwind.css'; // Import Tailwind CSS

const { Option } = Select;

function ItemAdd() {
  const [form] = Form.useForm(); // Create an instance of the AntD form
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [addedItem, setAddedItem] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/category/view');
        setCategories(response.data);
      } catch (error) {
        message.error('Failed to load categories.');
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const onFinish = async (values) => {
    setFormLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/item/add', values);
      if (response.status === 201) {
        message.success('Item added successfully!');
        setAddedItem(response.data.item);
        form.resetFields(); // Reset the form fields
      }
    } catch (error) {
      message.error('Failed to add item. Please try again.');
      console.error('Error adding the item:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const showAddCategoryModal = () => {
    setIsModalVisible(true);
  };

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
        console.error('Error adding the category:', error);
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleEdit = () => {
    setIsEditModalVisible(true);
  };

  const handleEditClose = () => {
    setIsEditModalVisible(false);
  };

  const handleItemUpdated = (updatedItem) => {
    setAddedItem(updatedItem);
    message.success('Item updated successfully!');
  };

  // Define columns for the table
  const columns = [
    {
      title: 'Field',
      dataIndex: 'field',
      key: 'field',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
    },
  ];

  // Transform the added item details into a table-friendly format
  const data = addedItem
    ? [
        { key: '1', field: 'Item Code', value: addedItem.itemCode },
        { key: '2', field: 'Item Name', value: addedItem.itemName },
        { key: '3', field: 'Item Company', value: addedItem.itemCompany },
        { key: '4', field: 'Category', value: addedItem.category },
        { key: '5', field: 'Description', value: addedItem.description },
        { key: '6', field: 'Lower Limit', value: addedItem.lowerLimit },
        { key: '7', field: 'Item Location', value: addedItem.itemLocation },
        { key: '8', field: 'Barcode', value: addedItem.barcode },
      ]
    : [];

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Item</h2>
      <div className="flex flex-col md:flex-row gap-60">
        {/* Form Column */}
        <div className="w-full md:w-1/2">
        <h3 className="text-xl font-semibold mb-4">Add new item</h3>
          <Form form={form} layout="horizontal" onFinish={onFinish} className="space-y-8">
            <Form.Item
              label={<Tooltip title="Enter the name of the item">Item Name</Tooltip>}
              name="itemName"
              rules={[{ required: true, message: 'Please input the item name!' }]}
            >
              <Input
                placeholder="e.g., Widget A"
                disabled={formLoading}
                className="border border-gray-300 rounded px-4 py-2"
              />
            </Form.Item>

            <Form.Item
              label={<Tooltip title="Enter the company name for the item">Item Company</Tooltip>}
              name="itemCompany"
              rules={[{ required: true, message: 'Please input the item company!' }]}
            >
              <Input
                placeholder="e.g., Company X"
                disabled={formLoading}
                className="border border-gray-300 rounded px-4 py-2"
              />
            </Form.Item>

            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: 'Please select a category!' }]}
            >
              {loading ? (
                <Spin />
              ) : (
                <Select
                  placeholder="Select a category"
                  disabled={formLoading}
                  className="w-full"
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <div className="p-2">
                        <Button type="link" onClick={showAddCategoryModal}>
                          Add New Category
                        </Button>
                      </div>
                    </>
                  )}
                >
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
              <Input
                placeholder="Brief description of the item"
                disabled={formLoading}
                className="border border-gray-300 rounded px-4 py-2"
              />
            </Form.Item>

            <Form.Item
              label="Lower Limit"
              name="lowerLimit"
              rules={[{ required: true, message: 'Please input the lower limit!' }]}
            >
              <Input
                type="number"
                placeholder="e.g., 10"
                disabled={formLoading}
                className="border border-gray-300 rounded px-4 py-2"
              />
            </Form.Item>

            <Form.Item
              label="Item Location"
              name="itemLocation"
              rules={[{ required: true, message: 'Please input the item location!' }]}
            >
              <Input
                placeholder="e.g., Warehouse A"
                disabled={formLoading}
                className="border border-gray-300 rounded px-4 py-2"
              />
            </Form.Item>

            <Form.Item
              label="Barcode"
              name="barcode"
              rules={[{ required: true, message: 'Please input the barcode!' }]}
            >
              <Input
                placeholder="e.g., 123456789"
                disabled={formLoading}
                className="border border-gray-300 rounded px-4 py-2"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={formLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
              >
                {formLoading ? 'Adding...' : 'Add New Item'}
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Table Column */}
        <div className="w-full md:w-1/2">
          {addedItem ? (
            <>
              <h3 className="text-xl font-semibold mb-4">Added Item Details</h3>
              <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                className="bg-white rounded-lg shadow-md"
              />
              <div className="flex justify-between mt-4">
                <div className="flex-1"></div> {/* Empty div to push the button */}
                <Button
                  onClick={handleEdit}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 rounded"
                >
                  Edit
                </Button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No item added yet.</p>
          )}
        </div>
      </div>

      <Modal
        title="Add New Category"
        open={isModalVisible}
        onOk={handleAddCategory}
        onCancel={handleCancel}
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

      <EditItemModal
        visible={isEditModalVisible}
        onClose={handleEditClose}
        item={addedItem}
        onItemUpdated={handleItemUpdated}
      />
    </div>
  );
}

export default ItemAdd;
