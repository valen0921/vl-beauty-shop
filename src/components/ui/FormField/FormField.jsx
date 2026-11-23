import { useId } from 'react'
import FilterSelect from '@/components/ui/FilterSelect/FilterSelect'
import './FormField.css'

// as: 'input' (por defecto) | 'select' | 'textarea'
export default function FormField({ label, as = 'input', options, upper = false, className = '', ...rest }) {
  const id = useId()
  let control
  if (as === 'select') control = <FilterSelect variant="field" options={options} id={id} {...rest} />
  else if (as === 'textarea') control = <textarea id={id} className="field__control" {...rest} />
  else control = <input id={id} className="field__control" {...rest} />

  return (
    <div className={`field ${upper ? 'field--upper' : ''} ${className}`}>
      <label className="field__label" htmlFor={id}>{label}</label>
      {control}
    </div>
  )
}
