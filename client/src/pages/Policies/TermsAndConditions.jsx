import './policies.css';

const TermsAndConditions = () => {
  return (
    <div className='policy'>
      <h1 className='heading'>Terms & Conditions</h1>
      <p className='text tag'>Effective: {new Date().toLocaleDateString()}</p>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>1. Introduction</h2>
        <p className='text policy-info'>
          Welcome to <span className='bold'>MR. ATTIRE</span>. These Terms & Conditions govern your use of our website and the
          purchase of any products. By using our platform, you agree to comply with these terms. Please
          read them carefully.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading'>2. Products & Availability</h2>
        <p className='text policy-info'>
          &nbsp;&nbsp;• We currently sell <span className='bold'>pre-stocked, ready-to-ship streetwear products</span> - including T-shirts -
          with more to come (joggers, hoodies, etc.).
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• All products are subject to availability. We may modify or discontinue any item without
          prior notice.

        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading'>3. Orders, Pricing & Payments</h2>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Orders can be placed from <span className='bold'>India or abroad</span>.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• All payments are processed securely via <span className='bold'>Razorpay</span>, supporting UPI, debit/credit cards,
          and net banking.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• <span className='bold'>Cash on Delivery (COD)</span> is available for select regions in India.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• <span className='bold'>Prices are inclusive of GST</span> unless otherwise mentioned.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Product pricing may differ based on customer location or currency.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading'>4. Shipping & Delivery</h2>
        <p className='text policy-info'>
          &nbsp;&nbsp;• We use <span className='bold'>Shiprocket</span> to fulfil orders both domestically and internationally.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Delivery times vary by location and carrier availability. Tracking links will be shared after
          order dispatch.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Customs duties or taxes may apply for international shipments and are to be borne by
          the customer.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading'>5. Cancellation Policy</h2>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Customers can request cancellation <span className='bold'>only before dispatch</span> by contacting our support team.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• MR. ATTIRE reserves the right to cancel any order due to stock unavailability, payment
          issues, or suspected fraud. 
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Refunds, if applicable, will be processed back to the original
          payment method.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading'>6. Intellectual Property</h2>
        <p className='text policy-info'>
          &nbsp;&nbsp;• All product designs, logos, branding, and content are the intellectual property of <span className='bold'>Mr. Attire</span>.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Copying, reproduction, or resale of our products or designs is <span className='bold'>strictly prohibited</span> and
          may lead to legal action. 
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading'>7. User Data & Privacy</h2>
        <p className='text policy-info'>
          &nbsp;&nbsp;• We collect basic customer data (name, contact, address) only for order processing,
          communication, and delivery purposes. 
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Your information is stored securely and never sold to third parties.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• By using our platform, you agree to receive transactional and promotional messages
          (SMS, email, WhatsApp).
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading'>8. Limitation of Liability</h2>
        <p className='text policy-info'>
          &nbsp;&nbsp;• MR. ATTIRE is not responsible for delays or non-delivery due to natural calamities,
          courier failure, or unforeseen external factors. 
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• We strive for accuracy in our listings, but minor variations may occur.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading'>9. Governing Law</h2>
        <p className='text policy-info'>
          All disputes arising from or related to MR. ATTIRE will be governed by the laws of <span className='bold'>Ahmedabad,
          Gujarat, India.</span>
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading'>For any concerns or support:</h2>
        <p className='text policy-info'>
          <a href="mailto:legal@mrattireco.com">legal@mrattireco.com</a>
          <br />
          <a href="tel:+916352275201">+91 6352275201</a>
        </p>
      </section>
    </div>
  );
};

export default TermsAndConditions;