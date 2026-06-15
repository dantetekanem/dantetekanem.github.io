Consegui levar este blog do zero à produção em 1 hora. Incluindo:
- Motor do blog com Jekyll (Markdown &#10084;&#65039;)
- Hospedagem no Github para disponibilidade
- CSS inspirado no meu site pessoal
- Suporte a highlight de código
- Mapeamento e revisão de SEO
- 3 posts (incluindo este)
- Encaminhamento de DNS de blog.leonardopereira.com para dantetekanem.github.io

Como? `Ruby` e `Cursor` são a resposta. O primeiro dispensa apresentações: [Jekyll](https://jekyllrb.com/) é uma gem incrível que existe há muito tempo, e o [Github Pages](https://pages.github.com/) também oferece várias formas fáceis de começar um novo site. Você só precisa ter um repositório `username/username.github.io`.
Mas, sem o [Cursor](https://www.cursor.com/), isso teria levado o dia inteiro, ou talvez até alguns dias. Em vez disso, usando o poder do Composer, `claude-3.7-sonnet-thinking` e algumas boas instruções, ele criou tudo do zero, autocorrigiu os problemas e entregou um primeiro rascunho perfeito.

Não houve mágica nos meus comandos. Eu não tenho o conjunto exato de instruções, mas foi algo mais ou menos assim:
- Vamos criar um novo blog usando Jekyll; quero que ele pareça com meu site pessoal: leonardopereira.com
- ~ O Claude começou a trabalhar, pegou todas as gems, rodou os comandos e mais um pouco.
- Parei parte do progresso e pedi para não usar comentários por enquanto, porque eu queria avaliá-los melhor.
- ~ Na primeira sessão de debug, o CSS não estava funcionando. Reclamei, e ele fez o próprio debugging e identificou que o SASS não estava funcionando. Depois de algumas tentativas, decidiu usar CSS puro (uma ótima escolha, na verdade).
- Adicionei umas 10 instruções para deixar o CSS exatamente do jeito que eu queria, depois de navegar e corrigir.
- Para os posts, reescrevi tudo com a minha própria voz e pedi para corrigir qualquer problema de gramática ou comunicação ruim, para que eu pudesse melhorar a qualidade deste blog.

E sim, é isso. Metade do outro tempo foi gasto apontando o DNS correto no Squarespace e no Github.

## Alguns aprendizados

Agora este é um post interessante da minha parte. Eu tive alguns problemas com o Cursor no passado. A maioria deles eu resolvi com [Rules](https://docs.cursor.com/context/rules-for-ai) e aprendendo formas melhores de usar a plataforma. Mas a tecnologia é, sem dúvida, uma das melhores coisas que temos. Muitos dos meus problemas caíam em uma coisa: engenheiros ruins.
Eu já vi muitas pessoas escrevendo código _horrível_ usando AI, fazendo deploy em produção, chamando de pronto, e depois o PagerDuty me chamando de volta explicando que tudo caiu.
AI não é uma panaceia; ela alucina o tempo todo. Você precisa alimentá-la com boas direções, mas mais do que isso. Você precisa ler o que está acontecendo, precisa questionar se o código produzido faz sentido e se ele realmente está resolvendo o problema da forma correta. Pedir algo, subir o servidor e ver os resultados é incrível. Mas isso não é código pronto para produção. Um bom engenheiro precisa escrever bom código, entender design e usar AI pelo que ela é: uma ferramenta fantástica para ajudar a melhorar seu trabalho.

Eu tive preconceito contra o Cursor por um tempo, baseado em experiências ruins. Felizmente, esse não é mais o caso. Estou criando um novo app com funcionalidades que, de outra forma, levariam anos, e devo ter um protótipo nos próximos meses, trabalhando nele apenas no meu tempo livre.

## Sobre escopo

Outra coisa extremamente valiosa para tirar o melhor da AI é: isolar seu escopo. Tenho usado bastante o ChatGPT para isso. Abro uma nova sessão e dou todo o contexto do que quero realizar — corrigir um bug, criar uma nova funcionalidade etc. Depois, forneço os arquivos e começo a iterar com essa informação. Esse isolamento diminui muito o nível de alucinações, ajudando bastante a corrigir problemas e **fazer a coisa acontecer**. E, de novo, eu reviso tudo. Se não sei alguma coisa, pergunto ao modelo o que significa. Ele está me ajudando a construir algo, mas eu ainda mantenho a responsabilidade por tudo.

Use AI, eleve o seu jogo. Assuma responsabilidade. <span style="color: #F2C94C;">Happy coding!</span>
