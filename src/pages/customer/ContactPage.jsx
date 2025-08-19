import React from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading">Contact Us</h1>
          <p className="text-xl text-gray-600">
            Get in touch with our team for expert musical instrument advice
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <p className="text-gray-600">+94 11 234 5678</p>
                  <p className="text-gray-600">+94 77 123 4567 (Mobile)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-gray-600">info@musicstore.lk</p>
                  <p className="text-gray-600">support@musicstore.lk</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Address</h3>
                  <p className="text-gray-600">
                    123 Galle Road<br />
                    Colombo 04<br />
                    Sri Lanka
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-primary-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Store Hours</h3>
                  <p className="text-gray-600">Monday - Saturday: 9:00 AM - 7:00 PM</p>
                  <p className="text-gray-600">Sunday: 10:00 AM - 5:00 PM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visit Our Store</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 mb-4">
                <MapPin className="h-8 w-8" />
                <span className="ml-2">Map will be displayed here</span>
              </div>
              <p className="text-gray-600">
                Come visit our showroom to try instruments before you buy. Our experienced staff 
                can help you find the perfect instrument for your needs and provide expert advice 
                on maintenance and accessories.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
