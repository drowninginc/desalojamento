import { ReactNode, FunctionComponent } from 'react'

type Props = {
  children?: ReactNode
  className?: string
}

const Container: FunctionComponent<{ className?: string }> = ({ children, className }: Props) => {
  return <div className={className ? `o-container ${className}` : 'o-container'}>{children}</div>
}

export default Container
