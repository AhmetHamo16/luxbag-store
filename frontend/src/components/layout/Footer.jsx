import React from 'react';
import { Link } from 'react-router-dom';
import useTranslation from '../../hooks/useTranslation';

const Footer = () => {
  const { t } = useTranslation('footer');

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-3xl font-serif text-gold uppercase tracking-widest mb-6">Melora</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t.aboutText}
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium text-white mb-6">{t.quickLinks}</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/shop" className="hover:text-gold transition-colors">Shop All</Link></li>
              <li><Link to="#" className="hover:text-gold transition-colors">New Arrivals</Link></li>
              <li><Link to="#" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-gold transition-colors">{t.contact}</Link></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-medium text-white mb-6">Customer Service</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="#" className="hover:text-gold transition-colors">FAQ</Link></li>
              <li><Link to="#" className="hover:text-gold transition-colors">Shipping & Returns</Link></li>
              <li><Link to="#" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-gold transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-medium text-white mb-6">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="flex flex-col space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="bg-transparent border border-gray-700 text-white px-4 py-3 focus:outline-none focus:border-gold transition-colors text-sm"
              />
              <button 
                type="submit" 
                className="bg-gold text-white font-medium py-3 hover:bg-white hover:text-black transition-colors duration-300"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Melora Çantası. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {/* Social Icons Placeholder */}
            <span className="text-gray-500 hover:text-gold cursor-pointer transition-colors">Instagram</span>
            <span className="text-gray-500 hover:text-gold cursor-pointer transition-colors">Facebook</span>
            <span className="text-gray-500 hover:text-gold cursor-pointer transition-colors">Pinterest</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
