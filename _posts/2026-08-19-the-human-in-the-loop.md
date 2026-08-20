---
layout: post
title: The Human in the Loop
date: 2026-08-19 19:37 -0400
description: When you can run more than 100 different agents in a day, getting code written is no longer the hard part. Someone still has to read the diff, catch what does not belong, and decide what should ship.
categories: [ai, agentic development, engineering culture]
tags: [pi, pi-coder, code review, ai agents, agentic coding, developer productivity, human in the loop]
i18n:
  pt_br:
    title: 'O Humano no Loop'
    date: 19 de agosto de 2026
    content_include: translations/2026-08-19-the-human-in-the-loop.pt-br.md
    labels:
      categories: "Categorias:"
      tags: "Tags:"
    categories:
      - AI
      - desenvolvimento agêntico
      - cultura de engenharia
    tags:
      - Pi
      - pi-coder
      - code review
      - agentes de AI
      - programação agêntica
      - produtividade de desenvolvedores
      - humano no loop
---

![Leo in the Loop](/assets/images/human-in-the-loop.png)

Agentic tooling is everywhere. Across several companies, one engineer can now spawn more than 100 agents in a normal day. Research, coding, automation, scheduled tasks, reviews, and more.

Agents can do a lot, but they cannot do everything (yet). Definitely not everything.

How many agents you run depends on the task. One investigation? A frontier model can probably handle it alone if it has the context it needs. Does the task require more information? It can spawn agents to collect it from different sources. A complex implementation might use several writer agents updating independent parts at the same time. A larger orchestration can have one frontier agent delegating an entire graph of work.

The scope can grow quickly. Keeping context under control is always important.

That is the agent's internal loop, which I will explore in another post. This one is about the part we cannot delegate away: the human in the loop.

## The Loop

When you use advanced coding agents with permission checks bypassed, such as [Pi](https://pi.dev/), [Claude Code](https://code.claude.com/docs/en/overview), or [Codex](https://developers.openai.com/codex/), the workflow often looks simple: provide one prompt and wait for the result.

Sometimes it really is that simple. So let's imagine a real enterprise task.

You have a monolith whose main product is URL shortening. It has been around for decades and handles serious traffic. An engineer receives an apparently small task: track one additional telemetry signal for repeated requests from the same address. This is the first step toward introducing strict request budgets and returning proper [`429 Too Many Requests`](https://www.rfc-editor.org/rfc/rfc6585.html#section-4) responses.

Simple, right?

The issue is well written. It explains the problem, proposes a solution, and includes acceptance criteria. The telemetry system already exists. You point a mid-tier agent at the ticket and ask it to implement the change. Ten minutes later, it is done. Tests written. Expected quality delivered. All green, according to the agent.

Your local environment takes a while to run (it is a monolith, after all), and your code repository infrastructure could use a little more pressure - I will not name and shame - so you trust the summary and push the branch for review.

CI starts. Twenty minutes later, you get the notification: everything passed. Now it is time for code review. You do not want to throw AI slop over the wall at your teammates, so you inspect the work first.

Then you find it.

The agent added useless comments that simply repeat the issue. Worse, it reimplemented the telemetry machinery even though the codebase already has a library for exactly that job.

Terrible. Terrible.

You go back to the coding agent, provide your feedback, and wait for another round:

![The coding-agent review loop](/assets/images/human-loop.png){: style="width: 50%;" }

Reviewing code is the heavy part of this loop, and it is necessary. Agents are very good at writing code, but even a good prompt cannot eliminate judgment. The result still depends on what context the agent captured, which path it chose, and what it optimized for.

An agent can take the shortest route to a green test instead of the best route for the codebase. It can solve the ticket literally while missing the architecture around it. It can duplicate an abstraction, optimize its own loop, or confidently produce something that looks correct until somebody who knows the system actually reads it.

Models can review the work too. They should. Spawn a different model, use a different prompt, and let it search for what the writer missed. We do this at work all the time, and those reviewers often find real problems.

But the human is still there.

Today, I do not trust a fully autonomous chain to guarantee merge-ready code with no human review. Not yet. The human brings historical context, product judgment, taste, and - most importantly - responsibility for what ships.

The problem is not having a human in the loop. The problem is how expensive and disconnected that loop can feel.

That is why I created [pi-coder](https://github.com/dantetekanem/pi-coder).

## Speeding Up the Loop

You are probably a software engineer. This post, and most of this blog, has a very specific audience: programmers.

And I am my favorite customer. I like building tools that make me better, especially tools that reduce the friction of keeping myself in the loop.

**pi-coder** provides two commands: `/diff` and `/code`. Let's start with the biggest use case: reviewing a diff.

Run `/diff`, and you will see this:

![pi-coder /diff example](https://github.com/dantetekanem/pi-coder/raw/main/docs/assets/code.gif)

In a few seconds, all the changes are right in front of you. You can see what happened, navigate the files, and focus on what needs your attention.

Press `v` to switch between side-by-side and line-by-line views. Use the arrow keys to move between files and around the diff. Simple. Then read what the agent actually did - not what it claimed it did ten minutes ago.

That distinction matters.

`pi-coder` has five panes, toggled directly from the keyboard:

1. `1` - files
2. `2` - code
3. `3` - comments
4. `4` - pull request context (remote reviews only)
5. `5` - pull request replies (remote reviews only)

Rendering a diff is not the interesting part. The interesting part is what happens when the review and the conversation with the agent live in the same workflow.

### Discuss

See a line you do not understand? Press `d`, type your question, and ask the agent why that change exists:

![Discussing a line in pi-coder](/assets/images/pi-coder-print-1.png){: style="width: 70%;" }

A discussion is not a request to modify the code. It asks the agent to explain the change in prose while keeping the file untouched. You stay in review mode instead of turning every question into an edit.

### Comment

Now suppose you do want a change. Press `c` and describe the correction:

![Commenting on a line in pi-coder](/assets/images/pi-coder-print-2.png){: style="width: 70%;" }

A comment is actionable review feedback. It tells the agent that something should change and keeps that instruction attached to the relevant file and line.

### The Prompt

Discussions and comments accumulate throughout the review. When you are ready, press `s` to submit them and open the prompt input. `pi-coder` turns everything you collected into a structured prompt that you can send back to the agent:

![The structured prompt generated by pi-coder](/assets/images/pi-coder-print-3.png){: style="width: 70%;" }

No manually copying filenames, line numbers, questions, and corrections into another prompt. The agent also has tools such as `open_code` and `open_code_diff`, so it can bring you back to the exact code or review when needed.

This does not remove the review. It removes the ceremony around it.

For me, that makes the loop feel 100 times faster.

## Reviewing Code in the Wild

`pi-coder` also supports remote reviews. The API is deliberately simple:

```text
/diff remote <url>
```

The workflow stays mostly the same, with a few additions:

- Comments can be posted to GitHub and other configured providers. GitHub is the default and requires the [GitHub CLI (`gh`)](https://cli.github.com/manual/gh) locally.
- You can keep the agent in the loop when you need context or a second opinion.
- You can approve the pull request or request changes from the review.

![Reviewing a remote pull request in pi-coder](/assets/images/pi-coder-print-4.png){: style="width: 85%;" }

The changes to the workflow are small. The impact is not.

You already review code written by other people. What happens when you find a change you do not understand? Instead of leaving the review, copying a snippet, rebuilding the context in a separate chat, and eventually finding your way back, ask your local agent from the review itself.

That agent already has your skills, extensions, customized harness, and project context. The question stays scoped. The answer comes back where you need it. You stay in control.

## Minimum Viable Code Editor (MVCE)

Another small need I kept finding in my day-to-day work was being able to see the whole codebase and navigate through it.

I am not well versed in every [Neovim](https://neovim.io/) shortcut, so opening a [tmux](https://github.com/tmux/tmux/wiki) pane with `nvim <folder>/` was not really working for me. Years of [Visual Studio Code](https://code.visualstudio.com/) made my muscle memory work in a different way. But VS Code is not acceptable for this either. It is just too heavy.

I need something fast and light, with navigation that feels familiar. And I need the agent to open the exact code it wants me to see.

So `pi-coder` also includes `/code`:

![Navigating code with pi-coder](https://github.com/dantetekanem/pi-coder/raw/main/docs/assets/diff.gif)

Type `/code` and you will have it. From there, you can navigate the code, press `d` to discuss a file, ask questions, and make changes without breaking the loop. The agent can open it for you too, taking you directly to the code it wants to show you.

`/code` is not trying to replace a full editor. It was designed to cover a very small need - probably 1% of what an editor does - but it covers the right 1% for this workflow.

## Turning the Loop Into Flow

![The human loop becoming an approved result](/assets/images/human-loop-approved.png){: style="width: 60%;" }

People often describe the human in the loop as a bottleneck. I think that is the wrong framing.

The human is not there to type a slower version of what the agent can produce. The human is there to provide judgment: to understand the system, question what does not make sense, reject the convenient wrong answer, and decide what is good enough to ship.

`pi-coder` does not remove that loop. It compresses it until reviewing, questioning, correcting, and continuing become one flow.

Software engineering is not dead. It is changing. We are not being removed; we are adapting. Agents can generate more code, across more tasks, faster than ever. That makes engineering judgment more valuable, not less.

The agent can write the code. The engineer **still owns** what ships.

## That's All for Now

Pull requests, comments, and feedback are more than welcome on [`pi-coder`](https://github.com/dantetekanem/pi-coder). Let me know what you think about this flow and what you do differently in your own workflow.

As I said earlier, I will share more about how I use Pi day to day and how these agent loops work behind the scenes. You can reach me at [me@leonardopereira.com](mailto:me@leonardopereira.com).

Happy coding!