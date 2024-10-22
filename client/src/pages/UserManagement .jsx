import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Table, Modal, notification } from 'antd';
import { AiOutlineUserAdd, AiFillEdit, AiFillDelete } from 'react-icons/ai';
import { motion } from 'framer-motion';
import axios from 'axios'; // Import axios

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm(); // Form instance for resetting

  const { confirm } = Modal;

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
    });
  };

  // Fetch users from the backend API
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users/list');
      setUsers(response.data);
    } catch (error) {
      openNotification('error', 'Fetch Error', 'Failed to load users.');
    }
  };

  // Add or update a user
  const handleAddOrEditUser = async (values) => {
    const updateUser = async () => {
      if (editingUser) {
        try {
          await axios.put(`http://localhost:5000/users/update/${editingUser.id}`, values);
          openNotification('success', 'User Updated', `User ${values.username} has been successfully updated.`);
          fetchUsers();
        } catch (error) {
          openNotification('error', 'Update Error', 'Failed to update the user.');
        }
      } else {
        try {
          await axios.post('http://localhost:5000/users/add', values);
          openNotification('success', 'User Created', `User ${values.username} has been successfully created.`);
          form.resetFields(); // Reset form after creating a user
          fetchUsers();
        } catch (error) {
          openNotification('error', 'Creation Error', 'Failed to create a user.');
        }
      }
      setIsModalOpen(false);
      setEditingUser(null);
    };

    if (editingUser) {
      confirm({
        title: 'Confirm Update',
        content: `Are you sure you want to update the user ${values.username}?`,
        onOk() {
          updateUser();
        },
      });
    } else {
      updateUser(); // No confirmation needed for adding
    }
  };

  // Edit user
  const handleEditUser = (record) => {
    setEditingUser(record);
    setIsModalOpen(true);
    form.setFieldsValue(record); // Populate form with selected user details
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    const userToDelete = users.find((user) => user.id === id);

    confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete user ${userToDelete.username}?`,
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5000/users/delete/${id}`);
          openNotification('success', 'User Deleted', `User ${userToDelete.username} has been successfully deleted.`);
          fetchUsers(); // Refresh the user list
        } catch (error) {
          openNotification('error', 'Delete Error', 'Failed to delete the user.');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <span className="font-semibold text-gray-700">{text}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-3">
          <AiFillEdit
            className="cursor-pointer text-blue-500 hover:text-blue-700 transition"
            onClick={() => handleEditUser(record)}
          />
          <AiFillDelete
            className="cursor-pointer text-red-500 hover:text-red-700 transition"
            onClick={() => handleDeleteUser(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8 bg-white p-4 shadow-md rounded-md"
      >
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <Button
          type="primary"
          icon={<AiOutlineUserAdd />}
          onClick={() => {
            setIsModalOpen(true);
            form.resetFields(); // Clear form before adding new user
          }}
          className="bg-[#01257D] hover:bg-[#00FFFF] transition"
        >
          Add User
        </Button>
      </motion.div>

      {/* Users Table */}
      <Table
        dataSource={users || []} // Ensure users is always an array
        columns={columns}
        rowKey="id"
        className="bg-white shadow-md rounded-md"
        pagination={{ pageSize: 5 }}
      />

      {/* Add/Edit User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={isModalOpen} // Replace visible with open
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        footer={null}
        className="rounded-md"
      >
        <Form
          form={form} // Attach form instance
          layout="vertical"
          onFinish={handleAddOrEditUser}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter a username' }]}
          >
            <Input className="rounded-md" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter a password' }]}
          >
            <Input.Password className="rounded-md" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              className="bg-[#01257D] hover:bg-[#00FFFF] transition rounded-md"
            >
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
