import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import ItemAdd from './inventory/ItemAdd';
import StockAdd from './stock/StockAdd';
import StockView from './stock/StockView';
function App() {


  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/item-add" element={<ItemAdd />} />
          <Route path="/stock-add" element={<StockAdd />} />
          <Route path="/stock-view" element={<StockView />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
