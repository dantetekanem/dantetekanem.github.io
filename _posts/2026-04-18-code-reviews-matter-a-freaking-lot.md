---
layout: post
title: Code Reviews Matter a Freaking Lot
date: 2026-04-18 14:04 -0400
categories: [programming, software design, engineering culture]
tags: [code review, pull requests, clean code, SOLID, testing, mentorship, shopify, ruby, rails]
---

Hi! My name is Leo and I'm a professional Code Reviewer. Yeah, I don't think this is a real profession, but I have numbers to prove that I know what I'm going to talk about for the next few minutes. I even have the nickname Mr. Comments, and my own Slack emoji `:mr-comments:`.

In the last 6 months, I have made more than 1100 comments on 320+ Pull Requests and reviewed over 1 million lines of code, across 35+ different projects. I do an average of 7 times more reviews than our normal rate at Shopify (yes, I counted). It's important to know that my title is not a real one — I have my own projects to get done, I have my own work — so this happens through a few hours every day of focus and a process.

In this post I want to share with you some guidance, as a first-of-its-kind tutorial, highly opinionated - with spicy takes - on how to do great code reviews. It's also important that you know this is not a recognized art. You will often see people requesting more reviews, more quality. Yet no one will recognize you or give credit for your impact on a project, believe me, I _know_.

> Thank you John, Mary, Jane and Steve for the code reviews. Without you guys this project would never be shipped.
>
> <cite>— Said no one. Ever.</cite>

None of that really matters. It's your **responsibility** as a professional engineer to do great code reviews, and it's your job to understand the impact of them in your company. Responsibility, in fact, is the first topic of this post — and I'll go in order of importance, which might be a bit surprising: code will be the last of the topics.

It's *essential* for you to grasp these ideas in order to do a great code review, and it might sound counter-intuitive — in fact, many things here will. This is not about experience or programming knowledge. Principal Engineers sit at one of the highest levels in a company, and it's surprisingly common to see PRs that caused incidents have been approved by them. I want you to know that, because you shouldn't think that just because you're an intern or a manager, or because you're missing context, you can't do great reviews. Anyone can do amazing reviews, they just need to pay attention.

Right, so before going into the topics in order of importance, and the details of each one, let's define something:

> What is your goal when reviewing code?

It's approving the PR. That's it. That's your goal. -- And believe me, this changes everything. In the world of OSS (Open Source Software) it's very common to have many enforced restrictions, with collaborators expecting perfect code, leading to the perfect setup to approve your code. This is not the reality in a company. Your goal is and will always be to approve a change, and this is a *massive* point. Deeply counter-intuitive too.
But a goal and a job are two different things, and knowing the next one changes everything.

> What is your job when reviewing code?

Your job is to push forward, not backwards, the impact of the change. You'll iterate, make comments, share knowledge, request changes, test and prove what's being presented. You will participate and become a co-owner of that piece of code. Everything you do in that small window of review will be in order to reach the goal.
You will **not** block with useless opinionated comments like "This doesn't follow our guidelines.", "You can't open a PR if you're not confident about it.". You **will** block, but while providing all the necessary help and guidance towards the goal. Getting it approved, you'll win, the code owner will win, the project will win and the company will win.

These points might sound confusing now, so in order to simplify some of these ideas, let's start:

## Responsibility

When you start a code review, you are **equally** responsible for whatever outcomes this deployed code produces. That's right, you might not get the congratulations and joys of a big win, but if it causes an incident, it's on you. So take this *extremely* seriously.
If you are busy with other things, you will not do a code review. When you start, nothing else matters more than the piece of code you're looking into right now.
This is the most important thing you must know. Knowing this will allow you to approach the next PR with the necessary care and attention. The owner trusted you, and the company is trusting both of you.

So first things first: reserve time. A code review can take anywhere from 5 minutes all the way up to a whole day (with sprawling changes). If any piece of code is going to surpass 1 hour of your time, it's probably too big to be reviewed in one go. Ask the code owner to split it into smaller pieces — everyone will win at this step.

So, with that said, one good code review realistically can take from 10 to 60 minutes. As a skill, this can be trained, and the more reviews you do, the faster you will be.

## Understanding the problem

Read the description of the PR for **only** and *only* the problem. Do not care about the solution, or how it was tophatted (our internal term for QA), or anything like that. If there is a ticket or issue linked from the Pull Request, even better. Avoid being biased by the solution the owner created.
They are probably right about the reason. But if there is a 1% chance of this being the wrong approach — and in a scale company like Shopify where billions of requests are a day-to-day thing — 1% is not an edge case, it's a *guarantee*. So do not be biased. It will allow you to stay focused on the problem while the solution offered (code and tests) gets analyzed.

Sometimes a PR with only the title provides more value than any 50-line excruciatingly detailed explanation of what the author thinks is right. No one will ever remember those solution explanations. The problem, they will.

If the problem is a short one, it will be easy to keep in mind while doing the review. If it's a long one, keep it open on the side or in a notes app, so you can keep looping back to it while doing the review.

## Look at the tests

> If the discipline of requirements specification has taught us anything, it is that well-specified requirements are as formal as code and can act as executable tests of that code!
>
> <cite>— Robert C. Martin (Uncle Bob)</cite>

Tests are the written specifications of all requirements in the code change. Look at the tests: do they solve the problem? Do they cover the other side of the problem? Do they fake — stubs and mocks, I'm looking atchya — what they are supposed to be testing?
This is your first point of contact with the solution. It's TDD in a review, and there is a good reason why Test Driven Development works so well — even though it can be a boring exercise. You get a specification (tests) of what a contract (code) will do.

Compare the tests with the notes you took on the problem. Are they matching? If the problem says "Improve performance on fetching our feed by decreasing query usage," is there a test counting fewer queries happening now? Is there confirmation that the tests perform exactly what was proposed? Did any of the changes adapt existing tests to fit? — this is a *very* dangerous pattern. Sometimes a test is modified to satisfy a change, or AI adapts it to satisfy you. You need to make sure that was the right call.

Another few points worth checking:
- Are new tests actually new, or are they re-asserting something already covered elsewhere?
- Do the test names describe the behavior being verified, not the method being called?
- Is the arrange-act-assert structure clear, or is setup bleeding into the assertion?
- Are edge cases covered? Empty inputs, nil, zero, negative, boundary values, unexpected types.
- Are failure paths tested with the same care as the happy path?
- Do async or time-dependent tests rely on real sleeps, or are they using proper fakes and freezers?
- Are fixtures and factories adding noise? A test that needs 40 lines of setup is usually testing the wrong thing.
- Does a single test assert one behavior, or is it trying to cover three at once?
- If a test fails, will the error message tell you *why* immediately, or will you need to dig?
- Is there coverage for the regression that motivated the PR in the first place?

## Know the designs

I cannot stress enough how *important* it is to know design principles and architecture concepts. I love the [SOLID](https://en.wikipedia.org/wiki/SOLID) principles. They help me write much better code. There are many others, but since Shopify is Ruby-focused, and our approach to objects just feels natural (and SOLID works well for any language, honestly), it's fair enough to anchor the discussion on this.

At this step, I personally like to use my imagination when looking at things. I see the files, the classes, the methods as people who know what they know, and I talk to them. You can do whatever works for you. But keep the principles in mind. If one piece of code is violating one principle, that's a **powerful** clue of what you could improve and change there. The chances of the code being wrong *just* because the design was dismissed are huge. Look at the first principle of SOLID, the S — Single Responsibility Principle.

You have a piece of code that does this:

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

Look at the method name: `update_stats_and_notify`. The word **and** is already screaming at you. Any time you need an *and* to describe what a method does, you're admitting out loud that it's doing two things. That alone is the smell — you don't even need to read the body to know SRP is being violated.

And then you read the body, and it's worse than you thought. Why would you ever wrap a third-party call — probably an HTTP request — inside your own database transaction? Not even `after_create_commit`. Incrementing `posts_created` should be part of the transaction, so if one fails the other fails too. But the email? That has no business being there. Post is doing *way* more than it should — sending notifications is not its responsibility.

I won't get into the details of the principles here, that's not the goal of this post. You should know them, though. Study them. Live by them.

## Smells and vicinity

A smell is a piece of code that is recognizably wrong across a codebase. They are common, and they show up in every language. In a Minitest suite, if you see a `.any_instance`, that's a clear smell. In TypeScript, a stray `any` — smell. In Ruby, a `rescue` with no class — smell.

Smells give you a map. They point you straight to the places most likely to reward your attention, and the code right next to them — the *vicinity* — usually tells you the rest of the story. If what surrounds the smell looks rushed, inconsistent, or over-engineered, the change you're reviewing is probably swimming in the same water. Ask yourself whether it fits, or whether it's just piling onto something that was already broken.

Vicinity is not only for smells, though. If a PR touches 2 lines in a 1000-line file, what are the 50 lines above and below doing? Do they fit with the change? Is the change sitting inside a 200-line method that was already probably violating the design principles? If so, you're in the right place — and you can ask yourself (our next topic): where should this code actually be?

Here's a short, non-exhaustive list of smells I keep my eyes open for, grouped by language:

Ruby and Rails:
- Long methods and long parameter lists
- Feature envy, a method reaching into another object's data
- Fat models with a pile of callbacks doing unrelated work
- Rescuing without specifying the exception class
- Boolean arguments that flip a method's behavior

Minitest:
- `.any_instance` stubs
- Tests named after methods instead of behaviors
- One test asserting three unrelated behaviors
- Mocking code we own — if you're stubbing your own class, the design is probably off. Mocking a wrapper around a third-party is the right move.
- `sleep` calls instead of time helpers or proper waits

JavaScript and TypeScript:
- `any`, and the `as unknown as` escape hatch
- `// @ts-ignore` with no comment explaining why
- The non-null assertion `!` used as "trust me"
- Deeply nested ternaries
- `console.log` left in the diff

You'll build your own list over time. The point isn't to memorize smells — it's to train the reflex that says "hold on, that looks wrong" before you even finish reading the method.

[All the Little Things](https://www.youtube.com/watch?v=8bZh5LMaSmE) by [Sandi Metz](https://sandimetz.com/) is amazing. It's not focused *necessarily* on the topic I'm talking about, though you can easily relate. This is a **must** watch.

## Ask yourself

This is a short one. Simply continuously ask yourself if what you are seeing makes sense with the problem. If you cannot answer, add a comment making the question. Questions in a code review can carry more weight than any comment you leave. They make the owner think again, and they make you a co-thinker instead of a gatekeeper. "Is this really the right place for this?" "What happens if the job retries?" "Would this still work on Friday night with 10x the traffic?" Questions like these have changed the direction of PRs I was one approval away from merging.

As this is not a science, there is no direct wrong or right, what we have is a sprawling codebase with many minds working together to get the best out of it. A well-placed question is often the single most valuable thing on a PR. Multiply that by hundreds of PRs a quarter and you are shaping how an entire team thinks about code.

So, just keep asking yourself if this makes sense.

## Inspect the code

Know your shit. Sorry about my language. This is kind of optional, really. If you are a really good Ruby engineer, or a really good Javascript engineer, or, ok, you got it. So, you know that a single `huge_array.map!` will perform much better than some crazy array mapping with an `each` in there. You also will know the trade-offs. You should know that in Ruby a `!` means it will modify itself inline, or raise an exception. And you also know that a predicate `?` always returns a boolean.

All this is knowledge you know you need to apply in a code review. This is one of the things most reviews focus on — what they know. Which generates a staggering amount of approved, dangerous changes. Maybe "dangerous" is the wrong word. Code quality and knowing the details are wonderful to add, they enrich a lot, yet it's just a small, rare slice of what we do.

This part is also one of the easiest ones to be replaced by AI. AI is great at these things if you point it to the right place. Have you seen what [autoresearch](https://shopify.engineering/autoresearch) can do?

You might have also noticed that I haven't left one section about bugs. Yeah, use AI for finding bugs, we have several tools at Shopify covering this. A few are quite remarkable at it. Your own set of skills can help evaluate bugs, security and much more. Leaning on tooling helps tremendously. My guidance here is on the human side.

## Write good freaking comments

A small confession before we dive in. I said earlier the topics would be in order of importance, and they were — until this one. Writing good comments is actually the second most important skill, right after Responsibility. I placed it at the end on purpose, because every topic before it is what a good comment depends on: the problem, the tests, the design, the smells, the questions. Without that context, a comment is just an opinion. With it, a comment becomes a guide. And that is the whole point of this section.

Now. How do you write good freaking comments? Keep focused on your goal. Your comment must give directions, ask the right questions, raise the right conversation. Sometimes when reviewing a piece of code that I think it's wrong, I prove it to myself first. I literally open `irb` or `node`, I make a sample of the code and execute it. Was I right or wrong? If wrong, I learned, which is good for me and good for the next review. Am I right, tho?
So I'll make a comment, and I'll give the instructions along with it.

Let's imagine we have this change:

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

And my comment:

```
We can move all this business logic out of the controller if we give Order ownership of its own rules. For example, let's have a before_validation calculating the totals, and a predicate for the review threshold, like this:

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

Now the controller just builds, saves and redirects, and any other caller (a job, a Rake task, an API endpoint) gets the same rules for free. As a bonus, we have removed all the magic numbers.
```

I didn't just point out that this was wrong and that the author needed to fix it. I guided him through the solution. My comment was an addition, not a blocking action (although I can request changes and literally block the PR from merging). We are making and working on this together. And we must do this all the time.

Sometimes, though, you don't have the solution — you have a suspicion. That's when a good question beats a bad answer. Let's imagine this PR adds a new `ProcessRefundJob`:

```ruby
class ProcessRefundJob < ApplicationJob
  def perform(refund_id)
    refund = Refund.find(refund_id)
    Stripe::Refund.create(charge: refund.charge_id, amount: refund.amount)
    refund.update!(status: "completed")
  end
end
```

And my comment:

```
Hey, quick one. If the Stripe call succeeds but the refund.update! raises, Sidekiq will retry the whole job, right? That would hit Stripe again and refund the customer twice.

Am I missing something here, or do we need to either split the Stripe call from the DB update, or pass an idempotency key so Stripe deduplicates on its side? Curious how you were thinking about it.
```

I didn't accuse, I didn't block, I didn't demand a rewrite. I shared what I saw, offered two concrete paths forward, and handed the problem back to the author. Either they realize the bug, or they teach me why it's already safe. Both outcomes are wins.

Aim your comments towards our goal: Approving the PR.

## Conclusion

I hope you have learned a few things from this. This is how I work, and I have been shaping my reviews in this objective way for well over a decade now. I love code reviews because I learn a lot, and I can also teach a lot. This exercise is a pleasure to me, and I've made it a skill. I firmly believe you can make it one of yours too.
Now, with AI writing 95% of our code or more, slop everywhere, brute-forcing solutions that will satisfy us — seeking plausibility and not correctness — knowing how to do great code reviews is even more important.

I might say code reviews will be the most important thing we have in the future. At Shopify we are emphasizing this more and more.

Have questions or ideas on this? You can find me at [me@leonardopereira.com](mailto:me@leonardopereira.com). I hope you enjoyed it. 😄