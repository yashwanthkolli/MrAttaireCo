import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import './Faqs.Styles.css';
import { FaCirclePlus } from 'react-icons/fa6';

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className='faqs'>
      <div className='container'>
        <motion.h2 
          className='heading'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          CLARITY IN DETAIL
        </motion.h2>
        
        <motion.p 
          className='text tag'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          Answers to common questions about our philosophy and process
        </motion.p>

        <div className='faq-container'>
          {faqs.map((faq, index) => (
            <div key={index} className='faq-item'>
              <motion.button
                className='sub-heading question'
                onClick={() => toggleFAQ(index)}
                whileHover={{ backgroundColor: '#f8f8f8' }}
                transition={{ duration: 0.2 }}
              >
                <span>{faq.question}</span>
                <motion.span
                  animate={{ rotate: activeIndex === index ? 45 : 0 }}
                  transition={{ duration: 0.3 }}
                  className='plus'
                >
                  <FaCirclePlus />
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    className='text'
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: 1,
                      height: 'auto',
                      transition: {
                        opacity: { duration: 0.2 },
                        height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }
                      }
                    }}
                    exit={{
                      opacity: 0,
                      height: 0,
                      transition: {
                        opacity: { duration: 0 },
                        height: { duration: 0 }
                      }
                    }}
                  >
                    <div className='answer'>{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  answer: {
    padding: '0 0 25px 0',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap'
  }
};

export default FAQs;

const faqs = [
  {
    question: "Where do you ship?",
    answer: "We ship across India and to select international countries. Global shipping rates and delivery times vary based on your location."
  },
  {
    question: "How long will my order take to arrive?",
    answer: "We dispatch within 24–48 hours. Delivery timelines:\n\t• India: 3–7 working days\n\t• International: 7–14 working days (depending on destination & customs)\nTracking details are emailed once shipped."
  },
  {
    question: "Do you offer free shipping?",
    answer: "• India: Free shipping on all prepaid orders above ₹999\n• International: Shipping charges are calculated at checkout based on destination"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept:\n\t• UPI / Wallets / Cards (via Razorpay)\n\t• Net Banking\n\t• International Cards (for global orders)\n\t• Cash on Delivery (India only)"
  },
  {
    question: "Can I return my order?",
    answer: "Yes! Products can be returned within 7 days of delivery if they are unused and in original condition. Please refer to our Return Policy for more details."
  },
  {
    question: "How do I contact support?",
    answer: "Drop us an email at support@mrattire.com — we typically respond within 24 hours on working days."
  },
  {
    question: "How long will my order take to arrive?",
    answer: "We dispatch within 24–48 hours. Delivery timelines:\n\t• India: 3–7 working days\n\t• International: 7–14 working days (depending on destination & customs)\nTracking details are emailed once shipped."
  },
  {
    question: "Are your prices different for international buyers?",
    answer: "Yes. Our platform auto-adjusts currency and pricing based on your location."
  },
  {
    question: "Do you restock sold-out items?",
    answer: "Some drops are limited editions and won’t return. For basics or popular styles, restocks are announced on Instagram @mrattire.co and via our newsletter."
  },
  {
    question: "How do I track my order?",
    answer: "Once shipped, you'll get an email & WhatsApp message with a tracking link. You can also log into your account to check your order status."
  },
  {
      question: "What makes your designs timeless?",
      answer: "We focus on clean silhouettes, premium natural materials, and subtle details that transcend seasonal trends. Each piece is designed to complement existing wardrobes while maintaining distinctive character."
  },
  {
    question: "How sustainable is your production?",
    answer: "We use 100% organic fabrics, deadstock materials, and low-impact dyes. Our made-to-order model eliminates excess inventory, and all packaging is compostable or reusable."
  }
];