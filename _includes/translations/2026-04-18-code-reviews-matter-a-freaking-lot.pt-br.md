![Code Reviewer](/assets/images/codereview.png)

Oi! Meu nome é Leo e eu sou um Code Reviewer profissional. Sim, eu não acho que isso seja uma profissão de verdade, mas eu tenho números para provar que sei do que estou falando pelos próximos minutos. Eu até tenho o apelido de Mr. Comments e meu próprio emoji no Slack, `:mr-comments:`.

Nos últimos 6 meses, fiz mais de 1100 comentários em mais de 320 Pull Requests e revisei mais de 1 milhão de linhas de código, em mais de 35 projetos diferentes. Eu faço, em média, 7 vezes mais Code Reviews do que a nossa taxa normal na Shopify (sim, eu contei). É importante saber que meu título não é real — eu tenho meus próprios projetos para entregar, eu tenho meu próprio trabalho — então isso acontece por meio de um processo e de algumas horas focadas todos os dias.

Neste post, quero compartilhar com você algumas orientações, altamente opinativas — com opiniões apimentadas — sobre como fazer ótimas Code Reviews. Também é importante que você saiba duas coisas enquanto lê isto: primeiro, esta é uma **habilidade humana** que você precisa desenvolver, não uma AI skill. Não crie uma skill a partir disto — treine a si mesmo. Segundo, isto não é uma arte reconhecida. Você frequentemente verá pessoas pedindo mais Code Reviews, com mais qualidade. Mesmo assim, ninguém vai reconhecer você ou dar crédito pelo seu impacto em um projeto. Acredite, eu *sei*.

> Obrigado John, Mary, Steve e Jane pelas Code Reviews. Sem vocês, este projeto nunca teria sido entregue.
>
> — Disse ninguém. Nunca.

Nada disso realmente importa. É sua **responsabilidade** como engenheiro profissional fazer ótimas Code Reviews, e é seu trabalho entender o impacto delas na sua empresa. Responsabilidade, na verdade, é o primeiro tópico deste post — e vou seguir em ordem de importância, o que pode ser um pouco surpreendente: programar será o último dos tópicos.

É *essencial* que você compreenda estas ideias para fazer uma ótima Code Review, e isso pode soar contraintuitivo — na verdade, muitas coisas aqui vão soar assim. Isto não tem a ver com experiência ou conhecimento de programação. Principal Engineers estão em um dos níveis mais altos de uma empresa, e é surpreendentemente comum ver PRs que causaram incidentes terem sido aprovados por eles. Quero que você saiba disso porque não deve pensar que, só por ser um engenheiro menos experiente, ou por não ter contexto, ou por não estar no projeto, você não consegue fazer ótimas Code Reviews. Qualquer pessoa pode fazer Code Reviews incríveis; ela só precisa prestar atenção.

Certo, então antes de entrar nos tópicos em ordem de importância e nos detalhes de cada um, vamos definir uma coisa:

> Qual é o seu objetivo ao fazer Code Review?

É aprovar o PR. É isso. Esse é o seu objetivo. — E acredite, isso muda tudo. No mundo do OSS (Software de Código Aberto), é muito comum haver muitas restrições obrigatórias, com colaboradores esperando código perfeito — o que significa que a aprovação tem uma barra alta antes de entrar. Essa não é a realidade na sua empresa. Seu objetivo é, e sempre será, aprovar uma mudança, e este é um ponto *enorme*. Mas objetivo e trabalho são duas coisas diferentes, que é meu próximo ponto.

> Qual é o seu trabalho ao fazer Code Review?

Seu trabalho é empurrar para frente, não para trás, o impacto da mudança. Você vai iterar, fazer comentários, compartilhar conhecimento, solicitar mudanças, testar e provar o que está sendo apresentado. Você vai participar e se tornar co-dono daquele pedaço de código. Tudo o que você fizer naquela pequena janela de Code Review será para alcançar o objetivo.

Você **não** vai bloquear com comentários opinativos inúteis como “Isto não segue nossas diretrizes.”, “Eu não teria feito desta forma.”.

Você **vai** bloquear, mas fornecendo toda a ajuda e orientação necessárias rumo ao objetivo. Com a aprovação, você vence, o autor vence, o projeto vence e a empresa vence.

Esses pontos podem parecer confusos agora, então, para simplificar algumas destas ideias, vamos começar:

## Responsabilidade

Quando você começa uma Code Review, você é **igualmente** responsável por quaisquer resultados que esse código implantado produza. Isso mesmo: talvez você não receba os parabéns e as alegrias de uma grande vitória, mas, se isso causar um incidente, também é com você. Então leve isso *extremamente* a sério.
Se você estiver ocupado com outras coisas, não fará uma Code Review. Quando você começa, nada importa mais do que o pedaço de código que está olhando agora.
Isto é a coisa mais importante que você precisa saber. Saber disso permitirá que você aborde o próximo PR com o cuidado e a atenção necessários. O autor confiou em você, e a empresa está confiando em vocês dois.

Então, primeiro: reserve tempo. Uma Code Review pode levar de 5 minutos até um dia inteiro (com mudanças espalhadas). Se qualquer pedaço de código vai tomar mais de 1 hora do seu tempo, provavelmente é grande demais para ser revisado de uma vez. Peça ao autor para dividi-lo em partes menores — todo mundo ganha nesse passo.

Dito isso, uma boa Code Review realisticamente pode levar de 10 a 60 minutos. Como habilidade, isso pode ser treinado, e quanto mais Code Reviews você fizer, mais rápido ficará.

## Entendendo o problema

Leia a descrição do PR **somente** e **apenas** pelo problema. Não se importe com a solução, ou com como ela foi testada manualmente, ou qualquer coisa do tipo. Se houver um ticket ou issue vinculado ao Pull Request, melhor ainda. Evite ser enviesado pela solução que o autor criou.
Provavelmente ele está certo sobre o motivo. Mas se houver 1% de chance de essa ser a abordagem errada — e em uma escala como a da Shopify, onde bilhões de requisições fazem parte do dia a dia — 1% não é um caso de borda, é uma *garantia*. Então não seja enviesado. Isso permitirá que você permaneça focado no problema enquanto a solução oferecida (código e testes) é analisada.

Às vezes, um PR com apenas o título entrega mais valor do que qualquer explicação excruciantemente detalhada de 50 linhas sobre o que o autor acha que está certo. Ninguém jamais vai lembrar dessas explicações de solução. Do problema, vão.

Se o problema for curto, será fácil mantê-lo em mente durante a Code Review. Se for longo, deixe-o aberto ao lado ou em um aplicativo de notas, para que você possa voltar a ele enquanto faz a Code Review.

## Olhe para os testes

> Se a disciplina de especificação de requisitos nos ensinou alguma coisa, é que requisitos bem especificados são tão formais quanto código e podem atuar como testes executáveis desse código!
>
> — Robert C. Martin (Uncle Bob)

Testes são as especificações escritas de todos os requisitos na mudança de código. Olhe para os testes: eles resolvem o problema? Eles cobrem o outro lado do problema? Eles fingem testar o que deveriam estar testando? Stubs e mocks, estou olhando para vocês.
Este é seu primeiro ponto de contato com a solução. É TDD em uma Code Review, e há um bom motivo para o Test Driven Development funcionar tão bem — mesmo que possa ser um exercício chato. Você recebe uma especificação (testes) do que um contrato (código) fará.

Compare os testes com as notas que você fez sobre o problema. Eles batem? Se o problema diz “Melhorar a performance ao buscar nosso feed diminuindo o uso de queries”, existe um teste contando menos queries acontecendo agora? Há confirmação de que os testes executam exatamente o que foi proposto? Alguma das mudanças adaptou testes existentes para se encaixar? — este é um padrão *muito* perigoso. Às vezes um teste é modificado para satisfazer uma mudança, ou a AI o adapta para satisfazer você. Você precisa garantir que essa foi a decisão correta.

Alguns outros pontos que vale checar:
- Os novos testes são realmente novos, ou estão reafirmando algo já coberto em outro lugar?
- Os nomes dos testes descrevem o comportamento sendo verificado, não o método sendo chamado?
- A estrutura arrange-act-assert está clara, ou a preparação está vazando para a asserção?
- Os casos de borda estão cobertos? Entradas vazias, nil, zero, negativo, valores de limite, tipos inesperados.
- Os caminhos de falha são testados com o mesmo cuidado que o caminho feliz?
- Testes assíncronos ou dependentes de tempo usam sleeps reais, ou usam fakes e freezers adequados?
- Fixtures e factories estão adicionando ruído? Um teste que precisa de 40 linhas de setup geralmente está testando a coisa errada.
- Um único teste afirma um comportamento, ou tenta cobrir três de uma vez?
- Se um teste falhar, a mensagem de erro dirá *por quê* imediatamente, ou você precisará investigar?
- Existe cobertura para a regressão que motivou o PR em primeiro lugar?

## Conheça os designs

Não consigo enfatizar o suficiente o quanto é *importante* conhecer princípios de design e conceitos de arquitetura. Eu amo os princípios [SOLID](https://pt.wikipedia.org/wiki/SOLID). Eles me ajudam a escrever código muito melhor. Existem muitos outros, mas como a Shopify é focada em Ruby, e sua abordagem a objetos simplesmente parece natural (e SOLID funciona bem para qualquer linguagem, honestamente), é justo ancorar a discussão nisso.

Neste passo, eu pessoalmente gosto de usar minha imaginação ao olhar para as coisas. Vejo os arquivos, as classes e os métodos como pessoas que sabem o que sabem, e converso com elas. Você pode fazer o que funcionar para você. Mas mantenha os princípios em mente. Se um pedaço de código está violando um princípio, isso é uma pista **poderosa** do que você poderia melhorar e mudar ali. As chances de o código estar errado *só* porque o design foi ignorado são enormes. Olhe para o primeiro princípio do SOLID, o S — Princípio da Responsabilidade Única.

Você tem um pedaço de código que faz isto:

```ruby
class Post < ApplicationRecord
  # ...
  belongs_to :user
  after_create :update_stats_and_notify

  # ...

  private

  def update_stats_and_notify
    user.increment!(:posts_created) # I know we can do this other ways...
    ThirdPartyApi.new(self).send_notification_email # OMG
  end
end
```

Olhe para o nome do método: `update_stats_and_notify`. A palavra **and** já está gritando para você. Sempre que você precisa de um *and* para descrever o que um método faz, está admitindo em voz alta que ele faz duas coisas. Só isso já é o smell — você nem precisa ler o corpo para saber que o SRP está sendo violado.

E então você lê o corpo, e é pior do que imaginava. Por que você colocaria uma chamada a terceiros — provavelmente uma requisição HTTP — dentro da sua própria transação de banco de dados? Nem mesmo é `after_create_commit`. Incrementar `posts_created` deveria fazer parte da transação, então, se um falha, o outro também falha. Mas o email? Ele não tem nada que fazer ali. Post está fazendo *muito* mais do que deveria — enviar notificações não é responsabilidade dele.

Não vou entrar nos detalhes dos princípios aqui, esse não é o objetivo deste post. Você deve conhecê-los, no entanto. Estude-os. Viva por eles.

## Smells e vizinhança

Um smell é um pedaço de código reconhecidamente errado em uma base de código. Eles são comuns e aparecem em todas as linguagens. Em uma suíte Minitest, se você vê um `.any_instance`, isso é um smell claro. Em TypeScript, um `any` perdido — smell. Em Ruby, um `rescue` sem classe — smell.

Smells dão um mapa. Eles apontam direto para os lugares com maior chance de recompensar sua atenção, e o código bem ao lado deles — a *vizinhança* — geralmente conta o resto da história. Se o que está ao redor do smell parece apressado, inconsistente ou superengenheirado, a mudança que você está revisando provavelmente está nadando na mesma água. Pergunte a si mesmo se ela se encaixa, ou se está apenas empilhando em cima de algo que já estava quebrado.

Vizinhança não é só para smells, porém. Se um PR toca 2 linhas em um arquivo de 1000 linhas, o que as 50 linhas acima e abaixo estão fazendo? Elas combinam com a mudança? A mudança está dentro de um método de 200 linhas que provavelmente já violava os princípios de design? Se sim, você está no lugar certo — e pode se perguntar (nosso próximo tópico): onde este código deveria estar, de fato?

Aqui está uma lista curta e não exaustiva de smells nos quais fico de olho, agrupados por linguagem:

Ruby e Rails:
- Métodos longos e listas longas de parâmetros
- Feature envy: um método que fica alcançando dados de outro objeto
- Models gordos com uma pilha de callbacks fazendo trabalhos não relacionados
- Resgatar exceções sem especificar a classe da exceção
- Argumentos booleanos que mudam o comportamento de um método

Minitest:
- Stubs com `.any_instance`
- Testes nomeados por métodos em vez de comportamentos
- Um teste afirmando três coisas não relacionadas
- Mockar código que é nosso — se você está fazendo stub da sua própria classe, o design provavelmente está errado. Mockar um wrapper ao redor de um terceiro é a jogada certa.
- Chamadas a `sleep` em vez de helpers de tempo ou esperas adequadas

JavaScript e TypeScript:
- `any`, e a escapatória `as unknown as`
- `// @ts-ignore` sem comentário explicando o motivo
- A asserção não nula `!` usada como “confia em mim”
- Ternários profundamente aninhados
- `console.log` deixado no diff

Você vai criar sua própria lista com o tempo. O ponto não é memorizar smells — é treinar o reflexo que diz “calma, isso parece errado” antes mesmo de terminar de ler o método.

  [All the Little Things](https://www.youtube.com/watch?v=8bZh5LMaSmE), da [Sandi Metz](https://sandimetz.com/), é incrível. Não é focado *necessariamente* no tópico de que estou falando, embora você consiga relacionar facilmente. É **obrigatório** assistir.

## Pergunte a si mesmo

Este é curto. Continue se perguntando se o que você está vendo faz sentido com o problema. Se você não consegue responder, deixe um comentário fazendo a pergunta. Perguntas em uma Code Review podem ter mais peso do que qualquer comentário que você deixe. Elas fazem o autor pensar de novo, e fazem de você um co-pensador em vez de um guardião. “Este é mesmo o lugar certo para isto?” “O que acontece se o job tentar de novo?” “Isto ainda funcionaria numa sexta à noite com 10 vezes mais tráfego?” Perguntas como estas já mudaram a direção de PRs que estavam a uma aprovação de serem mergeados.

Como isto não é uma ciência, não há certo ou errado direto; o que temos é uma base de código espalhada, com muitas mentes trabalhando juntas para tirar o melhor dela. Uma pergunta bem colocada costuma ser a coisa individual mais valiosa em um PR. Multiplique isso por centenas de PRs por trimestre, e você está moldando como uma equipe inteira pensa sobre código.

Então, continue se perguntando se isto faz sentido.

## Inspecione o código

Conheça bem o seu ofício. Desculpe pela linguagem. Isto é meio opcional, de verdade. Se você é um ótimo engenheiro Ruby, ou um ótimo engenheiro Javascript, ou, ok, você entendeu. Então, você sabe que um único `huge_array.map!` terá uma performance muito melhor do que algum mapeamento maluco de array com um `each` ali. Você também conhecerá os trade-offs. Você deve saber que em Ruby um `!` significa que aquilo vai se modificar inline, ou levantar uma exceção. E também sabe que um predicado `?` sempre retorna um booleano.

Todo esse conhecimento é algo que você sabe que precisa aplicar em uma Code Review. Esta é uma das coisas nas quais a maioria das Code Reviews foca — aquilo que as pessoas sabem. Qualidade de código e conhecer os detalhes são contribuições maravilhosas; enriquecem muito, mas são apenas uma fatia pequena e rara do que fazemos.

Esta parte também é uma das mais fáceis de ser substituída por AI. AI é ótima nessas coisas se você apontá-la para o lugar certo. Você já viu o que o [Autoresearch](https://shopify.engineering/autoresearch) consegue fazer?

## Seja razoável

Às vezes um PR precisa entrar em questão de horas ou minutos e não deveria ser bloqueado pelas suas descobertas. Para esses casos, temos algumas ferramentas. Uma delas é o “ticket de fast-follow” — o autor assume a responsabilidade de resolver os achados assim que possível depois do merge. Outras vezes, você simplesmente deixa passar.

Mas não seja razoável demais. Há muitos casos em que a urgência vai gritar com todo mundo, mas você ainda precisa defender o que é melhor para os merchants. Às vezes seu pushback é só uma conversa extra de 10 minutos. Eu já estive lá, e isso mudou tudo para melhor. Se você aplicou tudo acima, consegue fazer pushback e concessões ao mesmo tempo — elas não são opostas quando você tem clareza sobre o problema. Entender o problema é uma das primeiras coisas que você precisa fazer.

## Escreva bons comentários, caramba

Uma pequena confissão antes de mergulharmos. Eu disse antes que os tópicos estariam em ordem de importância, e estavam — até este. Escrever bons comentários é, na verdade, a segunda habilidade mais importante, logo depois de Responsabilidade. Coloquei isso no final de propósito, porque todos os tópicos anteriores são aquilo de que um bom comentário depende: o problema, os testes, o design, os smells, as perguntas. Sem esse contexto, um comentário é só uma opinião. Com ele, um comentário vira um guia. E esse é o ponto inteiro desta seção.

Agora. Como você escreve bons comentários, caramba? Mantenha o foco no seu objetivo. Seu comentário deve dar direção, fazer as perguntas certas, levantar a conversa certa. Às vezes, quando reviso um pedaço de código que acho errado, provo isso para mim mesmo primeiro. Eu literalmente abro o `irb` ou o `node`, faço uma amostra do código e executo. Eu estava certo ou errado? Se estava errado, aprendi, o que é bom para mim e bom para a próxima Code Review. E se eu estiver certo?
Então faço um comentário, e passo as instruções junto com ele.

Vamos imaginar que temos esta mudança:

```ruby
class OrdersController < ApplicationController
  def create
    order = Order.new(order_params)
    order.total = order.items.sum { |i| i.price * i.quantity }
    order.tax = order.total * 0.13
    order.status = order.total > 500 ? "review" : "pending"

    if order.save
      OrderMailer.confirmation(order).deliver_later
      redirect_to order
    else
      render :new
    end
  end
end
```

E meu comentário:

```
Podemos mover toda essa lógica de negócio para fora do controller se dermos ao Order a responsabilidade pelas próprias regras.
Por exemplo, vamos usar um before_validation calculando os totais, e um predicado para o limite de Code Review, assim:

class Order < ApplicationRecord
  REVIEW_THRESHOLD = 500
  SALES_TAX = 0.13

  before_validation :calculate_totals

  def requires_review?
    total > REVIEW_THRESHOLD
  end

  private

  def calculate_totals
    self.total  = items.sum { |i| i.price * i.quantity }
    self.tax    = total * SALES_TAX
    self.status = requires_review? ? "review" : "pending"
  end
end

Agora o controller apenas constrói, salva e redireciona, e qualquer outro chamador (um job, uma Rake task, um endpoint de API) recebe as mesmas regras de graça. Como bônus, removemos todos os números mágicos.
```

Eu não apenas apontei que isso estava errado e que o autor precisava corrigir. Eu o guiei pela solução. Meu comentário foi uma adição, não uma ação de bloqueio (embora eu possa solicitar mudanças e literalmente bloquear o merge do PR). Estamos fazendo e trabalhando nisso juntos. E precisamos fazer isso o tempo todo.

Às vezes, porém, você não tem a solução — você tem uma suspeita. É aí que uma boa pergunta vence uma resposta ruim. Vamos imaginar que este PR adiciona um novo `ProcessRefundJob`:

```ruby
class ProcessRefundJob < ApplicationJob
  def perform(refund_id)
    refund = Refund.find(refund_id)
    Stripe::Refund.create(charge: refund.charge_id, amount: refund.amount)
    refund.update!(status: "completed")
  end
end
```

E meu comentário:

```
Ei, uma coisa rápida. Se a chamada ao Stripe tiver sucesso, mas o refund.update! levantar erro, o Sidekiq vai tentar executar o job inteiro de novo, certo? Isso chamaria o Stripe de novo e reembolsaria o cliente duas vezes.

Estou deixando passar algo aqui, ou precisamos separar a chamada ao Stripe da atualização no banco, ou passar uma chave de idempotência para que o Stripe deduplique do lado dele? Fiquei curioso sobre como você estava pensando nisso.
```

Eu não acusei, não bloqueei, não exigi uma reescrita. Compartilhei o que vi, ofereci dois caminhos concretos e devolvi o problema ao autor. Ou ele percebe o bug, ou me ensina por que já é seguro. Ambos os resultados são vitórias.

Direcione seus comentários para o nosso objetivo: aprovar o PR.

## Conclusão

Espero que você tenha aprendido algumas coisas com isto. É assim que eu trabalho, e venho moldando minhas Code Reviews desta forma deliberadamente há bem mais de uma década. Eu amo Code Reviews porque aprendo muito, e também consigo ensinar muito. Eu realmente gosto deste exercício, e o transformei em uma habilidade. Acredito firmemente que você também pode transformá-lo em uma das suas.
Agora, com AI escrevendo 95% do nosso código ou mais, slop por toda parte, soluções no brute force que vão nos satisfazer — buscando plausibilidade, não correção — saber fazer ótimas Code Reviews é ainda mais importante.

Eu diria que Code Reviews serão a coisa mais importante que teremos no futuro. Na Shopify estamos enfatizando isto cada vez mais.

Tem perguntas ou ideias sobre isto? Você pode me encontrar em [me@leonardopereira.com](mailto:me@leonardopereira.com). Espero que tenha gostado.
