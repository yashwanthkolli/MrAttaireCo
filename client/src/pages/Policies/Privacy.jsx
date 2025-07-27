const Privacy = () => {
  return (
    <div className='policy'>
      <h1 className='heading'>Privacy Policy</h1>
      <p className='text tag'>Effective: July 25th, 2025</p>

      <section className='policy-section'>
        <p className='text policy-info'>
          At MR. ATTIRE, we respect your privacy and are committed to protecting your
          personal data. This Privacy Policy explains how we collect, use, and safeguard your information
          when you visit our website or make a purchase.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>1. Information We Collect</h2>
        <p className='text policy-info'>
          We may collect the following details:
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Name, phone number, email address
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Shipping and billing address
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Payment information (handled securely via Razorpay)
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Device/browser data (for analytics or fraud protection)
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>2. How We Use Your Information</h2>
        <p className='text policy-info'>
          &nbsp;&nbsp;• To process and deliver orders
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• To communicate updates, offers, or responses to queries
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• To comply with legal or regulatory obligations
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• To improve our services and customer experience
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>3. Sharing Your Information</h2>
        <p className='text policy-info'>
          We <span className="bold">do not sell</span> your data to third parties. We only share your data with:
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Payment partners (e.g. Razorpay)
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Shipping partners (e.g. Shiprocket)
        </p>
        <p className='text policy-info'>
          &nbsp;&nbsp;• Legal/regulatory bodies when required
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>4. Data Storage & Protection</h2>
        <p className='text policy-info'>
          We use secure servers and encryption protocols to safeguard your data. Access is limited to
          authorized personnel only.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>5. Marketing Communication</h2>
        <p className='text policy-info'>
          By using our platform, you agree to receive promotional messages (SMS, WhatsApp, email).
          You can opt out at any time.
        </p>
      </section>

      <section className='policy-section'>
        <h2 className='sub-heading policy-heading'>Your Rights</h2>
        <p className='text policy-info'>
          You can request access, modification, or deletion of your personal data by contacting us at:
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

export default Privacy