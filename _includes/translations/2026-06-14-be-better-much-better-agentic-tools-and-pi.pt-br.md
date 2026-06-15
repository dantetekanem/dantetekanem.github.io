![Leo Pi](/assets/images/leo-pi.png)

Eu não escrevi uma única linha de código este ano. Nenhuma. E entreguei mais do que em qualquer outro ano da minha carreira — centenas de milhares de linhas alteradas. Se isso soa irresponsável, ótimo. Fique comigo, porque é exatamente o oposto.

Tecnologia tem esses momentos em que o chão se move debaixo de você. Isso acontece em muitas áreas, mas em tecnologia é brutal porque o mundo antigo desaparece quase da noite para o dia.

O iPhone é o exemplo óbvio. Antes dele, celulares eram "bons o suficiente." Então viraram outra coisa completamente diferente. Ele mudou tudo. Hoje as pessoas mal conseguem lembrar de apertar o mesmo número três vezes só para digitar uma letra em um SMS.

AI está fazendo a mesma coisa conosco, desenvolvedores. Alguns de nós sabem disso. Nem todo mundo enxerga ainda. Tenho muita sorte de estar na Shopify, onde Tobi decidiu que AI era uma expectativa básica para todos nós. Eles nos deram as ferramentas, e nossa cultura mudou. Todos queríamos mergulhar mais fundo nesse oceano — e mergulhamos.

Ainda lembro da primeira vez que autocomplete com AI no VS Code pareceu real. Era mágico ver aquilo adivinhar as próximas linhas e aceitar com Tab. O tempo digitando caiu pelo menos pela metade. Só isso já parecia enorme.

Anos depois, por volta de 2020, o GPT-3 ganhou vida. Todo mundo estava usando — não em código, ainda não. Mas não demorou. No começo de 2023, o Cursor entrou no jogo. Outra mudança, uma mudança enorme. Agora não estávamos mais apenas autocompletando — estávamos planejando, pedindo mudanças completas e aceitando diffs em arquivos que nem tínhamos aberto. O motor de indexação, adicionando busca semântica local para os agentes, mudou o jogo. Ele alcançava lugares que nem sabíamos que existiam. A Shopify estava prosperando ali naquele momento, com milhares de engenheiros testando a ferramenta antes de todo mundo.

Então veio 2025, e com ele o Claude Code. Na minha opinião pessoal, foi uma das peças de tecnologia mais importantes que um engenheiro de software poderia tocar. Ele veio com vários tropeços irritantes, como pedir permissão para tudo. Mas a base estava ali: agentes que não mostravam cada mudança, removendo o engenheiro do código e levando-o de volta à criatividade. Uma nova IDE foi construída — uma que não exigia que você digitasse código, mas que pensasse sobre o loop, o agente, o problema e o que você queria fazer.

O modo YOLO (pular permissões perigosamente) removeu a última restrição que tínhamos: ficar de babá do agente em cada leitura de arquivo e comando. Agentes são poderosos. Na maioria das vezes, nós somos aquilo que fica no caminho deles. Começamos a nos tornar prompt engineers.

Levou vários meses para o Claude Code amadurecer e para todos nós descobrirmos do que ele era realmente capaz. A ferramenta estava crescendo enquanto, em paralelo, os modelos ficavam massivamente melhores.

E em novembro de 2025 chegou um novo agente de código: Pi ([pi.dev](https://pi.dev)). Ele corrigiu as coisas nas quais o Claude Code continuava tropeçando, e me conquistou por três motivos:

- **Open source e minimalista por design.** Nada escondido, nada inchado. Você vê exatamente o que o agente está fazendo.
- **Qualquer modelo que você quiser.** Rode no que conseguir alcançar por uma API e troque no meio da sessão quando outro estiver mais afiado para o trabalho.
- **Ele estende a si mesmo.** Chega de implorar por uma feature ou encaixar um MCP customizado. Se o Pi não consegue fazer algo, você constrói uma extensão — geralmente com o próprio Pi — e todo mundo também faz isso.

Aqui está a versão honesta: se eu pudesse moldar o Claude Code exatamente como eu queria, ficaria feliz em continuar. Não posso. O Pi deixou. Para mim, ele começou como uma pequena faísca na Shopify, e o time inteiro se apaixonou por ele — problemas compartilhados recebendo correções compartilhadas, em aberto, todos os dias.

Uma das ferramentas mais incríveis que o Claude Code tem é [agent teams](https://code.claude.com/docs/en/agent-teams). É experimental, então poucas pessoas sabem. O Pi também não vem com isso por padrão, mas esse é exatamente o tipo de coisa em que o Pi é bom: instale uma extensão, abra outro pane no tmux, rode outro agente e conecte os agentes ao redor de tarefas e mensagens.

Foi aí que começamos a dividir trabalho entre agentes dedicados, e avançamos para a próxima onda: os **loop engineers**. Essa é a grande mudança — você para de digitar código e começa a rodar um loop. Você enquadra o problema, os agentes propõem, você julga, aprova, corrige, vai de novo. Um único prompt nunca foi suficiente. A parte de digitar código? Resolvida. O trabalho real subiu um nível, para enquadrar, revisar e guiar esse loop.

E é isso que eu faço todos os dias. Aprendo e construo com modelos, fazendo a coisa acontecer, reaprendendo tudo que eu já sabia por um ângulo completamente novo. Extraindo cada gota de alavancagem que consigo.

Algumas coisas que fiz na Shopify nos últimos 6 meses:

- Limpei um board antigo com 37 tarefas — revisei todas, escrevi 9 PRs e fechei o que estava obsoleto. Levei 2 horas.
- Fiz análise de causa raiz em problemas atravessando telemetria e logs massivos, com bilhões de linhas, em minutos.
- Usei autoresearch para melhorar uma das nossas plataformas, reduzindo o tempo de processamento em background de 22 horas para 40 minutos — ele rastreou o gargalo até a forma como estávamos agrupando o trabalho, não até o hardware. (Sem adicionar poder computacional 😉)
- Removi 5 gems obsoletas do nosso Gemfile MASSIVO na Shopify.

Essa é minha visão a partir do meu próprio trabalho. Mas isso também mudou como trabalho com meus colegas. Dei apresentações e fiz vários 1:1s ajudando colegas a aprenderem e usarem Pi também. Meu objetivo inteiro era desbloqueá-los e permitir que fossem melhores.

Então, voltando ao que eu disse no começo: nem uma linha de código digitada por mim este ano. Isso não é uma ostentação. É simplesmente o novo formato do trabalho.

Agora quero compartilhar o que você também pode aprender e fazer. Pi não é apenas para a Shopify. Há tanto sendo construído por tanta gente que a melhor parte provavelmente ainda está por vir.

## Primeiro aprenda o que é AI

Vai ajudar você a dar o salto para Agentic Tools se entender o que AI consegue fazer. Existem muitos recursos online — tente acompanhar o ritmo e se manter atualizado com tudo que está acontecendo.

E reserve cerca de 2h15 para assistir a isto:

<div style="position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;">
  <iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" src="https://www.youtube.com/embed/xmkSf5IS-zw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>

<br>
<br>

Este é o melhor vídeo que já vi para entregar todo o contexto necessário sobre tudo que está acontecendo agora. Entenda contexto, desafios, largura de banda, ciência, treinamento. É um presente para todos nós.

## Não se apegue a um modelo

Modelos são lançados basicamente todo trimestre. Não se apegue demais a nenhum deles. Experimente novos — eles são bons em resolver problemas diferentes. Opus 4.6 era incrível para código, antes de ser nerfado (eu acredito muito nisso) para o lançamento do Opus 4.7 (que foi terrível). GPT 5.5 é geralmente ótimo em muitas tarefas; para código não é tão bom quanto Opus 4.6, mas é bom. Fable 5 foi incrível para trabalho criativo. Gemini é geralmente ruim (desculpa, é verdade). E não conheço ninguém usando Grok 🤣. De qualquer forma, não se deixe influenciar pelos meus comentários — faça sua pesquisa, experimente suas ferramentas.

E sim, pague pelos modelos, assine as subscriptions. Sempre vale a pena.

Transparência total antes de irmos para a prática: daqui em diante vou falar apenas sobre o que rodo no meu computador pessoal. Quando digo GPT 5.5, quero dizer [Codex](https://chatgpt.com/pricing/) — eu uso a partir da minha assinatura pessoal do ChatGPT, em modo high/xhigh thinking, dependendo da tarefa. Também pago Claude Pro para rodar Claude Code. Use o modelo que servir melhor para você. Só lembre: assinaturas da Anthropic só funcionam dentro do Claude Code — com Pi você cai nos tiers de API deles, que custam muito mais.

## Vamos instalar o Pi e deixar tudo bonito em volta

Aqui está uma lista de coisas que uso no meu ambiente:

- [Homebrew](https://brew.sh/)
- [Ghostty](https://ghostty.org/)
- [Pi](https://pi.dev)
- [Tmux](https://github.com/tmux/tmux)

Se você está no macOS, instale o Homebrew primeiro; depois, o resto é só copiar e colar:

```bash
# Homebrew (if you don't have it yet)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Ghostty and tmux
brew install --cask ghostty
brew install tmux

# Pi
curl -fsSL https://pi.dev/install.sh | sh
```

Você pode copiar e instalar algumas das minhas configurações. Basta colar isto localmente:

tmux:
```bash
curl -fsSL https://raw.githubusercontent.com/dantetekanem/leo-personal-pi/main/configs/tmux.conf -o ~/.tmux.conf
tmux source-file ~/.tmux.conf 2>/dev/null || true
```

ghostty:
```bash
mkdir -p ~/.config/ghostty
for f in config.ghostty local.ghostty new-tmux-session; do
  curl -fsSL "https://raw.githubusercontent.com/dantetekanem/leo-personal-pi/main/configs/ghostty/$f" \
    -o "$HOME/.config/ghostty/$f"
done
# point Ghostty at my config (back up any existing one first)
[ -f ~/.config/ghostty/config ] && mv ~/.config/ghostty/config ~/.config/ghostty/config.bak
ln -sf ~/.config/ghostty/config.ghostty ~/.config/ghostty/config
```

E é assim que minha interface se parece:

![Pi rodando no Ghostty](/assets/images/pi-ghostty-env.png)

## Seus primeiros cinco minutos dentro do Pi

O Pi joga você dentro de uma ferramenta real, não de um tutorial. Este é um lugar em que [pi.dev](https://pi.dev) ainda precisa de mais docs, então aqui está o caminho que dou para as pessoas na primeira vez que elas abrem.

Abra uma pasta em que você possa experimentar com segurança e rode `pi`. Antes de pedir para ele tocar em trabalho real, faça o setup chato:

1. Rode `/login`. Autentique primeiro, senão todo prompt sério vai virar um desvio de autenticação.
2. Rode `/settings`. Não porque você precisa entender tudo ainda, mas porque deve ver o formato da ferramenta: providers, permissões, extensões, comandos, os knobs que você realmente pode girar.
3. Rode `/model` e escolha o modelo com que quer começar. Não trate isso como permanente. Trate como escolher uma lente para o próximo trabalho.
4. Defina o nível de thinking. Use `high` ou `xhigh` quando a tarefa precisar de julgamento, design, pesquisa ou um diff assustador. Use thinking mais leve quando estiver fazendo algo mecânico.
5. Aprenda o atalho: `Shift+Tab` alterna o thinking enquanto você está escrevendo. Parece pequeno. Não é. Você vai mudar os níveis de thinking o tempo todo quando se acostumar a combinar o esforço do modelo com o trabalho.
6. Rode um prompt inofensivo antes de apontar para código de produção:

```text
Read this folder and tell me what kind of project this is.
Do not edit files. Give me a short map of the important files and the first risks you see.
```

Esse prompt pequeno ensina o loop. Pergunte, inspecione, corrija, pergunte de novo. A primeira vitória com Pi não deveria ser um diff gigante. Deveria ser confiança. Você quer aprender como ele lê, como pede permissão, como reporta incerteza, como usa suas ferramentas. Quando isso ficar entediante, você estará pronto para dar trabalho real.

## Pegue desafios maiores e faça o trabalho mais difícil possível

Não use seus agentes apenas para coisas simples como "terminar o ticket xyz" ou "escrever uma função para persistir requests idempotentes em logs." Não. Peça o resultado maior: "reescreva as saídas e logs deste projeto para que cada request compartilhe a mesma idempotency key e seja rastreado corretamente nas nossas ferramentas de terceiros, Grafana e Prometheus."

Empurre o agente para ir mais alto. Ele vai falhar hoje, e essa falha é onde você começa a endurecer seu setup e a criar o harness ao redor dele. Hardening e harness — essas duas palavras estão em todo lugar agora, e por um bom motivo.

Você precisa aprender a fazer planos. Eu amo agentes que mantêm TODO lists — eles seguem um plano e o mantêm consistente. Organize skills para que eles saibam fazer trabalho especializado, como um Rails Engineer, React Engineer, Test Engineer, Security Specialist e muito mais.

Dê poder e ferramentas aos seus agentes para que possam ir mais longe. Acesso à web, conhecimento de dados, como ler logs, como construir dashboards — tudo isso. Tenha MCPs ou extensões locais para encontrar dados conforme necessário. Acesso read-only a um banco de dados para projetos pequenos, acesso ao BigQuery para grandes. Acesso ao Slack para histórico em diferentes canais. Deixe-o saber tudo.

Instale um sistema de memória para que o agente aprenda enquanto trabalha e leve esse conhecimento para a próxima sessão. Se algo estiver faltando, use o próprio Pi para construir uma extensão que resolva.

## Multiplique seus agentes e aprenda a orquestrar

Como eu disse, Claude Code teve agent teams em experimental por um tempo. É uma feature muito cara — ela permite spawnar novos agentes rodando em paralelo. Então, em vez de 1 agente caro, você tem 5 ou 10. Pi também não tem isso por padrão, mas você pode instalar facilmente um pacote para fazer isso. Eu pessoalmente uso [pi-teams](https://www.npmjs.com/package/pi-teams) para isso. Você também vai precisar de [tmux](https://github.com/tmux/tmux).

Quando eu digo **spawnar agentes**, quero dizer criar sessões de agentes separadas, geralmente em panes separados do tmux, cada uma com sua própria janela de contexto e um trabalho estreito. Um agente lê docs. Um rastreia o código. Um escreve testes. Um revisa o diff final. Eles reportam de volta para um agente líder, ou diretamente para você.

Isso não é "soltar dez bots para improvisar no meu repo." Por favor, não faça isso. É assim que você ganha caos caro.

Spawnar agentes só funciona quando você dá uma trilha para cada um:

1. O que exatamente este agente deve fazer?
2. Quais arquivos, docs, logs ou ferramentas ele deve inspecionar?
3. Ele pode editar, ou é read-only?
4. Como é o trabalho pronto?
5. Onde ele deve reportar o resultado?

Além disso, construa uma skill que coloque um agente líder no comando do trabalho. A única preocupação dele é orquestrar e delegar. Para uma tarefa genuinamente difícil, o líder pode enviar pesquisa, testes, segurança e revisão para agentes diferentes, e então tomar a decisão final com toda a evidência coletada.

A lógica por trás desse loop tem tudo a ver com a janela de contexto. Se você assistiu ao vídeo que compartilhei (e deveria), agora sabe mais sobre a importância do contexto para o agente e para o processo de pensamento dele. Se uma tarefa difícil pode acumular quase 1 milhão de tokens em uma sessão, será impossível terminá-la de forma limpa. Ao spawnar agentes para pesquisar online, coletar dados, provar coisas e analisar os melhores lugares no código, seu agente principal fica abaixo de 100k e você ainda tem tudo que precisa.

Agentes são extremamente poderosos por natureza, e você deve deixar essa natureza correr em trilhas estreitas, não enfiar tudo em uma conversa gigante. Esse movimento de dividir para conquistar permite que você se multiplique e quebre os desafios mais difíceis com mais controle, não menos.

Vamos tornar isso concreto. Digamos que você queira construir um novo SaaS que ajude pessoas a encontrar empregos. O que você vai precisar? Muitas coisas. Mas, para este exercício simples, eu faria isto com muitos agentes:

1. Um prompt inicial explicando meu projeto em detalhes, centrado no objetivo do que quero fazer.
2. Pesquisar o framework e o design do projeto, pensando no nível de banco de dados desde o começo.
3. Encontrar referências de sites, tendências fortes de design e a melhor forma de apresentar informação para meu caso de uso — mobile-friendly e fácil para o usuário médio.
4. Descobrir as melhores fontes para crawlear vagas e trazer novas oportunidades.
5. Escrever os prompts que o próprio produto vai usar para reutilizar modelos na inteligência dentro do app.
6. Comparar opções de hospedagem que continuem baratas e ainda suportem a stack que preciso.
7. Apoiar-se em TDD para que os agentes produzam código sólido, não uma bagunça "vibe-coded".
8. Estudar marketing e custos para chegar ao preço certo.
9. Em pricing, pesquisar as melhores integrações para cobrar clientes e como permissões deveriam funcionar.

Essa é a primeira onda de agentes. Ela pode levar o SaaS a uma boa versão alpha assustadoramente rápido. A segunda onda vem quando você aprende as lacunas e o que mais precisa:

- Autenticação
- Segurança
- UX/UI
- Funcionalidades
- Limitações

Esse é um loop em que você estará. Você não vai mais tocar no código — mas vai revisar cada linha dele. Eu construí ferramentas exatamente para isso, e vou mostrar na última seção.

## Desenhe skills para fazer mais

Skills são onde o agente deixa de ser generalista e vira *o seu* especialista. Seja criativo — imagine o engenheiro exato que você gostaria de clonar, e então escreva isso. Aqui estão os que eu uso todos os dias, mas o ganho real está em criar os seus próprios:

- [**rails-engineer**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/rails-engineer) — focado em Rails, do jeito que eu gostaria que fosse escrito.
- [**rails-testing-engineer**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/rails-testing-engineer) — especialista em Minitest que escreve specs reais, não teatro de cobertura.
- [**javascript-engineer**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/javascript-engineer) — trabalho JavaScript idiomático e limpo.
- [**react-engineer**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/react-engineer) — componentes React e estrutura frontend.
- [**frontend-animator**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/frontend-animator) — o divertido, para motion e polimento na UI.
- [**test-expert**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/test-expert) — disciplina de TDD em todos os lugares.
- [**quality-expert**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/quality-expert) — mantém o clean code e os smells fora.
- [**refactor-expert**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/refactor-expert) — reestrutura sem mudar comportamento.
- [**security-expert**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/security-expert) — revisa e fortalece com uma lente de segurança.
- [**code-expert**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/code-expert) — análise profunda de código quando preciso dos detalhes.
- [**pre-launch-expert**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/pre-launch-expert) — a última checagem antes de qualquer coisa ir ao ar.
- [**team-leader**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/team-leader) — o orquestrador, controla e delega para os outros agentes.
- [**task-manager**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/task-manager) — mantém o Plano e as TODO lists consistentes.
- [**autoresearch-candidates**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/autoresearch-candidates) — encontra os melhores lugares no código para investigar.
- [**brainstorming**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/brainstorming) — quando quero pensar em voz alta e explorar opções.

## Use extensões

Construa suas próprias extensões para moldar o agente ao redor do seu trabalho. Pense nisso como modelar argila — não estamos mais hardcodando, estamos moldando o que um agente consegue fazer e pressionando isso exatamente na forma que seu trabalho exige. Você deveria fazer o mesmo.

Primeiro, vá para [pi.dev/packages](https://pi.dev/packages) e comece a olhar o que gosta. Existem mais de 3.900 pacotes por lá, e você pode começar a usar a maioria imediatamente.

Alguns que eu mesmo construí e rodo todos os dias:

- [**pi-agentic-search**](https://github.com/dantetekanem/pi-agentic-search) — faz o agente buscar com intenção, não apenas vagar por aí.
- [**pi-render-images-tmux**](https://github.com/dantetekanem/pi-render-images-tmux) — renderiza imagens direto no tmux (sim, aquele avatar ali em cima).
- [**pi-feedback**](https://github.com/dantetekanem/pi-feedback) — um feedback loop mais apertado com o agente.
- [**friday**](https://github.com/dantetekanem/friday) — um companheiro de comunicação que melhora a forma como o agente fala de volta.
- [**pi-code-diff**](https://github.com/leop-shopify/pi-code-diff) — diffs mais limpos para revisar exatamente o que o agente mudou.
- [**pi-persona**](https://github.com/leop-shopify/pi-persona) — dá ao agente uma persona customizada.
- [**ada**](https://github.com/leop-shopify/ada) — um agente orientado por artefatos.
- [**pi-thinking-messaging**](https://github.com/dantetekanem/pi-thinking-messaging) — adiciona tempo decorrido e contagem de tokens ao loader de working/thinking do Pi.

E extensões de terceiros que mantenho ligadas:

- [**pi-autoresearch**](https://github.com/davebcn87/pi-autoresearch) — o autoresearch que continuo mencionando. Esse é ouro.
- [**pi-hermes-memory**](https://www.npmjs.com/package/pi-hermes-memory) — memória persistente consciente de tokens. Esse é o sistema de memória que mencionei antes.
- [**pi-ghostty**](https://www.npmjs.com/package/pi-ghostty) — integração com Ghostty para o setup acima.
- [**pi-ask-user**](https://www.npmjs.com/package/pi-ask-user) — prompts interativos de seleção quando o agente precisa de uma decisão minha.
- [**pi-code-previews**](https://www.npmjs.com/package/pi-code-previews) — previews inline do código sendo alterado.
- [**@ifi/oh-pi-themes**](https://www.npmjs.com/package/@ifi/oh-pi-themes) — temas, porque a beleza importa.
- [**napkin-ai**](https://www.npmjs.com/package/napkin-ai) — visuais e diagramas rápidos a partir de um prompt.
- [**pi-emote**](https://www.npmjs.com/package/pi-emote) — um pouco de personalidade no loop.

Se uma extensão existente não faz tudo que você quer, você pode e deve cloná-la e modificá-la para encaixar no seu trabalho. Pi é extremamente bom nisso.

## Vamos realmente rodar uma. Hands-on com Pi.

Chega de teoria. Abra um projeto pequeno que você entende. Ainda não o monolito mais assustador. O objetivo é sentir o loop, não provar que você é corajoso.

Comece read-only:

```text
You are helping me understand this project.
Do not edit files.
Read the README, package files, and source layout.
Give me:
1. what this app does
2. the most important files
3. the first risks you see
4. one small improvement candidate
```

Esse prompt é chato de propósito. Você está ensinando a si mesmo como o agente lê, como reporta incerteza e se ele consegue separar evidência de chute.

Agora faça ele planejar:

```text
I want one small improvement that can be done safely in under 30 minutes.
Find 3 candidates.
For each one, explain the user impact, files likely involved, risks, and how you would verify it.
Do not edit yet.
```

Escolha uma opção, então force o agente a trabalhar como engenheiro:

```text
Implement option 2.
Before editing, write a short plan with the files you expect to touch.
Keep the diff small.
Add or update tests if this project has a test suite.
Stop and ask if you need a product decision.
```

Depois que ele disser que terminou, não comemore ainda. Revise:

```text
Show me the diff as a reviewer.
Explain why each file changed.
List the highest-risk assumption in this implementation.
Tell me exactly what test or command proves this works.
```

Então rode a verificação. Se falhar, ótimo. Isso não é vergonha; é o loop funcionando. Faça o agente depurar a falha com evidência, não vibes.

Este é o formato:

1. Peça para ele entender.
2. Peça para ele planejar.
3. Deixe ele fazer a menor mudança útil.
4. Revise o diff.
5. Verifique o comportamento.
6. Alimente o resultado de volta no próximo loop.

Quando isso ficar entediante, escale. Adicione skills. Adicione extensões. Adicione memória. Adicione times. Dê ferramentas melhores aos agentes. Mas mantenha o julgamento com você.

## Não aceite tudo. Revise tudo

Leia meu post [Code Reviews Matter a Freaking Lot](https://blog.leonardopereira.com/2026/04/18/code-reviews-matter-a-freaking-lot/). Estou falando sério. Se você tirar uma coisa deste post, tire esta: AI torna code review mais importante, não menos.

Esta é a parte que eu não quero borrar: você ainda é responsável.

Mesmo que você tenha digitado zero linhas, você aprovou o formato da mudança. Se quebrar depois, a pergunta útil não é "qual modelo escreveu isso?" É "o que deixamos passar na review?" Essa mentalidade importa.

Antes de AI, uma review protegia você do ponto cego de outra pessoa. Agora ela também protege você de um output que pode parecer completo antes de ser realmente entendido. O código perigoso nem sempre é feio. Às vezes ele tem testes verdes, nomes limpos e uma idempotency key faltando que ninguém percebeu.

É por isso que eu me importo tanto com o loop de review. [pi-code-diff](https://github.com/leop-shopify/pi-code-diff) me mostra exatamente o que o agente tocou. [pi-feedback](https://github.com/dantetekanem/pi-feedback) me permite devolver correção sem transformar a sessão inteira em ruído. [friday](https://github.com/dantetekanem/friday) mantém a conversa apertada. Eu não preciso de mais narração do agente. Eu preciso de um diff claro, um caminho preciso de correção e um loop que me deixe entrar quando julgamento importa.

Para mim, Pi não é permissão para se importar menos. É uma forma de mover o cuidado para um lugar melhor. Menos caçar arquivos. Mais perguntar se isso pertence ao sistema. Menos "por favor escreva este método." Mais "prove que este é o design certo, com dados, docs, testes e o menor diff seguro."

E sim, alguns dias são bagunçados. Agentes travam. Eles inventam coisas com confiança. O contexto deriva. Ferramentas quebram. Custos de API podem surpreender. Quando isso acontecer, desacelere. Leia o código. Pense. O loop deve servir ao seu julgamento, não substituí-lo.

Esse é o ponto inteiro deste post, de verdade. Seja mais rápido, sim. Entregue mais, sim. Mas fique perto das decisões que importam. Construa o harness. Rode o loop. Exija evidência. Revise o resultado. Seja dono.

É assim que eu trabalho agora. Se algo disso ressoou, ou se você acha que estou completamente errado, me encontre em [me@leonardopereira.com](mailto:me@leonardopereira.com). Agora vá ser melhor — muito melhor.
