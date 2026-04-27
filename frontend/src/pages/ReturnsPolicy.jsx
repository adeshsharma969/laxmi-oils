import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle, Clock, Shield } from "lucide-react";

export default function ReturnsPolicy() {
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
            <RefreshCw size={32} strokeWidth={3} className="text-[#D98F00]" />
            <h1 className="font-display font-black text-3xl sm:text-4xl text-[#1F3D2B]">
              Returns & Refunds Policy
            </h1>
          </div>
          <p className="text-[#1F3D2B]/80 text-sm sm:text-base leading-relaxed">
            At Laxmi Oils, we stand behind the quality of our products. If you're not satisfied 
            with your purchase, our return policy ensures a hassle-free experience.
          </p>
        </div>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white border-[3px] border-[#1F3D2B] p-6 shadow-[4px_4px_0_0_#1F3D2B]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Clock size={24} strokeWidth={3} className="text-[#D98F00]" />
              <h2 className="font-bold text-lg text-[#1F3D2B]">Return Window</h2>
            </div>
            <p className="text-[#1F3D2B]/80 text-sm sm:text-base font-semibold text-center">
              7 Days
            </p>
            <p className="text-[#1F3D2B]/60 text-xs text-center mt-1">
              From delivery date
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border-[3px] border-[#1F3D2B] p-6 shadow-[4px_4px_0_0_#1F3D2B]"
          >
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle size={24} strokeWidth={3} className="text-[#D98F00]" />
              <h2 className="font-bold text-lg text-[#1F3D2B]">Condition</h2>
            </div>
            <p className="text-[#1F3D2B]/80 text-sm sm:text-base font-semibold text-center">
              Unused & Sealed
            </p>
            <p className="text-[#1F3D2B]/60 text-xs text-center mt-1">
              Original packaging
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white border-[3px] border-[#1F3D2B] p-6 shadow-[4px_4px_0_0_#1F3D2B]"
          >
            <div className="flex items-center gap-3 mb-3">
              <Shield size={24} strokeWidth={3} className="text-[#D98F00]" />
              <h2 className="font-bold text-lg text-[#1F3D2B]">Refund</h2>
            </div>
            <p className="text-[#1F3D2B]/80 text-sm sm:text-base font-semibold text-center">
              5-7 Days
            </p>
            <p className="text-[#1F3D2B]/60 text-xs text-center mt-1">
              After pickup
            </p>
          </motion.div>
        </div>

        {/* Eligibility Criteria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white border-[3px] border-[#1F3D2B] p-6 md:p-8 shadow-[4px_4px_0_0_#1F3D2B] mb-6"
        >
          <h2 className="font-bold text-2xl text-[#1F3D2B] mb-6">Return Eligibility</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg text-[#1F3D2B] mb-3 flex items-center gap-2">
                <CheckCircle size={20} strokeWidth={3} className="text-green-600" />
                Eligible for Return
              </h3>
              <ul className="space-y-2 text-[#1F3D2B]/80 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Wrong product delivered</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Product damaged during transit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Manufacturing defects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Expired products (if applicable)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Sealed products in original packaging</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#1F3D2B] mb-3 flex items-center gap-2">
                <AlertCircle size={20} strokeWidth={3} className="text-[#B8431A]" />
                Not Eligible for Return
              </h3>
              <ul className="space-y-2 text-[#1F3D2B]/80 text-sm sm:text-base">
                <li className="flex items-start gap-2">
                  <span className="text-[#B8431A] mt-1">✗</span>
                  <span>Opened or used products</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B8431A] mt-1">✗</span>
                  <span>Products without original packaging</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B8431A] mt-1">✗</span>
                  <span>Return request after 7 days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B8431A] mt-1">✗</span>
                  <span>Damage due to customer misuse</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B8431A] mt-1">✗</span>
                  <span>Free samples or promotional items</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Return Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white border-[3px] border-[#1F3D2B] p-6 md:p-8 shadow-[4px_4px_0_0_#1F3D2B] mb-6"
        >
          <h2 className="font-bold text-2xl text-[#1F3D2B] mb-6">How to Initiate a Return</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4 p-4 border-2 border-[#E5E5E0] rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-[#D98F00] text-white rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1F3D2B] mb-2">Contact Customer Service</h3>
                <p className="text-[#1F3D2B]/80 text-sm sm:text-base">
                  Email us at laxmiedibleoils@gmail.com or call +91-9876543210 within 7 days of delivery. 
                  Provide your order ID and reason for return.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 border-2 border-[#E5E5E0] rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-[#D98F00] text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1F3D2B] mb-2">Return Approval</h3>
                <p className="text-[#1F3D2B]/80 text-sm sm:text-base">
                  Our team will review your request within 24 hours. If approved, you'll receive 
                  return instructions and a pickup scheduling link.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 border-2 border-[#E5E5E0] rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-[#D98F00] text-white rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1F3D2B] mb-2">Package & Pickup</h3>
                <p className="text-[#1F3D2B]/80 text-sm sm:text-base">
                  Pack the product in original packaging with all tags. Our courier partner will 
                  pick up the item from your address within 2-3 business days.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 border-2 border-[#E5E5E0] rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-[#D98F00] text-white rounded-full flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#1F3D2B] mb-2">Quality Check & Refund</h3>
                <p className="text-[#1F3D2B]/80 text-sm sm:text-base">
                  Once we receive and verify the product, refund will be processed within 5-7 
                  business days to your original payment method.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Refund Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white border-[3px] border-[#1F3D2B] p-6 md:p-8 shadow-[4px_4px_0_0_#1F3D2B] mb-6"
        >
          <h2 className="font-bold text-2xl text-[#1F3D2B] mb-6">Refund Policy</h2>
          
          <div className="space-y-4 text-[#1F3D2B]/80 text-sm sm:text-base">
            <div>
              <h3 className="font-bold text-lg text-[#1F3D2B] mb-2">Refund Methods</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#D98F00] mt-1">•</span>
                  <span><strong>Online Payments:</strong> Refund to original payment method (Credit Card, Debit Card, UPI, Wallets)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D98F00] mt-1">•</span>
                  <span><strong>COD Orders:</strong> Refund via bank transfer or store credit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D98F00] mt-1">•</span>
                  <span><strong>Replacement Option:</strong> Choose replacement instead of refund for defective products</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#1F3D2B] mb-2">Refund Timeline</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#D98F00] mt-1">•</span>
                  <span>Quality check: 1-2 business days after receipt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D98F00] mt-1">•</span>
                  <span>Refund processing: 2-3 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D98F00] mt-1">•</span>
                  <span>Amount reflection: 5-7 business days (depends on bank/payment provider)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#1F3D2B] mb-2">Shipping Charges</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#D98F00] mt-1">•</span>
                  <span>Return shipping is free for defective products and wrong deliveries</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D98F00] mt-1">•</span>
                  <span>For other valid returns, return shipping charges may apply (₹40-₹80)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D98F00] mt-1">•</span>
                  <span>Original shipping charges are non-refundable except for wrong/defective products</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-[#D98F00]/10 border-[3px] border-[#D98F00] p-6"
        >
          <h3 className="font-bold text-lg text-[#1F3D2B] mb-3">Need Help with Returns?</h3>
          <p className="text-[#1F3D2B]/80 text-sm sm:text-base mb-4">
            Our customer service team is dedicated to making your return experience smooth and hassle-free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <div>
              <strong>Email:</strong> laxmiedibleoils@gmail.com
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
