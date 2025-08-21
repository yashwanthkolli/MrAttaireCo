import { useState } from 'react'
import AddressSection from '../../components/AddressSection/AddressSection';

import './Address.Styles.css';
import Message from '../../components/Message/Message';

const Address = () => {
  const [msg, setMsg] = useState({type: '', text: ''});

  return (
    <div className='address-page'>
      {/* Success/Error Message */}
      {msg.text && (
        <Message 
          type={msg.type} 
          message={msg.text} 
          onClose={() => setMsg({ type: '', text: '' })} 
          duration={3000}
        />
      )}

      <AddressSection setMsg={setMsg} />
    </div>
  )
}

export default Address