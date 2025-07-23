import './Input.Styles.css';

const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  required,
  className = '',
  inputClassName = '',
  errorClassName = '',
  icon,
  iconPosition = 'left',
  ...props
}) => {
  return (
    <div className={`input-container ${className}`}>
      <div className='input-wrapper'>
        {icon && iconPosition === 'left' && (
          <div className="icon-left">
            {icon}
          </div>
        )}

        <input
          type={type}
          name={name}
          id={name}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border ${
            icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''
          } ${error ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : ''} ${inputClassName}`}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="icon-right">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className={`mt-1 text-sm text-red-600 ${errorClassName}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;