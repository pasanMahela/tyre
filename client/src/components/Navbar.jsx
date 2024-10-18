import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdown, setDropdown] = useState({ inventory: false, reports: false, users: false });

  const inventoryRef = useRef();
  const reportsRef = useRef();
  const usersRef = useRef();
  const navbarRef = useRef();

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const toggleDropdown = (key) => {
    setDropdown((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !inventoryRef.current?.contains(event.target) &&
        !reportsRef.current?.contains(event.target) &&
        !usersRef.current?.contains(event.target) &&
        !navbarRef.current?.contains(event.target)
      ) {
        setDropdown({ inventory: false, reports: false, users: false });
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav ref={navbarRef} className="bg-gray-900 border-gray-200">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Logo" />
            <span className="text-2xl font-semibold text-white">Ruhunu Tyre House</span>
          </Link>

          <div className="flex items-center space-x-6 rtl:space-x-reverse">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <nav className="bg-gray-800">
        <div className="max-w-screen-xl px-4 py-4 mx-auto">
          <div className="flex justify-between items-center">
            <ul className="flex space-x-12 text-white">
              <li>
                <Link to="/pos" className="hover:underline">POS</Link>
              </li>
              <li>
                <Link to="/stock-add" className="hover:underline">Add Stock</Link>
              </li>
              <li>
                <Link to="/stock-view" className="hover:underline">View Stock</Link>
              </li>

              <li className="relative" ref={inventoryRef}>
                <button onClick={() => toggleDropdown('inventory')} className="hover:underline">
                  Inventory
                </button>
                {dropdown.inventory && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-700 text-white shadow-lg rounded-lg py-2 w-48">
                    <Link to="/item-add" className="block px-4 py-2 hover:bg-gray-600">
                      Add New Item
                    </Link>
                    <Link to="/item-edit" className="block px-4 py-2 hover:bg-gray-600">
                      Edit Item
                    </Link>
                  </div>
                )}
              </li>

              <li>
                <Link to="/sales" className="hover:underline">Sales</Link>
              </li>

              <li className="relative" ref={reportsRef}>
                <button onClick={() => toggleDropdown('reports')} className="hover:underline">
                  Reports
                </button>
                {dropdown.reports && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-700 text-white shadow-lg rounded-lg py-2 w-48">
                    <Link to="/reports/purchase" className="block px-4 py-2 hover:bg-gray-600">
                      Purchase Reports
                    </Link>
                    <Link to="/reports/sales" className="block px-4 py-2 hover:bg-gray-600">
                      Sales Reports
                    </Link>
                  </div>
                )}
              </li>

              <li className="relative" ref={usersRef}>
                <button onClick={() => toggleDropdown('users')} className="hover:underline">
                  Users
                </button>
                {dropdown.users && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-700 text-white shadow-lg rounded-lg py-2 w-48">
                    <Link to="/users/add" className="block px-4 py-2 hover:bg-gray-600">
                      Add User
                    </Link>
                    <Link to="/users/view" className="block px-4 py-2 hover:bg-gray-600">
                      View Users
                    </Link>
                  </div>
                )}
              </li>
            </ul>

            <button onClick={toggleMenu} className="md:hidden text-white">
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <nav className="bg-gray-800 px-4 py-3">
          <ul className="space-y-2 text-white">
            <li>
              <Link to="/pos" className="block hover:underline" onClick={toggleMenu}>
                POS
              </Link>
            </li>
            <li>
              <Link to="/stock-add" className="block hover:underline" onClick={toggleMenu}>
                Add Stock
              </Link>
            </li>
            <li>
              <Link to="/stock-view" className="block hover:underline" onClick={toggleMenu}>
                View Stock
              </Link>
            </li>

            <li>
              <button onClick={() => toggleDropdown('inventory')} className="hover:underline">
                Inventory
              </button>
              {dropdown.inventory && (
                <div className="pl-4">
                  <Link to="/item-add" className="hover:underline" onClick={toggleMenu}>
                    Add New Item
                  </Link>
                  <Link to="/item-edit" className="hover:underline" onClick={toggleMenu}>
                    Edit Item
                  </Link>
                </div>
              )}
            </li>

            <li>
              <Link to="/sales" className="hover:underline" onClick={toggleMenu}>
                Sales
              </Link>
            </li>

            <li>
              <button onClick={() => toggleDropdown('reports')} className="hover:underline">
                Reports
              </button>
              {dropdown.reports && (
                <div className="pl-4">
                  <Link to="/reports/purchase" className="hover:underline" onClick={toggleMenu}>
                    Purchase Reports
                  </Link>
                  <Link to="/reports/sales" className="hover:underline" onClick={toggleMenu}>
                    Sales Reports
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default Navbar;
