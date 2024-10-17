import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaBoxOpen, FaShoppingCart, FaEdit, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // to track page changes

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Close menu when route changes
    setIsOpen(false);
  }, [location]);

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.6 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div {...pageTransition} key={location.pathname}>
        <nav className="bg-custom-bg text-custom-blue shadow-md font-poppins">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/" className="text-3xl font-bold tracking-wider text-red-600">
                  Ruhunu Tyre House
                </Link>
              </div>
              <div className="hidden md:flex space-x-8">
                <Link
                  to="/"
                  className="hover:bg-custom-blue hover:text-custom-bg px-5 py-2 rounded-lg transition-all duration-300 flex items-center"
                >
                  <FaHome className="inline-block mr-2" size={20} /> Home
                </Link>
                <Link
                  to="/item-add"
                  className="hover:bg-custom-blue hover:text-custom-bg px-5 py-2 rounded-lg transition-all duration-300 flex items-center"
                >
                  <FaBoxOpen className="inline-block mr-2" size={20} /> Add Item
                </Link>
                <Link
                  to="/stock-view"
                  className="hover:bg-custom-blue hover:text-custom-bg px-5 py-2 rounded-lg transition-all duration-300 flex items-center"
                >
                  <FaEdit className="inline-block mr-2" size={20} /> Stock View
                </Link>
                <Link
                  to="/pos"
                  className="hover:bg-custom-blue hover:text-custom-bg px-5 py-2 rounded-lg transition-all duration-300 flex items-center"
                >
                  <FaShoppingCart className="inline-block mr-2" size={20} /> POS
                </Link>
              </div>
              <div className="md:hidden">
                <button onClick={toggleMenu} className="text-custom-blue hover:text-gray-400" aria-expanded={isOpen} aria-label="Toggle navigation menu">
                  {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
              </div>
            </div>
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden bg-custom-bg"
            >
              <Link to="/" className="block px-4 py-3 text-custom-blue hover:bg-custom-blue hover:text-custom-bg" onClick={toggleMenu}>
                Home
              </Link>
              <Link to="/item-add" className="block px-4 py-3 text-custom-blue hover:bg-custom-blue hover:text-custom-bg" onClick={toggleMenu}>
                Add Item
              </Link>
              <Link to="/stock-view" className="block px-4 py-3 text-custom-blue hover:bg-custom-blue hover:text-custom-bg" onClick={toggleMenu}>
                Stock View
              </Link>
              <Link to="/pos" className="block px-4 py-3 text-custom-blue hover:bg-custom-blue hover:text-custom-bg" onClick={toggleMenu}>
                POS
              </Link>
            </motion.div>
          )}
        </nav>
      </motion.div>
    </AnimatePresence>
  );
};

export default Navbar;
