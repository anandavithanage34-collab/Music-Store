import React from 'react'
import { motion } from 'framer-motion'
import { Music, Heart, Star, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading">About Music Store LK</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sri Lanka's premier destination for musical instruments, serving musicians of all skill levels 
            with quality instruments and expert guidance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Music, title: "Premium Instruments", desc: "Curated collection from trusted brands" },
            { icon: Users, title: "Expert Support", desc: "Professional guidance for every musician" },
            { icon: Heart, title: "Local Service", desc: "Proudly serving musicians across Sri Lanka" },
            { icon: Star, title: "Quality Guarantee", desc: "All instruments backed by warranty" }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="text-center h-full">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Founded with a passion for music and a deep understanding of Sri Lankan musical culture, 
              Music Store LK has been serving the local music community for years. We believe that everyone 
              deserves access to quality musical instruments, regardless of their skill level or budget.
            </p>
            <p className="text-gray-700 leading-relaxed">
              From traditional Sri Lankan instruments to modern electronic equipment, we offer a carefully 
              curated selection that meets the diverse needs of our musical community. Our personalized 
              recommendation system helps beginners find their first instrument while supporting professional 
              musicians in their artistic journey.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
