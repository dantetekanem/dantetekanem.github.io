---
layout: post
title: 'Be better (much better): Agentic Tools and Pi'
date: 2026-06-14 13:04 -0400
description: I stopped typing code and started running loops of agents. This is the practical guide to the tools, setup, orchestration, review habits, and responsibility that made it work.
categories: [ai, agentic development, engineering culture]
tags: [pi, claude code, codex, ai agents, agentic coding, llm, developer productivity, prompt engineering, extensions, shopify]
i18n:
  pt_br:
    title: 'Seja melhor (muito melhor): Agentic Tools e Pi'
    date: 14 de junho de 2026
    content_include: translations/2026-06-14-be-better-much-better-agentic-tools-and-pi.pt-br.md
    labels:
      categories: "Categorias:"
      tags: "Tags:"
    categories:
      - AI
      - agentic development
      - cultura de engenharia
    tags:
      - Pi
      - Claude Code
      - Codex
      - AI agents
      - agentic coding
      - LLM
      - developer productivity
      - prompt engineering
      - extensions
      - Shopify
---

![Leo Pi](/assets/images/leo-pi.png)

I have not written a single line of code this year. Not one. And I have shipped more than in any other year of my career — hundreds of thousands of lines changed. If that sounds reckless, good. Stay with me, because it is the opposite.

Technology has these moments where the floor moves under you. It happens in many areas, but in tech it is brutal because the old world disappears almost overnight.

The iPhone is the obvious example. Before it, phones were "good enough." Then they became something else entirely. It changed everything. Now people can barely remember pressing the same number three times just to type a letter in an SMS.

AI is doing the same thing to us developers. Some of us know this. Not everyone sees it yet. I am very lucky to be at Shopify, where Tobi decided AI was a baseline expectation for all of us. They gave us the tools, and our culture shifted. We all wanted to go deeper into this ocean — and we did.

I still remember the first time AI autocomplete in VS Code felt real. It was magical watching it guess the next lines and accept them with Tab. Typing time dropped by at least half. That alone felt huge.

Years later, around 2020, GPT-3 came to life. Everyone was using it — not in code, not yet. But it did not take long. In the beginning of 2023, Cursor came into the game. Another change, a huge change. Now we were not just autocompleting anymore — we were planning, asking for full changes, and accepting diffs in files we had not even opened. The indexing engine, adding local semantic search for the agents, was game-changing. It reached into places we did not know about. Shopify was thriving there at that moment, with thousands of engineers testing the tooling before everyone else.

And then 2025 came, and with it Claude Code. In my personal opinion, it was one of the most important pieces of technology a software engineer could touch. It came with several annoying bumps, like asking permission for everything. But the base was there: agents that did not show you every change, removing the engineer from the code and moving them back to creativity. A new IDE was built — one that did not require you to type code, but to think about the loop, the agent, the problem, and what you wanted to get done.

YOLO (dangerously skip permissions) mode removed the last constraint we had: babysitting the agent through every file read and command. Agents are powerful. More often than not, we are the thing standing in their way. We started becoming prompt engineers.

It took several months for Claude Code to mature, and for all of us to discover what it was truly capable of. The tool was growing while, in parallel, the models were getting massively better.

And in November 2025, a new coding agent arrived: Pi ([pi.dev](https://pi.dev)). It fixed the things Claude Code kept tripping over, and it won me over for three reasons:

- **Open source and minimal by design.** Nothing hidden, nothing bloated. You see exactly what the agent is doing.
- **Any model you want.** Run it on whatever you can reach through an API, and switch mid-session when another one is sharper for the job.
- **It extends itself.** No more begging for a feature or bolting on a custom MCP. If Pi cannot do something, you build an extension — usually with Pi itself — and so does everyone else.

Here's the honest version: if I could shape Claude Code into exactly what I wanted, I would happily stay. I can't. Pi let me. For me, it began as a small spark at Shopify, and the whole team fell for it — shared problems getting shared fixes, out in the open, every day.

One of the most amazing tools Claude Code has is [agent teams](https://code.claude.com/docs/en/agent-teams). It's experimental, so only a few people know about it. Pi does not ship with this by default either, but that is exactly the kind of thing Pi is good at: install an extension, open another tmux pane, run another agent, and wire the agents together around tasks and messages.

That is when we started splitting work across dedicated agents, and we moved to the next wave: the **loop engineers**. That is the whole shift — you stop typing code and start running a loop. You frame the problem, the agents propose, you judge, you approve, you correct, you go again. A single prompt was never enough. The typing part of coding? Solved. The real job climbed up a level, into framing, reviewing, and steering that loop.

And that is what I do every single day. I learn and build with models, getting shit done, relearning everything I already know from a completely new angle. Squeezing out every bit of leverage I can.

A few things I have done at Shopify in the last 6 months:

- Cleared an outdated board with 37 tasks — reviewed them all, wrote 9 PRs, and closed what was stale. Took me 2 hours.
- Got root cause analysis on issues across massive, billion-row telemetry and log data, in minutes.
- Used autoresearch to improve one of our platforms, moving background processing time from 22 hours down to 40 minutes — it traced the bottleneck to how we were batching the work, not to the hardware. (No compute power added 😉)
- Removed 5 stale gems from our MASSIVE Gemfile.

That is my view from my own work. But this also changed how I work with teammates. I have given presentations and run multiple 1:1s helping colleagues learn and use Pi as well. My whole goal was to unblock them, and let them be better.

So back to what I said at the top: not one line of code typed by me this year. That is not a flex. It is simply the new shape of the work.

Now I want to share what you can learn and do too. Pi is not only for Shopify. There is so much being built by so many people that the best part is probably still ahead of us.

## Learn what AI is first

It will help you take the leap to agentic tools if you understand what AI can do. There are plenty of resources online — try to keep pace and keep yourself up to date with everything going on.

And time-block around 2 hours and 15 minutes to watch this:

<div style="position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;">
  <iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" src="https://www.youtube.com/embed/xmkSf5IS-zw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>

<br>
<br>

This is the best video I have seen for handing you all the context you need on everything happening right now. Understand context, the challenges, bandwidth, the science, the training. It's fantastic!

## Don't get attached to a model

Models are launched basically every quarter. Do not get overly attached to any of them. Try new ones — they are good at solving different problems. Opus 4.6 was amazing at coding, before being nerfed (I strongly believe this) for the launch of Opus 4.7 (which was terrible). GPT 5.5 is generally great at many tasks; coding is not as good as Opus 4.6, but it is good. Fable 5 was amazing for creative work. Gemini is generally bad (sorry, it's true). And I do not know anyone using Grok 🤣. Either way, do not get influenced by my comments — do your research, try your tools.

And yes, pay for the models, sign up for the subscriptions. It is always worth it.

Full disclosure before we go hands-on: from here on I will only talk about what I run on my personal computer. When I say GPT 5.5, I mean [Codex](https://chatgpt.com/pricing/) — I drive it from my personal ChatGPT subscription, in high/xhigh thinking mode, depending on the task. I also pay for Claude Pro to run Claude Code. Use whatever model suits you. Just remember: Anthropic subscriptions only work inside Claude Code — with Pi you fall back to their API tiers, which cost a lot more.

## Let's install Pi and get some beauty around it

Here is a list of things I use in my environment:

- [Homebrew](https://brew.sh/)
- [Ghostty](https://ghostty.org/)
- [Pi](https://pi.dev)
- [Tmux](https://github.com/tmux/tmux)

If you're on macOS, install Homebrew first, then the rest is just copy/paste:

```bash
# Homebrew (if you don't have it yet)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Ghostty and tmux
brew install --cask ghostty
brew install tmux

# Pi
curl -fsSL https://pi.dev/install.sh | sh
```

You can copy and install some of my settings. Just paste these locally:

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

And this is how my interface looks like:

![Pi running in Ghostty](/assets/images/pi-ghostty-env.png)

## Your first five minutes inside Pi

Pi drops you into a real tool, not a tutorial. This is one place where [pi.dev](https://pi.dev) still needs more docs, so here is the path I give people the first time they open it.

Open a folder you can safely experiment in and run `pi`. Before you ask it to touch real work, do the boring setup:

1. Run `/login`. Authenticate first, otherwise every serious prompt is going to turn into an auth detour.
2. Run `/settings`. Not because you need to understand everything yet, but because you should see the shape of the tool: providers, permissions, extensions, commands, the knobs you can actually turn.
3. Run `/model` and pick the model you want to start with. Do not treat this as permanent. Treat it like choosing a lens for the next job.
4. Set the thinking level. Use `high` or `xhigh` when the task needs judgment, design, research, or a scary diff. Use lighter thinking when you are doing something mechanical.
5. Learn the shortcut: `Shift+Tab` cycles thinking while you are composing. It sounds tiny. It is not. You will change thinking levels all the time once you get used to matching the model's effort to the work.
6. Run one harmless prompt before you point it at production code:

```text
Read this folder and tell me what kind of project this is.
Do not edit files. Give me a short map of the important files and the first risks you see.
```

That little prompt teaches you the loop. Ask, inspect, correct, ask again. The first win with Pi should not be a giant diff. It should be trust. You want to learn how it reads, how it asks for permission, how it reports uncertainty, how it uses your tools. Once that feels boring, you are ready to give it real work.

## Take bigger challenges and do the hardest work possible

Do not use your agents only for simple things like "make ticket xyz done" or "write a function to persist idempotent requests in logs." No. Ask for the bigger outcome: "rewrite the outputs and logs in this project so every request shares the same idempotency key and is tracked correctly in our third-party tools, Grafana, and Prometheus."

Push the agent to reach higher. It will fail today, and that failure is where you start hardening your setup and growing the harness around it. Hardening and harness — those two words are everywhere right now, and for good reason.

You need to learn how to make plans. I love agents that keep TODO lists — they follow a plan and keep it consistent. Organize skills so they know how to do specialized work, like a Rails Engineer, React Engineer, Test Engineer, Security Specialist, and much more.

Give power and tools to your agents so they can reach further. Web access, data knowledge, how to read logs, how to build dashboards — all of that. Have MCPs or local extensions to find data as they need it. Read-only access to a database for small projects, BigQuery access for big ones. Slack access for history across different channels. Let it know it all.

Install a memory system so the agent can learn as it goes and carry that knowledge into the next session. If something is missing, use Pi itself to build an extension to solve it.

## Multiply your agents, and learn to orchestrate

Like I said, Claude Code had agent teams in experimental for a while. It's a very expensive feature — it lets you spawn new agents running in parallel. So instead of 1 expensive agent, you have 5 or 10. Pi does not have this by default either, but you can easily install a package to do it. I personally use [pi-teams](https://www.npmjs.com/package/pi-teams) for this. You will also need [tmux](https://github.com/tmux/tmux) for it.

When I say **spawn agents**, I mean creating separate agent sessions, usually in separate tmux panes, each with its own context window and one narrow job. One agent reads docs. One traces the code. One writes tests. One reviews the final diff. They report back to a lead agent, or directly to you.

This is not "let ten bots freestyle on my repo." Please don't do that. That is how you get expensive chaos.

Spawning agents only works when you give each one a lane:

1. What exactly should this agent do?
2. What files, docs, logs, or tools should it inspect?
3. Can it edit, or is it read-only?
4. What does done look like?
5. Where should it report the result?

Also, build a skill that puts a leader agent in charge of the work. Its only concern is orchestrating and delegating. For a genuinely hard task, the leader can send narrow research, testing, security, and review work to different agents, then make the final call with all the evidence collected.

The thinking behind this loop is all about the context window. If you watched the video I shared (and you should), you now know more about how important context is for the agent and its thinking process. If a hard task can accumulate almost 1 million tokens in one session, it will be impossible to get it done cleanly. By spawning agents to research online, collect data, prove things out, and analyze the best places in the code, your main agent stays below 100k and you still have everything you need.

Agents are extremely powerful by nature, and you should let that nature run in narrow lanes, not jam everything into one giant conversation. This divide-and-conquer move lets you multiply yourself and crack the hardest challenges with more control, not less.

Let's get concrete. Say you want to build a new SaaS that helps people find jobs. What will you need? Many things. But for this simple exercise, here's what I would do with many agents:

1. An initial prompt explaining my project in detail, centered on the goal of what I want done.
2. Research the framework and project design, thinking at the database level from the start.
3. Find website references, strong design trends, and the best way to present information for my use case — mobile-friendly and easy for the average user.
4. Dig up the best sources to crawl job positions and surface new opportunities.
5. Write the prompts the product itself will use to reuse models for its in-app intelligence.
6. Compare hosting options that stay cheap and still support the stack I need.
7. Lean on TDD so the agents produce solid code, not a "vibe-coded" mess.
8. Study marketing and costs to land on the right pricing.
9. On pricing, research the best integrations to charge customers, and how permissions should work.

This is the first wave of agents. It can get the SaaS into a good alpha version shockingly fast. The second wave comes when you learn the gaps, and what else you need:

- Authentication
- Security
- UX/UI
- Functionalities
- Limitations

This is a loop you'll be in. You will not touch the code anymore — but you will review every line of it. I built tooling for exactly this, and I'll show it to you in the last section.

## Design skills to get more done

Skills are where the agent stops being a generalist and becomes *your* specialist. Be creative — picture the exact engineer you wish you could clone, then write them down. Here are the ones I lean on every day, but the real payoff is building your own:

- [**rails-engineer**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/rails-engineer) — focused Rails work, the way I'd want it written.
- [**rails-testing-engineer**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/rails-testing-engineer) — Minitest specialist that writes real specs, not coverage theater.
- [**javascript-engineer**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/javascript-engineer) — idiomatic, clean JavaScript work.
- [**react-engineer**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/react-engineer) — React components and frontend structure.
- [**frontend-animator**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/frontend-animator) — the fun one, for motion and polish on the UI.
- [**test-expert**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/test-expert) — TDD discipline across the board.
- [**quality-expert**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/quality-expert) — keeps the code clean and the smells out.
- [**refactor-expert**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/refactor-expert) — restructures without changing behavior.
- [**security-expert**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/security-expert) — reviews and hardens with a security lens.
- [**code-expert**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/code-expert) — deep code analysis when I need the details.
- [**pre-launch-expert**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/pre-launch-expert) — the last check before anything ships.
- [**team-leader**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/team-leader) — the orchestrator, controls and delegates to the other agents.
- [**task-manager**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/task-manager) — keeps the Plan and the TODO lists consistent.
- [**autoresearch-candidates**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/autoresearch-candidates) — finds the best places in the code to dig into.
- [**brainstorming**](https://github.com/dantetekanem/leo-personal-pi/tree/main/skills/brainstorming) — when I want to think out loud and explore options.

## Use extensions

Build your own extensions to mold the agent around your work. Think of it like modeling clay — we're not hardcoding anymore, we're shaping what an agent can do and pressing it into the exact form your work needs. You should do the same.

First, head to [pi.dev/packages](https://pi.dev/packages) and start looking at what you like. There are over 3,900 packages there, and you can start using most of them right away.

A few I built myself and run daily:

- [**pi-agentic-search**](https://github.com/dantetekanem/pi-agentic-search) — make the agent search with intent, not just wander around.
- [**pi-render-images-tmux**](https://github.com/dantetekanem/pi-render-images-tmux) — render images right inside tmux (yes, that avatar up there).
- [**pi-feedback**](https://github.com/dantetekanem/pi-feedback) — a tighter feedback loop with the agent.
- [**friday**](https://github.com/dantetekanem/friday) — a communications companion that sharpens how the agent talks back.
- [**pi-code-diff**](https://github.com/leop-shopify/pi-code-diff) — cleaner diffs for reviewing exactly what the agent changed.
- [**pi-persona**](https://github.com/leop-shopify/pi-persona) — give the agent a custom persona.
- [**ada**](https://github.com/leop-shopify/ada) — an artifact-driven agent.
- [**pi-thinking-messaging**](https://github.com/dantetekanem/pi-thinking-messaging) — adds elapsed time and token count to Pi's working/thinking loader.

And third-party ones I keep switched on:

- [**pi-autoresearch**](https://github.com/davebcn87/pi-autoresearch) — the autoresearch I keep bringing up. This one is gold.
- [**pi-hermes-memory**](https://www.npmjs.com/package/pi-hermes-memory) — token-aware persistent memory. This is the memory system I mentioned earlier.
- [**pi-ghostty**](https://www.npmjs.com/package/pi-ghostty) — Ghostty integration for the setup above.
- [**pi-ask-user**](https://www.npmjs.com/package/pi-ask-user) — interactive selection prompts when the agent needs a call from me.
- [**pi-code-previews**](https://www.npmjs.com/package/pi-code-previews) — inline previews of the code being touched.
- [**@ifi/oh-pi-themes**](https://www.npmjs.com/package/@ifi/oh-pi-themes) — themes, because the beauty matters.
- [**napkin-ai**](https://www.npmjs.com/package/napkin-ai) — quick visuals and diagrams from a prompt.
- [**pi-emote**](https://www.npmjs.com/package/pi-emote) — a bit of personality in the loop.

If an existing extension does not do everything you want, you can and should clone it and modify it to fit your work. Pi is extremely good at this.

## Let's actually run one. Hands-on with Pi.

Enough theory. Open a small project you understand. Not the scariest monolith yet. The goal is to feel the loop, not to prove you are brave.

Start read-only:

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

That prompt is boring on purpose. You are teaching yourself how the agent reads, how it reports uncertainty, and whether it can separate evidence from guessing.

Now make it plan:

```text
I want one small improvement that can be done safely in under 30 minutes.
Find 3 candidates.
For each one, explain the user impact, files likely involved, risks, and how you would verify it.
Do not edit yet.
```

Pick one, then force the agent to work like an engineer:

```text
Implement option 2.
Before editing, write a short plan with the files you expect to touch.
Keep the diff small.
Add or update tests if this project has a test suite.
Stop and ask if you need a product decision.
```

After it says it is done, do not celebrate yet. Review it:

```text
Show me the diff as a reviewer.
Explain why each file changed.
List the highest-risk assumption in this implementation.
Tell me exactly what test or command proves this works.
```

Then run the verification. If it fails, great. That is not embarrassment; that is the loop working. Make the agent debug the failure with evidence, not vibes.

This is the shape:

1. Ask it to understand.
2. Ask it to plan.
3. Let it make the smallest useful change.
4. Review the diff.
5. Verify the behavior.
6. Feed the result back into the next loop.

Once this feels boring, scale it. Add skills. Add extensions. Add memory. Add teams. Give the agents better tools. But keep the judgment with you.

## Do not accept everything. Review it all

Read my blog post on [Code Reviews Matter a Freaking Lot](https://blog.leonardopereira.com/2026/04/18/code-reviews-matter-a-freaking-lot/). I mean it. If you take one thing from this post, take that: AI makes code review more important, not less.

This is the part I do not want to blur: you are still responsible.

Even if you typed zero lines, you approved the shape of the change. If it breaks later, the useful question is not "which model wrote it?" It is "what did we miss in review?" That mindset matters.

Before AI, a review protected you from another person's blind spot. Now it also protects you from output that can look complete before it is truly understood. The dangerous code is not always ugly. Sometimes it has green tests, clean names, and one missing idempotency key nobody noticed.

That is why I care so much about the review loop. [pi-code-diff](https://github.com/leop-shopify/pi-code-diff) shows me exactly what the agent touched. [pi-feedback](https://github.com/dantetekanem/pi-feedback) lets me hand correction back without turning the whole session into noise. [friday](https://github.com/dantetekanem/friday) keeps the conversation tight. I do not need more narration from the agent. I need a clear diff, a precise correction path, and a loop that lets me step in when judgment matters.

For me, Pi is not permission to care less. It is a way to move the care to a better place. Less hunting for files. More asking whether this belongs in the system. Less "please write this method." More "prove this is the right design, with data, docs, tests, and the smallest safe diff."

And yes, some days are messy. Agents get stuck. They invent things with confidence. Context drifts. Tools break. API costs can surprise you. When that happens, slow down. Read the code. Think. The loop is supposed to serve your judgment, not replace it.

That is the whole point of this post, really. Be faster, yes. Ship more, yes. But stay close to the decisions that matter. Build the harness. Run the loop. Demand evidence. Review the result. Own it.

That is how I work now. If any of this resonates, or if you think I am dead wrong, find me at [me@leonardopereira.com](mailto:me@leonardopereira.com). Now go be better — much better.
