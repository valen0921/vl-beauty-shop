import Icon from '@/components/ui/Icon/Icon'
import './Button.css'

export default function Button({ variant = 'secondary', size, icon, iconRight, block, className = '', type = 'button', children, ...rest }) {
  const cls = ['btn', `btn--${variant}`, size && `btn--${size}`, block && 'btn--block', className].filter(Boolean).join(' ')
  return (
    <button type={type} className={cls} {...rest}>
      {icon && <Icon name={icon} size={16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={15} />}
    </button>
  )
}
