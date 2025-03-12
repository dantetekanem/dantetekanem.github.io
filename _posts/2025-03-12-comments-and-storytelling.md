---
layout: post
title: Comments and Storytelling
date: 2025-03-12 15:38 -0400
categories: [programming, software design]
tags: [clean code, a philosophy of software design, comments, programming]
---

Recently I have stumbled upon this [discussion](https://github.com/johnousterhout/aposd-vs-clean-code/blob/main/README.md) between **Uncle Bob** and **John Ousterhout**. It's a bit aggressive and harsh, but nonetheless it's worth reading! They go through 3 main topics:

- Refactoring and small methods vs longer methods.
- Comments, useful or not?
- TDD.

I want to discuss the second and third topics, but in this post I'll focus on the second one: _Comments!_

My opinion is that comments should give a piece of history or story around why a decision was made. I don't think a minimum amount of comments and self-documented code is always sufficient, though most of the time it is! But sometimes there is a missing piece about why the decision was made, and even if the code is quite self-explanatory, the "why" cannot be guessed.

For example, let's look at this fake authentication method:

```ruby
class User < ApplicationRecord
  def authenticate(password)
    # We don't use has_secure_password here because we needed to maintain
    # compatibility with our legacy system that used a custom hashing algorithm.
    # This implementation ensures that both old and new passwords work during
    # the transition period. See migration plan in JIRA ticket AUTH-4592.
    return false if password_digest.blank?
    
    if password_digest.start_with?('legacy:')
      # Legacy algorithm with different salt approach
      legacy_digest = password_digest.sub('legacy:', '')
      LegacyPasswordService.check(password, legacy_digest).tap do |result|
        # Upgrade to bcrypt if login successful with legacy password
        update(password: password) if result
      end
    else
      BCrypt::Password.new(password_digest).is_password?(password)
    end
  end
end
```

The comment here tells us exactly _why_ we're not using Rails' built-in `has_secure_password`. Without this comment, someone might think "let's refactor this to use the standard approach" and break compatibility with the legacy system. The comment gives us crucial insight that we'd never get just from the code!

Here's another example on a possible payment system:

```ruby
class PaymentProcessor
  def process_international_payment(amount, currency, recipient)
    # Japanese yen amounts must be handled as whole numbers without decimal places
    # due to requirements from their banking API. One JPY in our system is sent as 1,
    # unlike other currencies where we send the amount in smallest unit (cents)
    if currency.upcase == 'JPY'
      formatted_amount = amount.to_i
    else
      # Convert from dollars to cents for other currencies
      formatted_amount = (amount * 100).to_i
    end
    
    # Stripe has a 25-second timeout for payments to Turkey (see outage report 2023-05-12)
    # so we increase our timeout and add retries only for this specific country
    timeout = recipient.country_code == 'TR' ? 45 : 30
    
    api_client.create_payment(
      amount: formatted_amount,
      currency: currency,
      recipient: recipient,
      request_timeout: timeout
    )
  end
end
```

The comments explain business logic that isn't obvious at all from the code. Without them, someone might try to "clean up" the code by standardizing the amount formatting or timeouts, and boom! You've got subtle bugs in production that are super hard to track down.

And if a new developer decides to refactor the code, which they should consider, they might think "why not use a [Money](https://github.com/RubyMoney/money) gem to handle the details?" With these comments, they will have extra information to actually perform the best changes, and not just wait for a test to break or a fire to be put out.

Now look at this example, explaining exactly what a code should do, in steps where the code itself can already express these actions:

```ruby
class Order < ApplicationRecord
  # This method calculates the total price of the order
  def calculate_total
    # Initialize the total variable to zero
    total = 0
    
    # Loop through each item in the order
    order_items.each do |item|
      # Get the price of each item
      item_price = item.price
      
      # Get the quantity of each item
      quantity = item.quantity
      
      # Multiply price by quantity to get item subtotal
      item_subtotal = item_price * quantity
      
      # Add the item subtotal to the total
      total += item_subtotal
    end
    
    # If there is a discount, subtract it from the total
    if discount.present?
      # Get the discount amount
      discount_amount = discount.amount
      
      # Subtract the discount from the total
      total -= discount_amount
    end
    
    # Return the final total
    return total
  end
  
  # This method checks if an order can be shipped
  def ready_to_ship?
    # Check if payment has been processed
    payment_processed = payment.completed?
    
    # Check if all items are in stock
    items_available = order_items.all? { |item| item.in_stock? }
    
    # Return true only if payment is processed and items are available
    return payment_processed && items_available
  end
end
```

These comments in the last example do not help at all. This is especially true with Ruby, an eloquent language. Why explain if something is in stock when Ruby itself can express this clearly with `item.in_stock?`?

These examples show exactly what I'm talking about — comments that go beyond just describing the code. They give us the backstory, the _why_ behind decisions that we could never guess from the code alone. They reference things like historical constraints, API quirks, and business rules that aren't apparent in the code itself. That's the real value of good comments!

Now, comments should give context and answer questions that code cannot do. Explain the whys. Otherwise, your code should always be self-explanatory. This includes using good class names and methods that follow good principles and have good design. So you won't over-engineer anything or add hundreds of bad comments.
Frameworks (such as Rails) have [great examples](https://github.com/rails/rails/blob/main/activesupport/lib/active_support/concern.rb) of comments that add context, explanations and lead you to a correct solution.

Happy coding!
