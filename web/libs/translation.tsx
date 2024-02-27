export default function (section: string, language: string, city: string): React.ReactNode {
  switch (section) {
    case 'authors':
      return language == 'en' ? (
        <>
          {' '}
          A visual essay by{' '}
          <a href="https://www.linkedin.com/in/joaobernardonarciso/" target="_blank">
            João Bernardo Narciso
          </a>{' '}
          &{' '}
          <a href="https://www.linkedin.com/in/claudiofischerlemos/" target="_blank">
            Cláudio Lemos
          </a>
        </>
      ) : (
        <>
          Um ensaio visual por{' '}
          <a href="https://www.linkedin.com/in/joaobernardonarciso/" target="_blank">
            João Bernardo Narciso
          </a>{' '}
          e{' '}
          <a href="https://www.linkedin.com/in/claudiofischerlemos/" target="_blank">
            Cláudio Lemos
          </a>
        </>
      )
    case 'intro':
      if (language === 'en') {
        if (city === 'Porto') {
          return <>TODO: English content for Porto</>
        } else if (city === 'Lisbon') {
          return <>TODO: English content for Lisbon</>
        }
      } else if (language === 'pt') {
        if (city === 'Porto') {
          return (
            <>
              Nas cidades portuguesas vive-se uma crise de habitação sem precedentes nas últimas
              décadas. Esta crise gerou uma forte contestação social, que foi capaz de trazer para o
              centro do debate políticas relacionadas com a intervenção do Estado no mercado de
              arrendamento e com a regulação do turismo, em particular o{' '}
              <mark>alojamento local (AL)</mark>. O governo, perante o agigantar da crise, anunciou
              o programa Mais Habitação que pretendia responder parcialmente a estas questões,
              colocando algumas restrições à atividade deste tipo de alojamento turístico. Face a
              este clima político, os defensores do Alojamento Local têm-se organizado, promovendo o
              AL como uma importante atividade económica e como fonte de sustento para muitas
              famílias.
            </>
          )
        } else if (city === 'Lisbon') {
          return <>TODO: Portuguese content for Lisbon</>
        }
      }
      return (
        <>
          Invalid language: {language} or city: {city}
        </>
      )
    case 'map1':
      return language == 'en' ? (
        <>
          Toponymy can be an indicator of the overwhelming difference in gender representations in a
          city. In Porto, <mark className="m">44% of the streets are named after men.</mark>
        </>
      ) : (
        <>
          A toponímia é um indicador da esmagadora diferença nas representações de género na cidade.
          No Porto, <mark className="m">44% das ruas têm nome de homens.</mark>
        </>
      )
    case 'map2':
      return language == 'en' ? (
        <>
          Only <mark className="f">4% of the streets are named after women.</mark>
        </>
      ) : (
        <>
          Apenas <mark className="f">4% das ruas têm nomes de mulheres.</mark>
        </>
      )
    case 'map3':
      return language == 'en' ? (
        <>
          The remaining ones have names that can either be masculine or feminine,{' '}
          <b>but refer to things or concepts.</b>
        </>
      ) : (
        <>
          As restantes têm nomes que podem ser masculinos ou femininos, mas que{' '}
          <b>se referem a coisas ou conceitos.</b>
        </>
      )
    case 'map4':
      return language == 'en' ? (
        <>
          Not only is the number of streets with women's names{' '}
          <mark>
            <i>11 times</i>
          </mark>{' '}
          smaller than the ones named after men, the importance and extent of these streets are also
          reduced.
        </>
      ) : (
        <>
          Não só o número de ruas com nomes de mulheres é{' '}
          <mark>
            <i>11 vezes</i>
          </mark>{' '}
          menor que com nomes de homens, a importância e extensão dessas ruas também é reduzida.
        </>
      )
    case 'map5':
      return language == 'en' ? (
        <>
          The most important street named after a woman is <b>Rua de Santa Catarina</b>.
        </>
      ) : (
        <>
          A mais importante rua com nome de mulher é a <b>Rua de Santa Catarina</b>.
        </>
      )
    case 'map6':
      return language == 'en' ? (
        <>
          Other big streets are: <b>Rua de Nossa Senhora de Fátima</b>, in Boavista.
        </>
      ) : (
        <>
          Outras ruas de maior dimensão são: a <b>Rua de Nossa Senhora de Fátima</b>, na Boavista.
        </>
      )
    case 'map7':
      return language == 'en' ? (
        <>
          <b>Rua da Senhora do Porto</b> and <b>Rua de Santa Lúzia</b>, in Ramalde.
        </>
      ) : (
        <>
          A <b>Rua da Senhora do Porto</b> e a <b>Rua de Santa Lúzia</b>, em Ramalde.
        </>
      )
    case 'map8':
      return language == 'en' ? (
        <>
          And <b>Rua de Nossa Senhora do Calvário</b>, in Campanhã. There is a pattern here and it
          is not by chance.
        </>
      ) : (
        <>
          E a <b>Rua de Nossa Senhora do Calvário</b>, em Campanhã. Há aqui um padrão e não é por
          acaso.
        </>
      )
    case 'paragraph1':
      return language == 'en' ? (
        <></>
      ) : (
        <>
          O ritmo de novas licenças tem estado quase sempre em crescimento, com exceção dos anos da
          COVID-19. Cada novo ano tem batido recordes de novos alojamentos, sendo que só em 2022
          foram registados <mark>1914 novas licenças</mark>, representando 20% das licenças até à
          data.
        </>
      )
    case 'paragraph2':
      return language == 'en' ? (
        <>
          Even today, the public space is a place of dispute of social constructions of gender and
          power asymmetries.
        </>
      ) : (
        <>
          Ainda hoje, o espaço público é local de disputa de construções sociais de género e de
          assimetrias de poder.
        </>
      )
    case 'paragraph3':
      return language == 'en' ? (
        <>
          Not only are women under-represented, the most important streets with names of women are
          named after saints and religious figures. Apart from the religious and dynastic figures,
          there is a small minority of streets named after feminine writers, artists, teachers, an
          engineer and a scientist. <i>Hover the mouse on each rectagle and the labels.</i>
        </>
      ) : (
        <>
          Não só as mulheres estão subrepresentadas, como as que dão nome a quase todas as ruas de
          maior destaque são santas. Retirando as figuras religiosas e dinásticas, sobra um minoria
          de ruas com nomes de mulheres de letras, artistas, professoras, uma engenheira e uma
          cientista.
        </>
      )
    case 'paragraph4':
      return language == 'en' ? (
        <>
          It should be noted that, despite this classification by professions, several of these
          women were recognised for their political work. Virgínia Moura and Maria Lamas are
          examples, both with a legacy of anti-fascist resistance and feminist struggle.
        </>
      ) : (
        <>
          De notar que, apesar desta classificação por profissões, várias destas mulheres foram
          reconhecidas pelo seu trabalho político. Virgínia Moura e Maria Lamas são exemplos, ambas
          com um legado de resistência antifascista e de luta feminista.
        </>
      )
    case 'paragraph5':
      return language == 'en' ? (
        <>
          The attribution of names to streets is a way of paying homage and not letting legacies
          that deserve to be remembered fall into oblivion.
        </>
      ) : (
        <>
          A atribuição de nomes a ruas é uma forma de homenagem e de não deixar cair em esquecimento
          legados que merecem ser recordados.
        </>
      )
    case 'paragraph6':
      return language == 'en' ? (
        <>
          Initiatives such as{' '}
          <a href="https://www.instagram.com/p/CMiErEAsVZc/" target="_blank">
            the petition for the attribution of the name of Gisberta Salce
          </a>{' '}
          to a city street, launched by the Porto Pride March, proves that. The legacy of Gisberta,
          a trans woman, victim of transphobia and murdered in 2006, deserves to be remembered.
        </>
      ) : (
        <>
          Iniciativas como a{' '}
          <a href="https://www.instagram.com/p/CMiErEAsVZc/" target="_blank">
            petição para a atribuição do nome de Gisberta Salce
          </a>{' '}
          a um arruamento da cidade, lançada pela Marcha do Orgulho do Porto, provam isso mesmo. O
          legado de Gisberta, mulher trans, vitima de transfobia e assassinada em 2006, merece ser
          recordado.
        </>
      )
    case 'paragraph7':
      return language == 'en' ? (
        <>
          Despite this petition,{' '}
          <a
            href="https://www.jn.pt/local/noticias/porto/porto/a-memoria-de-gisberta-e-o-conflito-de-genero-nas-ruas-do-porto-14485165.html"
            target="_blank">
            the response from the President of the city's Toponymy Commission
          </a>{' '}
          was that "we could not establish a relationship between Gisberta and Porto" and that "we
          think that the person herself did nothing for Porto". This response was then overriden in
          a subsequent{' '}
          <a
            href="https://www.publico.pt/2022/03/19/culturaipsilon/noticia/aprovacao-comissao-toponimia-gisberta-perto-rua-porto-1999403"
            target="_blank">
            vote of that comission
          </a>{' '}
          that finally allowed the name of Gisberta to be shortlisted to a future street name.
          However, this discourse configures the denial of a legacy, much more than an isolated case
          of a crime, that mobilises society and brought the term "transphobia" into the public
          debate. Decisions like this are condemnations to the invisibilization of women and
          minority groups.
        </>
      ) : (
        <>
          Apesar desta mobilização, a{' '}
          <a
            href="https://www.jn.pt/local/noticias/porto/porto/a-memoria-de-gisberta-e-o-conflito-de-genero-nas-ruas-do-porto-14485165.html"
            target="_blank">
            resposta da Presidente da Comissão de Toponímia
          </a>{' '}
          da cidade foi a de que "Não conseguimos estabelecer uma relação entre a Gisberta e o
          Porto" e que "achamos que a pessoa em si nada fez em prol do Porto". Esta resposta foi
          entretanto ultrapassada por um{' '}
          <a
            href="https://www.publico.pt/2022/03/19/culturaipsilon/noticia/aprovacao-comissao-toponimia-gisberta-perto-rua-porto-1999403"
            target="_blank">
            voto da comissão
          </a>{' '}
          em que finalmente se permitiu que o nome de Gisberta fizesse parte da bolsa de nomes de
          futuras ruas da cidade. Isto é a negação de um legado, muito mais do que um caso isolado,
          que mobiliza a sociedade e trouxe o termo "transfobia" para o debate público. Decisões
          como esta são condenações à invisibilização de mulheres e de grupos minoritários.
        </>
      )
    case 'paragraph8':
      return language == 'en' ? (
        <>
          Toponymy is not a simple detail or an arbitrary process: it is made of political and
          ideological choices that reinforce hegemonic narratives. It is necessary to reflect on
          them.
        </>
      ) : (
        <>
          A toponímia não é um simples pormenor ou processo arbitrário: é feita de escolhas
          políticas e ideológicas que reforçam narrativas hegemónicas. É preciso refletir sobre
          elas.
        </>
      )
    case 'label1':
      return language == 'en' ? (
        <>Virgínia Moura, anti-fascist militant</>
      ) : (
        <>Virgínia Moura, militante antifascista</>
      )
    case 'methodologyTitle':
      return language == 'en' ? <>Methodology</> : <>Metodologia</>
    case 'methodologyText':
      return language == 'en' ? (
        <>
          The data and code used for this essay are openly available here. We used{' '}
          <a href="https://openstreetmap.org" target="_blank">
            Open Street Maps
          </a>{' '}
          data regarding street names and location, and{' '}
          <a href="https://mapbox.com" target="_blank">
            Mapbox
          </a>{' '}
          for the interactive map.
        </>
      ) : (
        <>
          Os dados e o código utilizado para este ensaio estão disponíveis de forma aberta aqui.
          Utilizamos os dados do{' '}
          <a href="https://openstreetmap.org" target="_blank">
            Open Street Maps
          </a>{' '}
          relativos às localizações e aos nomes das ruas, a ferramenta{' '}
          <a href="https://mapbox.com" target="_blank">
            Mapbox
          </a>{' '}
          para o mapa interativo.
        </>
      )
    case 'referencesTitle':
      return language == 'en' ? 'References' : 'Referências'
    case 'Saint':
      return language == 'en' ? 'Saint' : 'Santa'
    case 'Writer':
      return language == 'en' ? 'Writer' : 'Escritora'
    case 'Artist':
      return language == 'en' ? 'Artist' : 'Artista'
    case 'Monarch':
      return language == 'en' ? 'Monarch' : 'Monarca'
    case 'Unknown':
      return language == 'en' ? 'Unknown' : 'Desconhecido'
    case 'Teacher':
      return language == 'en' ? 'Teacher' : 'Professora'
    case 'Engineer':
      return language == 'en' ? 'Engineer' : 'Engenheira'
    case 'Scientist':
      return language == 'en' ? 'Scientist' : 'Cientista'
    case 'Landlord':
      return language == 'en' ? 'Landlord' : 'Senhoria'
    case 'referencesTitle':
      return language == 'en' ? 'References' : <>Referências</>
    case 'waffleTitle':
      return language == 'en' ? <>Streets ordered by length</> : <>Ruas por ordem de comprimento</>
    case 'waffleText':
      return language == 'en' ? (
        <>
          We decided to plot these streets by gender, <mark className="m">men</mark> and{' '}
          <mark className="f">women</mark>. Each rectangle represents a street of Porto. Its height
          is proportional to the street's actual length.{' '}
          <i>Hover the mouse on each rectagle to see the street's name and length.</i>
        </>
      ) : (
        <>
          Decidimos organizar as ruas por género, <mark className="m">homens</mark> e{' '}
          <mark className="f">mulheres</mark>. Cada retângulo representa uma rua do Porto. A sua
          altura é proporcional ao comprimento da rua.{' '}
          <i>Clica em cada retângulo para saberes o nome da rua e o seu comprimento.</i>
        </>
      )
    case 'waffleText1':
      return language == 'en' ? <>Yup, still going! 😅</> : <>Sim, ainda não acabou! 😅</>
    case 'waffleText2':
      return language == 'en' ? <>Almost there... 🏃</> : <>Quase lá... 🏃</>
    case 'waffleParagraph':
      return language == 'en' ? (
        <>
          The total length of streets named after men is <mark className="m">14 times bigger</mark>{' '}
          than of the ones named after women.
        </>
      ) : (
        <>
          O comprimento total das ruas dos homens é <mark className="m">14 vezes maior</mark> que o
          das ruas das mulheres.
        </>
      )
    case 'selectStreet':
      return language == 'en' ? (
        <>Click on a street to get more information</>
      ) : (
        <>Clica numa rua para sabares mais informação</>
      )
    case 'source':
      return language == 'en' ? <>Source</> : <>Fonte</>
    case 'explore':
      return language == 'en' ? <>Explore the map</> : <>Explora o mapa</>
    case 'pudding':
      return language == 'en' ? (
        <>
          <p className="pudding">
            Selected as one of the Best Visual and Data-Driven Stories of 2022 by{' '}
            <a href="https://pudding.cool/process/pudding-cup-2022/" target="_blank">
              The Pudding
            </a>
          </p>
        </>
      ) : (
        <>
          <p className="pudding">
            Selecionado na categoria Best Visual and Data-Driven Stories of 2022 pelo{' '}
            <a href="https://pudding.cool/process/pudding-cup-2022/" target="_blank">
              The Pudding
            </a>
          </p>
        </>
      )
    case 'nogender':
      return language == 'en' ? <>No Gender</> : <>Sem género</>
    case 'women':
      return language == 'en' ? <>Women</> : <>Mulheres</>
    case 'men':
      return language == 'en' ? <>Men</> : <>Homens</>
  }
}
