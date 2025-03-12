---
layout: post
title: AI, Cursor and speeding up development
date: 2025-03-12 17:38 -0400
categories: [programming, ai, software development]
tags: [ai, cursor, 10x engineer]
---

I was able to make this blog from zero to production in 1 hour. Including:
- Blog engine with Jekyll (Markdown &#10084;&#65039;)
- Hosting on Github for availability
- CSS inspired by my personal website
- Support to code highlight
- Mapping and SEO revision
- 3 Posts (including this one)
- DNS forwarding from blog.leonardopereira.com to dantetekanem.github.io

How? `Ruby` and `Cursor` are the answer. The first one needs no introduction, [Jekyll](https://jekyllrb.com/) is an amazing gem that has been around for a long time, [Github Pages](https://pages.github.com/) also provides several ways to easily start a new one. You just need to have a repo of `username/username.github.io`.
But without [Cursor](https://www.cursor.com/), this would have taken me the entire day, or maybe even a couple of days. Instead, using the power of Composer, `claude-3.7-sonnet-thinking` and a few good instructions, it bootstrapped everything, auto-corrected any issues, and provided a perfect first draft.

There was no magic in my commands. I don't have the exact set of instructions, but it was something like this:
- Let's bootstrap a new blog using Jekyll, I want it to look like my personal website: leonardopereira.com
- ~ Claude started working and got all the gems, ran the commands and more.
- I stopped some of the progress and asked not to use comments right now, as I want to evaluate them better.
- ~ In the first debug session, the CSS was not working. I complained and it did some debugging itself and identified that SASS was not working. After a few tries, it decided to use plain CSS (a great choice, actually).
- Added about 10 instructions to get the CSS right the way I wanted it, after navigating and fixing.
- For the posts, I rewrote them using my own voice, and asked to fix any grammar or bad communication, so I could improve the quality of this blog.

And yeah, that's it. Half of the other time was spent pointing the correct DNS on Squarespace and Github.

## A few takeaways

Now this is an interesting post from my side. I had some issues with Cursor in the past. Most of them I've fixed with [Rules](https://docs.cursor.com/context/rules-for-ai) and learning better ways to use the platform. But the technology is undoubtedly one of the best things we have. Many of my problems fell under one thing: bad engineers.
I have seen many people writing _horrible_ code using AI, deploying to production, calling it a day, and then PagerDuty calling me back explaining everything went down.
AI is not a panacea; it hallucinates constantly. You need to feed it good directions, but more than that. You need to read what's happening, you need to question whether the code produced makes sense and if it's actually solving the problem the correct way. Asking for something, starting the server and seeing the results are amazing. But that is not production-ready code. A good engineer needs to write good code, understand design, and use AI for what it is: A fantastic tool to help improve your job.

I had a prejudice against Cursor for a while based on bad experiences. Happily, this is not the case anymore. I am creating a new app with features that otherwise would take me years, and I should have a prototype in the upcoming months, working on it only in my free time.

## On scoping

Another extremely valuable thing to do in order to get the best from AI is: Isolating your scope. I am using ChatGPT heavily for this. I open a new session and give all the context of what I want to accomplish - fix a bug, create a new feature, etc. Later, I provide the files and start iterating with this information. This isolation diminishes the level of hallucinations greatly, helping a lot with fixing issues and **getting shit done**. And again, I review everything. If I don't know something, I ask the model what it means. It is helping me build something, but I still hold responsibility for everything.

Use AI, improve your game. Take responsibility. <span style="color: #F2C94C;">Happy coding!</span>
