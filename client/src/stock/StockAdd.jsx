import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Form, InputNumber, notification, Upload, Tooltip, Row, Col, Checkbox } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';

function StockAdd() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [currentStock, setCurrentStock] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState(['Item Code']); // 'Item Code' is mandatory
  const searchInputRef = useRef(null);

  const availableColumns = [
    'Item Code',
    'Purchase Price',
    'Retail Price',
    'Item Discount',
    'New Stock',
  ];

  useEffect(() => {
    searchInputRef.current.focus();
  }, []);

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
          itemDiscount: response.data.itemDiscount
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
        itemDiscount
      });
      notification.success({
        message: 'Stock updated successfully!',
        description: `Item Code: ${form.getFieldValue('itemCode')}, New Stock: ${newStockValue}, Total Stock: ${totalStock}`
      });
      form.resetFields();
      setItemId(null);
      setCurrentStock(0);
      searchInputRef.current.focus();
    } catch (error) {
      console.error('Error updating stock:', error);
      notification.error({ message: 'Failed to update stock. Please try again.' });
    }
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const items = jsonData.slice(1);

      items.forEach(async (row) => {
        const [itemCode, purchasePrice, retailPrice, newStock] = row;

        try {
          const response = await axios.get(`http://localhost:5000/api/item/view/code/${itemCode}`);
          if (response.data) {
            const totalStock = response.data.currentStock + newStock;

            await axios.put(`http://localhost:5000/api/item/update/${response.data._id}`, {
              currentStock: totalStock,
              purchasePrice,
              retailPrice
            });

            notification.success({
              message: `Stock updated for Item Code: ${itemCode}`,
              description: `New Stock: ${newStock}, Total Stock: ${totalStock}`
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

    reader.onerror = () => {
      notification.error({ message: 'Failed to read the Excel file.' });
    };

    reader.readAsBinaryString(file);
    return false;
  };

  const handleColumnChange = (checkedValues) => {
    if (!checkedValues.includes('Item Code')) {
      checkedValues.push('Item Code'); // Ensure 'Item Code' is always selected
    }
    setSelectedColumns(checkedValues);
  };

  const downloadTemplate = () => {
    const templateData = [selectedColumns, Array(selectedColumns.length).fill('')];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'custom_stock_template.xlsx');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <Row gutter={24}>
        {/* Left Column: Form */}
        <Col xs={24} md={12}>
          <h2 className="text-2xl font-bold mb-6 text-center">Add Stocks Manually</h2>
          <Form form={form} layout="vertical" onKeyPress={(e) => e.key === 'Enter' && handleSearch()}>
            <Form.Item label="Item Code" name="itemCode" rules={[{ required: true, message: 'Please enter the item code.' }]}>
              <div className="flex">
                <Input className="flex-grow rounded-l-md border-r-0 mr-36" disabled={loading} ref={searchInputRef} />
                <Button onClick={handleSearch} loading={loading} className="rounded-r-md">
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

            <Form.Item label="Purchase Price Rs." name="purchasePrice" rules={[{ type: 'number', min: 0 }]}>
              <InputNumber min={0} className="w-full rounded-md" />
            </Form.Item>

            <Form.Item label="Retail Price Rs." name="retailPrice" rules={[{ type: 'number', min: 0 }]}>
              <InputNumber min={0} className="w-full rounded-md" />
            </Form.Item>

            <Form.Item label="Item Discount %" name="itemDiscount" rules={[{ type: 'number', min: 0, max: 100 }]}>
              <InputNumber min={0} max={100} className="w-full rounded-md" />
            </Form.Item>

            <Form.Item label="New Stock" name="newStock" rules={[{ required: true, type: 'number', min: 1 }]}>
              <InputNumber min={1} className="w-full rounded-md" />
            </Form.Item>

            <Button type="primary" onClick={handleAddToStock} className="w-full rounded-md">
              Add to Stock
            </Button>
          </Form>
        </Col>

        {/* Right Column: Excel Upload */}
        <Col xs={24} md={12}>
          <h2 className="text-2xl font-bold mb-6 text-center">Add Stocks via Excel</h2>
          <Form layout="vertical">
            <Form.Item label="Select Columns for Custom Template">
              <Checkbox.Group options={availableColumns} defaultValue={['Item Code']} onChange={handleColumnChange} />
            </Form.Item>

            <Form.Item label="Download Custom Excel Template">
              <a onClick={downloadTemplate} download>
                <Button icon={<DownloadOutlined />}>Download Custom Template</Button>
              </a>
            </Form.Item>

            <Form.Item label="Upload Excel File">
              <Tooltip title="Ensure the Excel file matches the provided template.">
                <Upload accept=".xlsx" beforeUpload={handleFileUpload} maxCount={1}>
                  <Button icon={<UploadOutlined />}>Upload Excel File</Button>
                </Upload>
              </Tooltip>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
}

export default StockAdd;
