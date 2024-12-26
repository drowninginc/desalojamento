import Image from 'next/image'
import { useState, useEffect } from 'react'

interface CasasProps {
  percentage: number
  title: string
  triggerAnimation: boolean
}

const Casas = ({ percentage, title, triggerAnimation }: CasasProps) => {
  const [currentPercentage, setCurrentPercentage] = useState(0)

  useEffect(() => {
    if (triggerAnimation) {
      const delay = 1000 // delay in milliseconds
      const animationDuration = 3000 // duration in milliseconds
      const totalSteps = 500 // total steps for the animation
      const stepDuration = animationDuration / totalSteps
      const bounceSteps = 50 // steps for the bounce effect
      const bounceFactor = 1.014 // overshoot factor
      let currentStep = 0

      const startAnimation = () => {
        const interval = setInterval(() => {
          if (currentStep < totalSteps) {
            currentStep += 1
            const currentPercentage = (currentStep / totalSteps) * percentage
            setCurrentPercentage(currentPercentage)
          } else if (currentStep < totalSteps + bounceSteps) {
            currentStep += 1
            const overshootPercentage = percentage * bounceFactor
            const bouncePercentage =
              overshootPercentage -
              ((currentStep - totalSteps) / bounceSteps) * (overshootPercentage - percentage)
            setCurrentPercentage(bouncePercentage)
          } else {
            clearInterval(interval)
          }
        }, stepDuration)
        return () => clearInterval(interval)
      }

      const timeout = setTimeout(startAnimation, delay)
      return () => clearTimeout(timeout)
    }
  }, [percentage, triggerAnimation])

  return (
    <div className="casas-wrapper">
      <div className="casas-title">
        <div className="casas-title-title">{title}</div>
      </div>
      <div className="casas-container">
        <Image src="/static/images/casas_magenta.png" alt="First Image" width={1080} height={107} />
        <Image
          src="/static/images/casas_azuis.png"
          alt="First Image"
          width={1080}
          height={107}
          style={{ clipPath: `inset(0 0 0 ${currentPercentage}%)` }}
        />
        <div className="separator-line" style={{ left: `${currentPercentage}%` }} />
        <div className="percentage-label" style={{ left: `${currentPercentage}%` }}>
          {`${Math.round(currentPercentage)}%`}
        </div>
      </div>
    </div>
  )
}

export default Casas
