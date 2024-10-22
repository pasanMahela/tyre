import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ItemAdd from './inventory/ItemAdd';
import StockAdd from './stock/StockAdd';
import StockView from './stock/StockView';
import ItemEdit from './inventory/ItemEdit';
import POS from './pages/POS';
import UserManagement from "./pages/UserManagement ";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Router>
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/item-add" element={<ItemAdd />} />
            <Route path="/stock-add" element={<StockAdd />} />
            <Route path="/stock-view" element={<StockView />} />
            <Route path="/item-edit" element={<ItemEdit />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
