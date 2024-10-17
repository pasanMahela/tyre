import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-custom-bg text-custom-blue py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          {/* Shop Information */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold mb-3">Ruhunu Tyre House</h2>
            <p className="text-lg">New Town Galnewa</p>
            <p className="text-lg">Open: Mon - Sun, 8:00 AM - 6:00 PM</p>
          </div>

          {/* Contact Information */}
          <div className="space-y-2 pl-10">
            <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
            <p className="text-lg">Phone: <span className="font-semibold">025 1111111</span></p>
            <p className="text-lg">Email: <a href="mailto:info@possystem.com" className="hover:underline">info@pasan.com</a></p>
          </div>

          {/* Social Media */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-6">
              <a href="https://facebook.com" className="hover:text-custom-blue transition-all duration-300">
                <FaFacebook size={32} />
              </a>
              <a href="https://twitter.com" className="hover:text-custom-blue transition-all duration-300">
                <FaTwitter size={32} />
              </a>
              <a href="https://instagram.com" className="hover:text-custom-blue transition-all duration-300">
                <FaInstagram size={32} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-custom-blue my-4"></div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-lg font-semibold">© 2024 Ruhunu Tyres. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
