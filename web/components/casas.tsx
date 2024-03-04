import Image from 'next/image'

interface CasasProps {
  city: string
}

const Casas = ({ city }: CasasProps) => {
  let label = ''
  if (city === 'Porto') {
    label = '82%'
  } else if (city === 'Lisbon') {
    label = '68%'
  }

  const clipPathValue = `inset(0 0 0 ${label})`
  const dynamicAfterStyle = `
  .casas-container::after {
    left: ${label};
  }
`

  return (
    <>
      <style>{dynamicAfterStyle}</style>
      <div
        className="casas-container"
        style={{
          position: 'relative',
          width: '1080px', // Set the width to match the images
          height: '107px', // Set the height to match the images
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <div className="number-label" style={{ left: label }}>
          {label}
        </div>
        <div className="casas-magenta">
          <Image
            src="/static/images/casas_magenta.png"
            alt="Casas Magenta"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
          />
        </div>
        <div className="casas-azul" style={{ clipPath: clipPathValue }}>
          <Image
            src="/static/images/casas_azuis.png"
            alt="Casas Azul"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
          />
        </div>
      </div>
    </>
  )
}

export default Casas
