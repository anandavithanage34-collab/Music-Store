import React from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Wrench, Music2, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

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
                    17/2 Ekamuthu lane<br />
                    Naykakannda, Wattala<br />
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
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                <img 
                  src="/images/map.png" 
                  alt="Harmony House Location Map - 17/2 Ekamuthu lane, Naykakannda, Wattala"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="w-full h-full flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                  <MapPin className="h-8 w-8" />
                  <span className="ml-2">Map unavailable</span>
                </div>
              </div>
              <p className="text-gray-600">
                Come visit our showroom to try instruments before you buy. Our experienced staff 
                can help you find the perfect instrument for your needs and provide expert advice 
                on maintenance and accessories.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Our Services Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">Our Services</h2>
            <p className="text-xl text-gray-600">
              Beyond selling instruments, we offer comprehensive musical services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Instrument Repair Service */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="h-full border-2 border-gray-100 hover:border-gray-200 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Wrench className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">Instrument Repair Services</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Our skilled technicians provide professional repair and maintenance services for all types of musical instruments.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Services Include:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Guitar & bass setup and repairs</li>
                        <li>• Piano tuning and maintenance</li>
                        <li>• Drum kit assembly and tuning</li>
                        <li>• Electronic instrument troubleshooting</li>
                        <li>• String replacement and setup</li>
                        <li>• Amplifier and audio equipment repair</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Contact for Repairs:</h4>
                      <div className="space-y-1 text-sm text-blue-800">
                        <p><strong>Phone:</strong> +94 77 234 5678 (Repair Department)</p>
                        <p><strong>Email:</strong> repairs@harmonyhouse.lk</p>
                        <p><strong>Hours:</strong> Monday - Saturday: 8:00 AM - 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                  
              
                </CardContent>
              </Card>
            </motion.div>

            {/* Music Lessons Service */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="h-full border-2 border-gray-100 hover:border-gray-200 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Music2 className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-xl">Music Lessons</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Learn to play your favorite instrument with our experienced instructors. We offer both individual and group lessons.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Instruments We Teach:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Guitar (Acoustic & Electric)</li>
                        <li>• Piano & Keyboard</li>
                        <li>• Drums & Percussion</li>
                        <li>• Bass Guitar</li>
                        <li>• Traditional Sri Lankan instruments</li>
                        <li>• Music theory and composition</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">Lesson Booking:</h4>
                      <div className="space-y-1 text-sm text-green-800">
                        <p><strong>Phone:</strong> +94 77 345 6789 (Music Academy)</p>
                        <p><strong>Email:</strong> lessons@harmonyhouse.lk</p>
                        <p><strong>Rates:</strong> Starting from LKR 2,500 per lesson</p>
                        <p><strong>Duration:</strong> 45-60 minutes per session</p>
                      </div>
                    </div>
                  </div>
                  
                  
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
