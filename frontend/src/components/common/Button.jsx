import Spinner from './Spinner';

const variantClass = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const sizeClass = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`btn ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size={16} color={variant === 'primary' || variant === 'danger' ? 'white' : undefined} />}
      {children}
    </button>
  );
}
