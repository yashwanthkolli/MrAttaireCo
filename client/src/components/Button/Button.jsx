import './Button.Styles.css';

const Button = ({
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  width = '100%',
  onClick,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left',
}) => {

  // Variant classes
  const variantClasses = {
    primary: 'dark-btn',
    secondary: 'light-btn',
    danger: 'red-btn'
  };

  // Disabled state
  const disabledClasses = 'opacity-60 cursor-not-allowed';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{width}}
      className={`button-component 
        ${variantClasses[variant]}
        ${disabled || loading ? disabledClasses : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Processing...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span>{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span>{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;