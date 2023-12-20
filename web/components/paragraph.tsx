import Container from './container'

type Props = {
  children: React.ReactNode
}

const Paragraph = ({ children }: Props) => {
  return (
    <Container>
      <p className="paragraph">{children}</p>
    </Container>
  )
}

export default Paragraph
