import { Link } from 'react-router-dom'
import styles from './PrivacyPage.module.css'

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <article className={styles.card}>
        <p className={styles.eyebrow}>Protección de datos</p>
        <h2>Aviso de privacidad</h2>

        <p>
          Esta plataforma cumple con la Ley 25.326 de Protección de los Datos
          Personales. A continuación detallamos qué información recopilamos, para
          qué la usamos y cómo la protegemos.
        </p>

        <h3>Qué datos recopilamos</h3>
        <p>
          Del personal interno: email y contraseña (almacenada como hash, nunca en
          texto plano). De los pedidos: dirección de destino, localidad y código de
          tracking asociado. La consulta pública de tracking no expone datos del
          destinatario del envío, solo el estado y la fecha estimada del pedido.
        </p>

        <h3>Para qué los usamos</h3>
        <p>
          Exclusivamente para la gestión operativa de la logística: autenticación
          de usuarios internos, generación de rutas de entrega y seguimiento de
          pedidos.
        </p>

        <h3>Cómo los protegemos</h3>
        <p>
          Las contraseñas se almacenan con hashing (bcrypt), nunca en texto plano.
          Las sesiones usan tokens JWT con expiración. El acceso al panel interno
          está restringido por rol, y la consulta pública de tracking está
          diseñada para no exponer información sensible.
        </p>

        <h3>Tus derechos</h3>
        <p>
          Podés solicitar acceso, rectificación o supresión de tus datos personales
          escribiendo a <a href="mailto:privacidad@logistic.com">privacidad@logistic.com</a>,
          conforme a lo previsto por la Ley 25.326.
        </p>

        <Link to="/login" className={styles.backLink}>
          Volver al acceso interno
        </Link>
      </article>
    </div>
  )
}
