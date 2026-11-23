import Icon from '@/components/ui/Icon/Icon'
import './SearchField.css'

export default function SearchField({ placeholder = 'Buscar…', value = '', onChange, className = '' }) {
  return (
    <label className={`search ${className}`}>
      <Icon name="search" size={16} />
      <input type="search" placeholder={placeholder} value={value} onChange={(e) => onChange?.(e.target.value)} />
    </label>
  )
}
