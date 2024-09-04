import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Modal, message } from 'antd';

function ItemEdit({ onUpdate = () => {}, onDelete = () => {} }) {
  const [form] = Form.useForm();
  const [itemCode, setItemCode] = useState('');
  const [searchedItem, setSearchedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/item/view/code/${itemCode}`);
      const foundItem = response.data;
      if (foundItem) {
        setSearchedItem(foundItem);
        form.setFieldsValue(foundItem);
        console.log('Found item:', foundItem); // Debugging
      } else {
        Modal.error({
          title: 'Item Not Found',
          content: `No item found with code ${itemCode}`,
        });
        form.resetFields();
        setSearchedItem(null);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      Modal.error({
        title: 'Error',
        content: 'An error occurred while searching for the item.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!searchedItem || !searchedItem._id) {
        throw new Error('No item ID available for update.');
      }
      const values = await form.validateFields();
      await axios.put(`http://localhost:5000/api/item/update/${searchedItem._id}`, values);
      message.success('Item updated successfully!');
      onUpdate({ ...searchedItem, ...values });
      form.resetFields();
      setSearchedItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      Modal.error({
        title: 'Error',
        content: error.message || 'An error occurred while updating the item.',
      });
    }
  };

  const handleDelete = () => {
    if (searchedItem && searchedItem._id) {
      Modal.confirm({
        title: 'Are you sure you want to delete this item?',
        onOk: async () => {
          try {
            await axios.delete(`http://localhost:5000/api/item/delete/${searchedItem._id}`);
            message.success('Item deleted successfully!');
            onDelete(searchedItem._id);
            form.resetFields();
            setSearchedItem(null);
          } catch (error) {
            console.error('Error deleting item:', error);
            Modal.error({
              title: 'Error',
              content: 'An error occurred while deleting the item.',
            });
          }
        },
        okText: 'Yes',
        cancelText: 'No',
      });
    } else {
      Modal.error({
        title: 'No Item Selected',
        content: 'Please search for an item to delete.',
      });
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Search Item</h2>

      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="Enter Item Code"
          value={itemCode}
          onChange={(e) => setItemCode(e.target.value)}
          className="rounded border-gray-300"
        />
        <Button type="primary" onClick={handleSearch} loading={loading}>
          Search
        </Button>
      </div>

      <Form form={form} layout="horizontal" disabled={!searchedItem}>
        <Form.Item
          name="itemName"
          label="Item Name"
          rules={[{ required: true, message: 'Please input the item name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="itemCompany"
          label="Item Company"
          rules={[{ required: true, message: 'Please input the item company!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="category" label="Category">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input />
        </Form.Item>
        <Form.Item name="lowerLimit" label="Lower Limit">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="itemLocation" label="Item Location">
          <Input />
        </Form.Item>
        <Form.Item name="barcode" label="Barcode">
          <Input />
        </Form.Item>
      </Form>

      <div className="flex justify-end space-x-2 mt-4">
        <Button type="primary" onClick={handleUpdate} disabled={!searchedItem}>
          Update
        </Button>
        <Button danger onClick={handleDelete} disabled={!searchedItem}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export default ItemEdit;
