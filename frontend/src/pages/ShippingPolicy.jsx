import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Package, Truck, Clock, Shield } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] px-4 sm:px-5 md:px-10 py-6 md:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-[#1F3D2B] hover:text-[#B8431A] transition-colors mb-6 font-bold uppercase text-sm tracking-wider"
        >
          <ArrowLeft size={16} strokeWidth={3} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="bg-white border-[3px] border-[#1F3D2B] p-6 md:p-8 mb-6 shadow-[4px_4px_0_0_#1F3D2B]">
          <div className="flex items-center gap-3 mb-4">
            <Truck size={32} strokeWidth={3} className="text-[#D98F00]" />
            <h1 className="font-display font-black text-3xl sm:text-4xl text-[#1F3D2B]">
              Shipping Policy
            </h1>
          </div>
          <p className="text-[#1F3D2B]/80 text-sm sm:text-base leading-relaxed">
            At Laxmi Oils, we ensure your favorite oils reach you safely and efficiently. 
            Read our shipping policy to understand delivery timelines, charges, and procedures.
          </p>
        </div>

        {/* Shipping Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white border-[3px] border-[#1F3D2B] p-6 shadow-[4px_4px_0_0_#1F3D2B]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Package size={24} strokeWidth={3} className="text-[#D98F00]" />
              <h2 className="font-bold text-xl text-[#1F3D2B]">Delivery Timeline</h2>
            </div>
            <ul className="space-y-2 text-[#1F3D2B]/80 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="text-[#D98F00] mt-1">•</span>
                <span><strong>Metro Cities:</strong> 2-3 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D98F00] mt-1">•</span>
                <span><strong>Urban Areas:</strong> 3-5 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D98F00] mt-1">•</span>
                <span><strong>Rural Areas:</strong> 5-7 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D98F00] mt-1">•</span>
                <span><strong>Remote Locations:</strong> 7-10 business days</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border-[3px] border-[#1F3D2B] p-6 shadow-[4px_4px_0_0_#1F3D2B]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Shield size={24} strokeWidth={3} className="text-[#D98F00]" />
              <h2 className="font-bold text-xl text-[#1F3D2B]">Shipping Charges</h2>
            </div>
            <ul className="space-y-2 text-[#1F3D2B]/80 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="text-[#D98F00] mt-1">•</span>
                <span><strong>Free Shipping:</strong> Orders above ₹500</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D98F00] mt-1">•</span>
                <span><strong>Standard Shipping:</strong> ₹40 for orders below ₹500</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D98F00] mt-1">•</span>
                <span><strong>Express Shipping:</strong> ₹80 (2-3 days delivery)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D98F00] mt-1">•</span>
                <span><strong>COD Charges:</strong> ₹20 additional</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Detailed Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white border-[3px] border-[#1F3D2B] p-6 md:p-8 shadow-[4px_4px_0_0_#1F3D2B]"
        >
          <h2 className="font-bold text-2xl text-[#1F3D2B] mb-6">Detailed Shipping Information</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-[#1F3D2B] mb-3 flex items-center gap-2">
                <Clock size={20} strokeWidth={3} className="text-[#D98F00]" />
                Order Processing Time
              </h3>
              <p className="text-[#1F3D2B]/80 text-sm sm:text-base leading-relaxed">
                All orders are processed within 24 hours on business days. Orders placed after 2 PM 
                will be processed the next business day. You will receive a confirmation email with 
                tracking details once your order ships.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#1F3D2B] mb-3">Delivery Partners</h3>
              <p className="text-[#1F3D2B]/80 text-sm sm:text-base leading-relaxed">
                We partner with reliable delivery services including Shiprocket, Delhivery, and 
                local courier partners to ensure timely delivery of your orders.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#1F3D2B] mb-3">Order Tracking</h3>
              <p className="text-[#1F3D2B]/80 text-sm sm:text-base leading-relaxed">
                Once your order ships, you'll receive a tracking number via email and SMS. 
                You can track your order status on our website or directly on the courier partner's website.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#1F3D2B] mb-3">International Shipping</h3>
              <p className="text-[#1F3D2B]/80 text-sm sm:text-base leading-relaxed">
                Currently, we only ship within India. We are working on international shipping 
                options and will update this policy once available.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#1F3D2B] mb-3">Failed Deliveries</h3>
              <p className="text-[#1F3D2B]/80 text-sm sm:text-base leading-relaxed">
                If delivery fails due to incorrect address or recipient unavailability, 
                the courier will attempt redelivery. After 3 failed attempts, the order 
                will be returned to our warehouse. Re-shipping charges will apply.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#1F3D2B] mb-3">Special Instructions</h3>
              <p className="text-[#1F3D2B]/80 text-sm sm:text-base leading-relaxed">
                For bulk orders (15L and above) or special delivery requirements, 
                please contact our customer service team at support@laxmioils.com or 
                call us at +91-9876543210.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-[#D98F00]/10 border-[3px] border-[#D98F00] p-6 mt-6"
        >
          <h3 className="font-bold text-lg text-[#1F3D2B] mb-3">Need Help?</h3>
          <p className="text-[#1F3D2B]/80 text-sm sm:text-base mb-4">
            If you have any questions about our shipping policy or need assistance with your order, 
            our customer service team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <div>
              <strong>Email:</strong> support@laxmioils.com
            </div>
            <div>
              <strong>Phone:</strong> +91-9876543210
            </div>
            <div>
              <strong>Hours:</strong> Mon-Sat, 9 AM - 6 PM
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
