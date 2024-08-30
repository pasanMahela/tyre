import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import axios from 'axios';

const EditItemModal = ({ visible, onClose, item, onItemUpdated }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (item) {
      form.setFieldsValue(item);
    }
  }, [item, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const response = await axios.put(`http://localhost:5000/api/item/update/${item._id}`, values);
      if (response.status === 200) {
        message.success('Item updated successfully!');
        onItemUpdated(response.data.item);
        onClose();
      }
    } catch (error) {
      message.error('Failed to update item.');
      console.error('Error updating item:', error);
    }
  };

  return (
    <Modal
      title="Edit Item"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      okText="Update"
      cancelText="Cancel"
    >
      <Form form={form} layout="horizontal">
        <Form.Item name="itemName" label="Item Name" rules={[{ required: true, message: 'Please input the item name!' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="itemCompany" label="Item Company" rules={[{ required: true, message: 'Please input the item company!' }]}>
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
    </Modal>
  );
};

export default EditItemModal;
