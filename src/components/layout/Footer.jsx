import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Music, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  const footerSections = [
    {
      title: 'Shop',
      links: [
        { name: 'All Instruments', href: '/products' },
        { name: 'String Instruments', href: '/products?category=string_instruments' },
        { name: 'Wind Instruments', href: '/products?category=wind_instruments' },
        { name: 'Percussion', href: '/products?category=percussion' },
        { name: 'Traditional Sri Lankan', href: '/products?category=traditional' },
        { name: 'Accessories', href: '/products?category=accessories' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Customer Service', href: '/contact' },
        { name: 'Shipping Info', href: '/shipping' },
        { name: 'Returns & Exchanges', href: '/returns' },
        { name: 'Warranty', href: '/warranty' },
        { name: 'Size Guide', href: '/size-guide' },
        { name: 'Care Instructions', href: '/care' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Our Story', href: '/story' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Sustainability', href: '/sustainability' },
        { name: 'Blog', href: '/blog' }
      ]
    }
  ]

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/musicstoreLK', name: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/musicstoreLK', name: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com/musicstoreLK', name: 'Twitter' },
    { icon: Youtube, href: 'https://youtube.com/musicstoreLK', name: 'YouTube' }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-3xl font-bold mb-4 font-heading">
              Stay in Tune with Us
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get exclusive offers, new arrivals, and musical inspiration delivered to your inbox
            </p>
            
            <form className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
              />
              <button
                type="submit"
                className="bg-secondary-500 hover:bg-secondary-600 text-gray-900 px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Link to="/" className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-secondary-400 to-secondary-600 p-3 rounded-2xl">
                  <Music className="h-8 w-8 text-gray-900" />
                </div>
                <div>
                  <span className="text-2xl font-bold font-heading">Music Store</span>
                  <span className="block text-sm text-gray-400 tracking-wider uppercase">Sri Lanka</span>
                </div>
              </Link>
              
              <p className="text-gray-300 leading-relaxed mb-8 max-w-md">
                Sri Lanka's premier destination for exceptional musical instruments. 
                Inspiring musicians since 2020 with quality, craftsmanship, and passion.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="h-5 w-5 text-secondary-400" />
                  <span>123 Music Street, Colombo 03, Sri Lanka</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="h-5 w-5 text-secondary-400" />
                  <span>+94 11 234 5678</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="h-5 w-5 text-secondary-400" />
                  <span>hello@musicstore.lk</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6 font-heading">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Social Links & Copyright */}
        <div className="border-t border-gray-800 pt-12 mt-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="flex space-x-6"
            >
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-300 transform hover:scale-110 group"
                >
                  <social.icon className="h-5 w-5 text-gray-300 group-hover:text-secondary-400" />
                </a>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center md:text-right"
            >
              <p className="text-gray-300 text-sm">
                © 2024 Music Store LK. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center md:justify-end gap-6 mt-2">
                <Link to="/privacy" className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
                  Terms of Service
                </Link>
                <Link to="/cookies" className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
                  Cookie Policy
                </Link>
                <Link to="/admin/login" className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium">
                  Admin
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}