import Image from 'next/image'

interface CasasProps {
  percentage: number
}

const Casas = ({ percentage }: CasasProps) => {
  const label = `${percentage}%`

  const clipPathValue = `inset(0 0 0 ${label})`

  return (
    <div className="casas-wrapper">
      <div className="casas-title">
        <div className="casas-title-title">
          Proporção de ALs cujos donos são proprietários de múltiplos alojamentos
        </div>
      </div>
      <div className="casas-container">
        <Image src="/static/images/casas_magenta.png" alt="First Image" width={1080} height={107} />
        <Image
          src="/static/images/casas_azuis.png"
          alt="First Image"
          width={1080}
          height={107}
          style={{ clipPath: clipPathValue }}
        />
        <div className="separator-line" style={{ left: `${percentage}%` }} />
        <div className="percentage-label" style={{ left: `${percentage}%` }}>
          {' '}
          {label}
        </div>
      </div>
    </div>
  )
}

export default Casas
