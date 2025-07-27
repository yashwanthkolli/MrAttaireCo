const Shipping = () => {
  return (
    <div className='policy'>
      <h1 className='heading'>Shipping & Delivery Policy</h1>
      <p className='text tag'>Effective: July 25th, 2025</p>

      <section className='policy-section'>
        <p className='text policy-info'>
          This Shipping & Delivery Policy is part of our Terms and Conditions and applies to all purchases
          made through www.mrattire.com (the “Site”).
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>1. Where We Ship?</h2>
        <p className='text policy-info'>
          We currently ship orders <span className="bold">pan India and internationally</span> using trusted logistics partners via <span className="bold">Ship
          rocket</span>. Orders are processed from our primary fulfilment centre in <span className="bold">Ahmedabad, Gujarat,
          India</span>.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>2. Order Processing Time</h2>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Orders are processed within <span className="bold">1–2 business days</span> after you place your order.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Orders are not processed on <span className="bold">Sundays or public holidays</span>.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• You will receive a tracking link via email/SMS/WhatsApp once your order is shipped.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>3. Delivery Time Estimates</h2>
        <p className='text policy-info'>
          Actual delivery time depends on your location, courier speed, and customs (for international orders).
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• <span className="bold">India (Standard Shipping):</span> 3–7 business days
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• <span className="bold">International:</span>I 7–14 business days (may vary based on country-specific customs/duties)
        </p>
        <p className='text policy-info'>
          Note: These are estimated timelines; delays may occur due to high demand, natural events, or
          logistics bottlenecks.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>4. Shipping Charges</h2>
        <p className='text policy-info'>
          &nbsp;&nbsp;• <span className="bold">India:</span> ₹0 – ₹99 (Free shipping above ₹999)
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• <span className="bold">International:</span> Calculated at checkout based on delivery location and weight.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>5. Customs, Duties & Taxes</h2>
        <p className='text policy-info'>
          For international orders:
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Import duties and taxes<span className="bold"> may apply</span> depending on the destination country.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• These charges are<span className="bold"> not included</span> in the product price or shipping fee.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• The customer is responsible for any customs duties and local taxes applicable in their country.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>6. Cash on Delivery (India only)</h2>
        <p className='text policy-info'>
          &nbsp;&nbsp;• COD is available on most pin codes in India.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• An additional COD fee of ₹50 may be applicable.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>7. Delayed or Lost Orders</h2>
        <p className='text policy-info'>
          In case of:
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• <span className="bold">Delayed shipment:</span> Contact us at support@mrattire.com
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• <span className="bold">Lost package:</span> We’ll initiate an inquiry with the courier. If untraceable within 7 days, we
          will reship or refund the order
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>8. Undeliverable Packages</h2>
        <p className='text policy-info'>
          If a package is returned to us due to incorrect shipping details or failure to accept the delivery:
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Domestic orders: Reshipped once at no extra cost. After that, charges apply.
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• International orders: Reship only after new shipping fee is paid.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>Need Help?</h2>
        <p className='text policy-info'>
          If you have any questions about your shipment or delivery timelines, feel free to contact us at:
        </p>
        <p className='text policy-info bold'>
          mrattireco@gmail.com
          <br />
          +91 63522 75201
        </p>
      </section>
    </div>
  )
}

export default Shipping