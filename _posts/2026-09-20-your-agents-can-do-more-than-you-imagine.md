---
layout: post
title: "Your agents can do more than you imagine"
date: 2026-09-20 12:40:00 -0400
description: I complained to my AI agent about my messy Steam Deck library. It connected over Wi-Fi, started organizing my ROMs, and created a skill so I could do it again.
categories: [ai, gaming]
tags: [pi, ai agents, steam deck, emulation, automation, skills]
i18n:
  pt_br:
    title: "Seus agentes podem fazer mais do que você imagina"
    date: 20 de setembro de 2026
    content_include: translations/2026-09-20-your-agents-can-do-more-than-you-imagine.pt-br.md
    labels:
      categories: "Categorias:"
      tags: "Tags:"
    categories:
      - IA
      - jogos
    tags:
      - Pi
      - agentes de IA
      - Steam Deck
      - emulação
      - automação
      - skills
---

This will be a short post. I have a Steam Deck, and I hadn't used it in a long time. A few problems there:

- I mainly use it for emulation, and I had so many duplicate games that finding something to play on SNES was almost impossible.
- Adding games (classic emulation again) was a challenge. I had to remove my SD card, download the game onto it, organize the files, put the card back into the Steam Deck, switch to desktop mode, use that terrible touch-i-am-a-mouse interface, extract the files into the right folders, and restart EmuDeck so I could finally play something.

I just want to play the games from my childhood! So I opened Pi with my Astra model and complained (literally complained). The agent told me it could connect to my Steam Deck over Wi-Fi and do what I wanted. I just needed to set up a few things (SSH stuff I won't share here).

I did all that, but `hostname -I` failed. I explained what happened, the agent gave me a corrected command, and it was in. Now it's organizing my whole library, and adding games is simple if I have the ROM locally (make sure you have a legal copy before doing this; I'm not giving legal advice here).

It also created a skill, at my request, to manage the ROMs and remember how to navigate the setup next time. Now, whenever I want to play something new, I'm only a few prompts away. One small caveat: my Steam Deck can't be asleep. But it can be in gaming mode, so this works even while I'm already playing something.

That's the tip of the day. :) Use your agents to unblock your life.
