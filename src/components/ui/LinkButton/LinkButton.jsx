// Botón con aspecto de enlace rosa (los "Ver más →" del diseño).
export default function LinkButton({ children, className = '', ...rest }) {
  return <button type="button" className={`link-btn link-pink ${className}`} {...rest}>{children}</button>
}
