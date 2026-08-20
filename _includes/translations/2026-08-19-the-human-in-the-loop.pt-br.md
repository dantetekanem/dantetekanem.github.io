Ferramentas agênticas estão por toda parte. Em várias empresas, um único engenheiro agora consegue spawnar mais de 100 agentes em um dia normal. Pesquisa, código, automação, tarefas agendadas, reviews e muito mais.

Agentes conseguem fazer muita coisa, mas ainda não conseguem fazer tudo. Definitivamente não.

Quantos agentes você roda depende da tarefa. Uma investigação? Um modelo de fronteira provavelmente consegue lidar com ela sozinho se tiver o contexto de que precisa. A tarefa exige mais informações? Ele pode spawnar agentes para coletá-las em fontes diferentes. Uma implementação complexa pode usar vários agentes escritores atualizando partes independentes ao mesmo tempo. Uma orquestração maior pode ter um agente de fronteira delegando todo um grafo de trabalho.

O escopo pode crescer rápido. Manter o contexto sob controle é sempre importante.

Esse é o loop interno do agente, que vou explorar em outro post. Este aqui é sobre a parte que não podemos delegar: o humano no loop.

## O Loop

Quando você usa agentes de código avançados com as checagens de permissão ignoradas, como [Pi](https://pi.dev/), [Claude Code](https://code.claude.com/docs/en/overview) ou [Codex](https://developers.openai.com/codex/), o fluxo muitas vezes parece simples: você fornece um prompt e espera o resultado.

Às vezes, é realmente assim tão simples. Então vamos imaginar uma tarefa empresarial real.

Você tem um monolito cujo produto principal é encurtar URLs. Ele existe há décadas e lida com tráfego sério. Um engenheiro recebe uma tarefa aparentemente pequena: rastrear um sinal adicional de telemetria para requests repetidas do mesmo endereço. Esse é o primeiro passo para introduzir orçamentos rígidos de requests e responder corretamente com [`429 Too Many Requests`](https://www.rfc-editor.org/rfc/rfc6585.html#section-4).

Simples, certo?

A issue está bem escrita. Explica o problema, propõe uma solução e inclui critérios de aceitação. O sistema de telemetria já existe. Você aponta um agente de nível intermediário para o ticket e pede que implemente a mudança. Dez minutos depois, ele terminou. Testes escritos. Qualidade esperada entregue. Tudo verde, segundo o agente.

Seu ambiente local demora um pouco para rodar (afinal, é um monolito), e a infraestrutura do seu repositório de código poderia aguentar um pouco mais de pressão - não vou citar nomes e envergonhar ninguém - então você confia no resumo e envia a branch para review.

A CI começa. Vinte minutos depois, você recebe a notificação: tudo passou. Agora é hora da code review. Você não quer jogar porcaria de AI por cima do muro para os seus colegas, então primeiro inspeciona o trabalho.

E aí você encontra o problema.

O agente adicionou comentários inúteis que só repetem a issue. Pior: reimplementou o mecanismo de telemetria, mesmo que a base de código já tenha uma biblioteca exatamente para esse trabalho.

Terrível. Terrível.

Você volta ao agente de código, fornece seu feedback e espera mais uma rodada:

![O loop de review do coding agent](/assets/images/human-loop.png){: style="width: 50%;" }

Revisar código é a parte pesada desse loop, e é necessário. Agentes são muito bons em escrever código, mas mesmo um bom prompt não consegue eliminar julgamento. O resultado ainda depende de qual contexto o agente capturou, de qual caminho escolheu e do que ele otimizou.

Um agente pode pegar o caminho mais curto até um teste verde em vez do melhor caminho para a base de código. Pode resolver o ticket literalmente enquanto deixa passar a arquitetura ao redor. Pode duplicar uma abstração, otimizar o próprio loop ou produzir com confiança algo que parece correto até alguém que conhece o sistema de fato ler.

Modelos também conseguem revisar o trabalho. Eles deveriam. Spawne um modelo diferente, use um prompt diferente e deixe que ele procure o que o escritor deixou passar. Fazemos isso no trabalho o tempo todo, e esses revisores frequentemente encontram problemas reais.

Mas o humano continua ali.

Hoje, eu não confio em uma cadeia completamente autônoma para garantir código pronto para merge sem review humana. Ainda não. O humano traz contexto histórico, julgamento de produto, bom gosto e - o mais importante - responsabilidade pelo que vai para produção.

O problema não é ter um humano no loop. O problema é o quanto esse loop pode parecer caro e desconectado.

Foi por isso que criei o [pi-coder](https://github.com/dantetekanem/pi-coder).

## Acelerando o Loop

Você provavelmente é engenheiro de software. Este post, e a maior parte deste blog, tem um público muito específico: programadores.

E eu sou meu cliente favorito. Gosto de construir ferramentas que me deixam melhor, especialmente ferramentas que reduzem a fricção de me manter no loop.

**pi-coder** oferece dois comandos: `/diff` e `/code`. Vamos começar pelo maior caso de uso: revisar um diff.

Rode `/diff` e você verá isto:

![Exemplo de /diff do pi-coder](https://github.com/dantetekanem/pi-coder/raw/main/docs/assets/code.gif)

Em poucos segundos, todas as mudanças estão bem na sua frente. Você consegue ver o que aconteceu, navegar pelos arquivos e focar no que precisa da sua atenção.

Aperte `v` para alternar entre as visualizações lado a lado e linha por linha. Use as setas para se mover entre arquivos e pelo diff. Simples. Então leia o que o agente realmente fez - não o que ele afirmou ter feito dez minutos atrás.

Essa distinção importa.

`pi-coder` tem cinco painéis, alternados diretamente pelo teclado:

1. `1` - arquivos
2. `2` - código
3. `3` - comentários
4. `4` - contexto do pull request (apenas reviews remotas)
5. `5` - respostas do pull request (apenas reviews remotas)

Renderizar um diff não é a parte interessante. A parte interessante é o que acontece quando a review e a conversa com o agente vivem no mesmo fluxo.

### Discutir

Viu uma linha que você não entende? Aperte `d`, digite sua pergunta e pergunte ao agente por que aquela mudança existe:

![Discutindo uma linha no pi-coder](/assets/images/pi-coder-print-1.png){: style="width: 70%;" }

Uma discussão não é um pedido para modificar o código. Ela pede que o agente explique a mudança em prosa, mantendo o arquivo intacto. Você continua em modo de review em vez de transformar cada pergunta em uma edição.

### Comentar

Agora suponha que você quer mesmo uma mudança. Aperte `c` e descreva a correção:

![Comentando em uma linha no pi-coder](/assets/images/pi-coder-print-2.png){: style="width: 70%;" }

Um comentário é feedback de review acionável. Ele diz ao agente que algo precisa mudar e mantém essa instrução anexada ao arquivo e à linha relevantes.

### O Prompt

Discussões e comentários se acumulam durante a review. Quando estiver pronto, aperte `s` para enviá-los e abrir a entrada de prompt. O `pi-coder` transforma tudo que você reuniu em um prompt estruturado que pode mandar de volta ao agente:

![O prompt estruturado gerado pelo pi-coder](/assets/images/pi-coder-print-3.png){: style="width: 70%;" }

Nada de copiar manualmente nomes de arquivos, números de linha, perguntas e correções para outro prompt. O agente também tem ferramentas como `open_code` e `open_code_diff`, para poder levar você de volta ao código ou à review exatos quando necessário.

Isso não remove a review. Remove a cerimônia em volta dela.

Para mim, isso faz o loop parecer 100 vezes mais rápido.

## Revisando Código no Mundo Real

O `pi-coder` também suporta reviews remotas. A API é deliberadamente simples:

```text
/diff remote <url>
```

O fluxo continua praticamente o mesmo, com alguns acréscimos:

- Comentários podem ser enviados ao GitHub e a outros provedores configurados. O GitHub é o padrão e exige a [GitHub CLI (`gh`)](https://cli.github.com/manual/gh) localmente.
- Você pode manter o agente no loop quando precisar de contexto ou de uma segunda opinião.
- Você pode aprovar o pull request ou solicitar mudanças a partir da review.

![Revisando um pull request remoto no pi-coder](/assets/images/pi-coder-print-4.png){: style="width: 85%;" }

As mudanças no fluxo são pequenas. O impacto não.

Você já revisa código escrito por outras pessoas. O que acontece quando encontra uma mudança que não entende? Em vez de sair da review, copiar um trecho, reconstruir o contexto em outro chat e eventualmente encontrar o caminho de volta, pergunte ao seu agente local a partir da própria review.

Esse agente já tem suas skills, extensões, harness customizado e contexto do projeto. A pergunta continua bem delimitada. A resposta chega onde você precisa dela. Você continua no controle.

## Editor de Código Mínimo Viável (MVCE)

Outra pequena necessidade que eu continuava encontrando no trabalho do dia a dia era conseguir ver toda a base de código e navegar por ela.

Não domino todos os atalhos do [Neovim](https://neovim.io/), então abrir um painel do [tmux](https://github.com/tmux/tmux/wiki) com `nvim <folder>/` não estava funcionando muito bem para mim. Anos de [Visual Studio Code](https://code.visualstudio.com/) fizeram minha memória muscular funcionar de outro jeito. Mas o VS Code também não serve para isso. Ele é pesado demais.

Preciso de algo rápido e leve, com uma navegação que pareça familiar. E preciso que o agente abra o código exato que quer que eu veja.

Então o `pi-coder` também inclui `/code`:

![Navegando pelo código com pi-coder](https://github.com/dantetekanem/pi-coder/raw/main/docs/assets/diff.gif)

Digite `/code` e está lá. A partir daí, você pode navegar pelo código, apertar `d` para discutir um arquivo, fazer perguntas e mudanças sem quebrar o loop. O agente também pode abrir tudo para você, levando você diretamente ao código que quer mostrar.

`/code` não está tentando substituir um editor completo. Foi projetado para cobrir uma necessidade bem pequena - provavelmente 1% do que um editor faz - mas cobre o 1% certo para esse fluxo.

## Transformando o Loop em Fluxo

![O loop humano se tornando um resultado aprovado](/assets/images/human-loop-approved.png){: style="width: 60%;" }

As pessoas frequentemente descrevem o humano no loop como um gargalo. Acho que esse é o enquadramento errado.

O humano não está ali para digitar uma versão mais lenta do que o agente consegue produzir. O humano está ali para exercer julgamento: entender o sistema, questionar o que não faz sentido, rejeitar a resposta conveniente e errada, e decidir o que está bom o suficiente para ir para produção.

O `pi-coder` não remove esse loop. Ele o comprime até que revisar, questionar, corrigir e continuar virem um único fluxo.

A engenharia de software não morreu. Ela está mudando. Não estamos sendo removidos; estamos nos adaptando. Agentes conseguem gerar mais código, em mais tarefas, mais rápido do que nunca. Isso torna o julgamento de engenharia mais valioso, não menos.

O agente pode escrever o código. O engenheiro **ainda é dono** do que vai para produção.

## É Isso por Enquanto

Pull requests, comentários e feedback são mais que bem-vindos no [`pi-coder`](https://github.com/dantetekanem/pi-coder). Me diga o que você acha desse fluxo e o que faz diferente no seu próprio workflow.

Como falei antes, vou compartilhar mais sobre como uso o Pi no dia a dia e como esses loops de agentes funcionam nos bastidores. Você pode falar comigo em [me@leonardopereira.com](mailto:me@leonardopereira.com).

Bom código!