import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Form, InputNumber, notification, Upload, Tooltip } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';

function StockAdd() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [currentStock, setCurrentStock] = useState(0);
  const searchInputRef = useRef(null);

  // Auto-focus on the search input field
  useEffect(() => {
    searchInputRef.current.focus();
  }, []);

  // Fetch item details based on item code
  const handleSearch = async () => {
    const itemCode = form.getFieldValue('itemCode');

    if (!itemCode) {
      notification.error({ message: 'Please enter an item code.' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/item/view/code/${itemCode}`);
      if (response.data) {
        form.setFieldsValue({
          itemName: response.data.itemName,
          itemCompany: response.data.itemCompany,
          description: response.data.description,
          lowerLimit: response.data.lowerLimit,
          currentStock: response.data.currentStock,
          purchasePrice: response.data.purchasePrice,
          retailPrice: response.data.retailPrice,
          itemDiscount: response.data.itemDiscount,
        });
        setItemId(response.data._id);
        setCurrentStock(response.data.currentStock);
      } else {
        notification.error({ message: 'Item not found.' });
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
      notification.error({ message: 'Failed to fetch item details. Please check the item code and try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Update stock based on form values
  const handleAddToStock = async () => {
    const { newStock, purchasePrice, retailPrice, itemDiscount } = form.getFieldsValue();
    const newStockValue = newStock || 0;
    const totalStock = currentStock + newStockValue;

    if (!itemId) {
      notification.error({ message: 'Item not found. Please search for an item first.' });
      return;
    }

    if (newStockValue <= 0) {
      notification.error({ message: 'Please enter a valid stock quantity.' });
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/item/update/${itemId}`, {
        currentStock: totalStock,
        purchasePrice,
        retailPrice,
        itemDiscount,
      });
      notification.success({
        message: 'Stock updated successfully!',
        description: `Item Code: ${form.getFieldValue('itemCode')}, New Stock: ${newStockValue}, Total Stock: ${totalStock}`,
      });
      form.resetFields();
      setItemId(null);
      setCurrentStock(0);
      searchInputRef.current.focus(); // Refocus search input after success
    } catch (error) {
      console.error('Error updating stock:', error);
      notification.error({ message: 'Failed to update stock. Please try again.' });
    }
  };

  // Handle form submission with Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!itemId) {
        handleSearch();
      } else {
        handleAddToStock();
      }
    }
  };

  // Handle Excel file upload and processing
  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0]; // Assuming we're using the first sheet
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convert to array format

      const headers = jsonData[0]; // Extract column headers
      const expectedHeaders = ['Item Code', 'Purchase Price', 'Retail Price', 'New Stock'];
      
      // Validate headers
      if (headers.length !== expectedHeaders.length || !headers.every((val, index) => val === expectedHeaders[index])) {
        notification.error({ message: 'Invalid Excel file format. Please use the provided template.' });
        return false;
      }

      const items = jsonData.slice(1); // Extract data rows

      // Iterate over each row and update the stock for each item
      items.forEach(async (row) => {
        const [itemCode, purchasePrice, retailPrice, newStock] = row; // Assuming these are the relevant columns

        try {
          // Fetch item by code
          const response = await axios.get(`http://localhost:5000/api/item/view/code/${itemCode}`);
          if (response.data) {
            const totalStock = response.data.currentStock + newStock;

            // Update stock
            await axios.put(`http://localhost:5000/api/item/update/${response.data._id}`, {
              currentStock: totalStock,
              purchasePrice,
              retailPrice,
            });

            notification.success({
              message: `Stock updated for Item Code: ${itemCode}`,
              description: `New Stock: ${newStock}, Total Stock: ${totalStock}`,
            });
          } else {
            notification.error({ message: `Item with code ${itemCode} not found.` });
          }
        } catch (error) {
          console.error('Error updating stock:', error);
          notification.error({ message: `Failed to update stock for Item Code: ${itemCode}.` });
        }
      });
    };

    reader.onerror = (event) => {
      notification.error({ message: 'Failed to read the Excel file.' });
    };

    reader.readAsBinaryString(file);
    return false; // Prevent automatic upload
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Add Stocks</h2>
      <Form form={form} layout="vertical" onKeyPress={handleKeyPress}>
        <Form.Item
          label="Item Code"
          name="itemCode"
          rules={[{ required: true, message: 'Please enter the item code.' }]}
        >
          <div className="flex">
            <Input
              className="flex-grow rounded-l-md border-r-0 mr-36"
              disabled={loading}
              ref={searchInputRef} // Auto-focus here
            />
            <Button
              onClick={handleSearch}
              loading={loading}
              className="rounded-r-md"
              tabIndex={0}
            >
              Search
            </Button>
          </div>
        </Form.Item>

        <Form.Item label="Item Name" name="itemName">
          <Input disabled className="rounded-md" />
        </Form.Item>

        <Form.Item label="Item Company" name="itemCompany">
          <Input disabled className="rounded-md" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input disabled className="rounded-md" />
        </Form.Item>

        <Form.Item label="Lower Limit" name="lowerLimit">
          <InputNumber min={0} disabled className="w-full rounded-md" />
        </Form.Item>

        <Form.Item label="Current Stock" name="currentStock">
          <InputNumber min={0} value={currentStock} disabled className="w-full rounded-md" />
        </Form.Item>

        <Form.Item
          label="Purchase Price Rs."
          name="purchasePrice"
          rules={[{ type: 'number', min: 0, message: 'Purchase price cannot be negative.' }]}
        >
          <InputNumber min={0} className="w-full rounded-md" />
        </Form.Item>

        <Form.Item
          label="Retail Price Rs."
          name="retailPrice"
          rules={[{ type: 'number', min: 0, message: 'Retail price cannot be negative.' }]}
        >
          <InputNumber min={0} className="w-full rounded-md" />
        </Form.Item>

        <Tooltip title="Enter the discount percentage for the item.">
          <Form.Item
            label="Item Discount %"
            name="itemDiscount"
            rules={[{ type: 'number', min: 0, max: 100, message: 'Discount must be between 0 and 100.' }]}
          >
            <InputNumber min={0} max={100} className="w-full rounded-md" />
          </Form.Item>
        </Tooltip>

        <Form.Item
          label="New Stock"
          name="newStock"
          rules={[{ required: true, type: 'number', min: 1, message: 'Please enter a valid stock quantity.' }]}
        >
          <InputNumber min={1} className="w-full rounded-md" />
        </Form.Item>

        <Button type="primary" onClick={handleAddToStock} className="w-full rounded-md">
          Add to Stock
        </Button>

        {/* Excel Template Download */}
        <Form.Item label="Download Excel Template">
          <a href="/path/to/excel-template.xlsx" download>
            <Button icon={<DownloadOutlined />}>Download Template</Button>
          </a>
        </Form.Item>

        {/* Excel Upload */}
        <Form.Item label="Upload Excel File">
          <Tooltip title="Ensure the Excel file matches the provided template.">
            <Upload
              accept=".xlsx"
              beforeUpload={handleFileUpload}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Excel File</Button>
            </Upload>
          </Tooltip>
        </Form.Item>
      </Form>
    </div>
  );
}

export default StockAdd;
