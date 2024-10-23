import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DatePicker, Button, Spin, Table, Drawer, List } from "antd";
import { CSVLink } from "react-csv";
import { EyeOutlined } from "@ant-design/icons";
import axios from "axios";
import { motion } from "framer-motion";
import moment from "moment";

const { RangePicker } = DatePicker;

const Sales = () => {
  const [salesData, setSalesData] = useState([]); // State to store all sales data
  const [filteredSales, setFilteredSales] = useState([]); // State to store filtered data
  const [loading, setLoading] = useState(true); // State to handle loading
  const [dates, setDates] = useState(null); // State to manage date range
  const [selectedSale, setSelectedSale] = useState(null); // State to manage the selected sale for viewing items
  const [drawerVisible, setDrawerVisible] = useState(false); // State to handle drawer visibility

  // Fetch sales data from backend on component mount
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sales'); // Fetch sales from backend
        setSalesData(response.data);
        setFilteredSales(response.data); // Display all sales by default
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  // Handle date range filtering
  const handleDateRangeChange = (range) => {
    setDates(range);
    if (range) {
      const [startDate, endDate] = range;
      const filtered = salesData.filter(sale =>
        moment(sale.date).isBetween(startDate, endDate, null, '[]')
      );
      setFilteredSales(filtered);
    } else {
      setFilteredSales(salesData); // Reset to show all sales
    }
  };

  // Reset the date filter
  const handleReset = () => {
    setDates(null);
    setFilteredSales(salesData); // Reset sales data to the original list
  };

  // Handle opening of drawer to view items of the selected sale
  const handleViewItems = (sale) => {
    setSelectedSale(sale);
    setDrawerVisible(true);
  };

  // Close drawer
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setSelectedSale(null);
  };

  // Define CSV headers and data for export
  const csvHeaders = [
    { label: "Date", key: "date" },
    { label: "Total Amount", key: "totalAmount" },
    { label: "Discount", key: "discount" },
    { label: "Net Value", key: "netValue" },
    { label: "Cash Paid", key: "cashPaid" },
    { label: "Balance", key: "balance" },
    { label: "Payment Type", key: "paymentType" }
  ];

  // Table columns configuration
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
    },
    {
      title: "Net Value",
      dataIndex: "netValue",
      key: "netValue",
    },
    {
      title: "Cash Paid",
      dataIndex: "cashPaid",
      key: "cashPaid",
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
    },
    {
      title: "Payment Type",
      dataIndex: "paymentType",
      key: "paymentType",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewItems(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6"
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Sales Overview</h2>

      {/* Date picker and actions */}
      <div className="flex items-center mb-6">
        <RangePicker
          value={dates}
          onChange={handleDateRangeChange}
          className="mr-4"
          placeholder={["Start Date", "End Date"]}
        />
        <Button onClick={handleReset} className="mr-4">Reset</Button>
        <CSVLink
          data={filteredSales}
          headers={csvHeaders}
          filename={"sales_report.csv"}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Download Sales Report
        </CSVLink>
      </div>

      {/* Sales table */}
      <div className="mb-6" style={{ padding: "20px" }}>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={filteredSales}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
          />
        )}
      </div>

      {/* Sales chart */}
      {loading ? (
        <Spin size="large" />
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filteredSales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(date) => moment(date).format('YYYY-MM-DD')} />
            <YAxis />
            <Tooltip labelFormatter={(label) => moment(label).format('YYYY-MM-DD')} />
            <Line type="monotone" dataKey="totalAmount" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="netValue" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Drawer to view sold items */}
      <Drawer
        title="Sold Items"
        placement="right"
        closable={true}
        onClose={handleDrawerClose}
        visible={drawerVisible}
        width={400}
      >
        {selectedSale && selectedSale.items.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={selectedSale.items}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={<strong>{item.itemName}</strong>}
                  description={
                    <>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${item.price}</p>
                      <p>Total: ${item.totalPrice}</p>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <p>No items found for this sale.</p>
        )}
      </Drawer>
    </motion.div>
  );
};

export default Sales;
