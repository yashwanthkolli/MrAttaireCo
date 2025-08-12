import { useEffect } from 'react';
import './Message.Styles.css';
import { IoClose } from 'react-icons/io5';

const Message = ({ type = 'success', message, onClose, duration = 3000 }) => {
  if (!message) return null;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  return (
    <div className={`message ${type}`}>
      <span>{message}</span>
      {onClose && (
        <button className="message-close" onClick={onClose}><IoClose /></button>
      )}
    </div>
  );
};

export default Message;
