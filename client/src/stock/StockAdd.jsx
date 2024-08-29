import React from 'react'
import { Input, Button, Form, InputNumber } from 'antd';

function StockAdd() {
  return (
    <div>
        <h2>Add Stocks</h2>
        <Form layout="vertical">
            <Form.Item label="Item Code">
            <Input addonAfter={<Button>Search</Button>} />
            </Form.Item>

            <Form.Item label="Item Name">
            <Input />
            </Form.Item>

            <Form.Item label="Item Company" name="itemCompany">
            <Input />
            </Form.Item>

            <Form.Item label="Description">
            <Input />
            </Form.Item>

            <Form.Item label="Lower Limit">
            <InputNumber min={0} />
            </Form.Item>

            <Form.Item label="Current Stock">
            <InputNumber min={0} />
            </Form.Item>

            <Form.Item label="Purchase Price Rs.">
            <InputNumber min={0} />
            </Form.Item>

            <Form.Item label="Retail Price Rs.">
            <InputNumber min={0} />
            </Form.Item>

            <Form.Item label="Item Discount %">
            <InputNumber min={0} max={100} />
            </Form.Item>

            <Form.Item label="New Stock">
            <InputNumber min={0}     />
            </Form.Item>

            <Form.Item>
            <Button type="primary">Add to Stock</Button>
            </Form.Item>
        </Form>
    </div>
  )
}

export default StockAdd