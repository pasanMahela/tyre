import React from 'react'
import { Form, Input, Button, Select } from 'antd';

function ItemAdd() {
  return (
    <div>
        <h2>Add new item</h2>
        <Form layout="vertical">
            <Form.Item label="Item Name" name="itemName">
            <Input />
            </Form.Item>

            <Form.Item label="Item Company" name="itemCompany">
            <Input />
            </Form.Item>
            
            <Form.Item label="Category" name="category">
            <Select placeholder="Please select">
                <Option value="threeWheel">Three Wheel</Option>
                <Option value="motorCycle">Motor Cycle</Option>
                <Option value="vehicle">Vehicle</Option>
            </Select>
            <Button type="default" onClick={() => console.log('Add new category')}>
                Add New Category
            </Button>
            </Form.Item>
            
            <Form.Item label="Description" name="description">
            <Input />
            </Form.Item>
            
            <Form.Item label="Lower Limit" name="lowerLimit">
            <Input />
            </Form.Item>
            
            <Form.Item label="Item Location" name="itemLocation">
            <Input />
            </Form.Item>
            
            <Form.Item label="Barcode" name="barcode">
            <Input />
            </Form.Item>
            
            <Form.Item>
            <Button type="primary" htmlType="submit">
                Add New Item
            </Button>
            </Form.Item>
        </Form>

    </div>
  )
}

export default ItemAdd