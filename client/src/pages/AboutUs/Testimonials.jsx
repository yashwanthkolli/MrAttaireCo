import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, color } from 'framer-motion';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const testimonials = [
    {
      id: 1,
      quote: "The craftsmanship is exceptional. These pieces have become staples in my wardrobe that I reach for again and again.",
      author: "Sarah K.",
      role: "Fashion Editor",
      delay: 0.1
    },
    {
      id: 2,
      quote: "Working with this brand transformed how I think about my personal style. The attention to detail is unparalleled.",
      author: "Michael T.",
      role: "Creative Director",
      delay: 0.2
    },
    {
      id: 3,
      quote: "I've never received so many compliments on my clothing. Each piece tells a story of intentional design.",
      author: "Priya M.",
      role: "Sustainability Advocate",
      delay: 0.3
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0
    })
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <motion.h2 
          style={styles.heading}
          className='heading'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Worn <span style={{color: '#A3320B'}}>&</span> Adored
        </motion.h2>
        
        <div style={styles.testimonialContainer}>
          <AnimatePresence custom={direction} mode='wait'>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5 }}
              style={styles.testimonial}
            >
              <motion.p 
                style={styles.quote}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: testimonials[currentIndex].delay }}
              >
                "{testimonials[currentIndex].quote}"
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: testimonials[currentIndex].delay + 0.2 }}
              >
                <p style={styles.author}>{testimonials[currentIndex].author}</p>
                <p style={styles.role}>{testimonials[currentIndex].role}</p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={styles.dots}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              style={{
                ...styles.dot,
                backgroundColor: index === currentIndex ? '#A3320B' : '#ddd'
              }}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '70px 20px',
    backgroundColor: '#1e1e1e',
    position: 'relative'
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center'
  },
  heading: {
    color: 'white'
  },
  testimonialContainer: {
    height: '300px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '40px'
  },
  testimonial: {
    position: 'absolute',
    maxWidth: '600px',
    padding: '0 20px'
  },
  quote: {
    fontSize: 'clamp(2rem, 2vw, 1.25rem)',
    lineHeight: '1.8',
    color: 'white',
    fontWeight: 300,
    marginBottom: '30px',
    fontStyle: 'italic'
  },
  author: {
    fontSize: '1.4rem',
    fontWeight: 400,
    color: 'white',
    marginBottom: '5px'
  },
  role: {
    fontSize: '1.2rem',
    color: '#bfbfbf',
    fontWeight: 300,
    letterSpacing: '0.05em'
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px'
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    padding: 0
  }
};

export default TestimonialsSection;