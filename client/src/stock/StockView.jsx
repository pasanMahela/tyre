import React, { useEffect, useState } from 'react';
import { Table, message, Button, Select } from 'antd';
import { FaFilter, FaUndo, FaPrint } from 'react-icons/fa';
import axios from 'axios';

const { Option } = Select;

function StockView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState([]);
  const [filterCompany, setFilterCompany] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortKey, setSortKey] = useState('itemCode');
  const [totalRetailValue, setTotalRetailValue] = useState(0);
  const [totalPurchaseValue, setTotalPurchaseValue] = useState(0);

  const columns = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 78,
      render: (text) => (text ? text : '-'),
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 300,
      render: (text) => (text ? text : '-'),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
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
      width: 78,
      render: (text) => (text ? text : '-'),
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 90,
      render: (text) => (text !== undefined ? text : '-'),
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
      
      // Only include items with non-zero, non-null, non-undefined values
      if (
        currentStock > 0 &&
        retailPrice > 0 &&
        purchasePrice > 0
      ) {
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
    calculateTotalValues(items); // Recalculate total values after resetting filters
  };

  const handlePrint = () => {
    window.print(); // Triggers the browser's print dialog
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-4">Stock View</h1>
      <div className="bg-white p-4 rounded-lg shadow-lg max-h-[500px] overflow-y-auto">
        {/* Filter and Sort Controls */}
        <div className="flex justify-between mb-4">
          <div className="flex space-x-4">
            {/* Icon Button for Filters */}
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
            {/* Existing Select Filters */}
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
            {/* Print Stock Button */}
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

        {/* Table Container */}
        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="itemCode"
          loading={loading}
          bordered
          size='small'
          className="overflow-hidden"
          scroll={{ x: true }} // Add scroll for better UX on smaller screens
          pagination={false} // Disable pagination to show all items
        />
      </div>

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
