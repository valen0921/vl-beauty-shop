import Button from '@/components/ui/Button/Button'
import banner from '@/assets/banner-coleccion.svg'
import './PromoBanner.css'

export default function PromoBanner({ drafts = 8, onReview }) {
  return (
    <section className="promo">
      <img className="promo__img" src={banner} alt="" />
      <div className="promo__text">
        <h3>Una colección cuidada vende mejor.</h3>
        <p>Tienes {drafts} borradores esperando sus últimos detalles. Dales el toque final.</p>
      </div>
      <Button icon="arrowUpRight" onClick={onReview}>Revisar borradores</Button>
    </section>
  )
}
