import { useState } from 'react'
import Icon from '@/components/ui/Icon/Icon'
import './FilterSelect.css'

// options: array de strings o de { value, label }.
// Funciona controlado (value + onChange) o libre (defaultValue).
export default function FilterSelect({ options, value, defaultValue, onChange, variant = 'filter', className = '', ...rest }) {
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  const [inner, setInner] = useState(defaultValue ?? items[0]?.value ?? '')
  const current = value ?? inner

  const handleChange = (e) => {
    setInner(e.target.value)
    onChange?.(e.target.value)
  }

  return (
    <div className={`select select--${variant} ${className}`}>
      <select className="select__control" value={current} onChange={handleChange} {...rest}>
        {items.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <Icon name="chevronDown" size={16} className="select__chevron" />
    </div>
  )
}
