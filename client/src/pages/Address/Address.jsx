import { useState } from 'react'
import AddressSection from '../../components/AddressSection/AddressSection';

import './Address.Styles.css';

const Address = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  return (
    <div className='address-page'>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <AddressSection setMessage={setMessage} setError={setError} />
    </div>
  )
}

export default Address