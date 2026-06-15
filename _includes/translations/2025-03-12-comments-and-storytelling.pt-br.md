Recentemente encontrei esta [discussão](https://github.com/johnousterhout/aposd-vs-clean-code/blob/main/README.md) entre **Uncle Bob** e **John Ousterhout**. Ela é um pouco agressiva e dura, mas ainda assim vale a leitura! Eles passam por 3 tópicos principais:

- Refatoração e métodos pequenos vs métodos mais longos.
- Comentários: úteis ou não?
- TDD.

Quero discutir o segundo e o terceiro tópicos, mas neste post vou focar no segundo: _Comentários!_

Minha opinião é que comentários devem dar um pedaço de história ou narrativa sobre por que uma decisão foi tomada. Não acho que uma quantidade mínima de comentários e código autodocumentado seja sempre suficiente, embora na maior parte do tempo seja! Mas às vezes existe uma peça faltando sobre por que a decisão foi tomada e, mesmo que o código seja bastante autoexplicativo, o "porquê" não pode ser adivinhado.

Por exemplo, vamos olhar para este método falso de autenticação:

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

O comentário aqui nos diz exatamente _por que_ não estamos usando o `has_secure_password` embutido do Rails. Sem esse comentário, alguém poderia pensar "vamos refatorar isso para usar a abordagem padrão" e quebrar a compatibilidade com o sistema legado. O comentário nos dá um insight crucial que nunca obteríamos apenas pelo código!

Aqui vai outro exemplo de um possível sistema de pagamentos:

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

Os comentários explicam regras de negócio que não são nada óbvias pelo código. Sem eles, alguém poderia tentar "limpar" o código padronizando a formatação dos valores ou os timeouts, e pronto! Você ganhou bugs sutis em produção que são super difíceis de rastrear.

E se um novo desenvolvedor decidir refatorar o código, o que ele deveria considerar, talvez pense: "por que não usar uma gem [Money](https://github.com/RubyMoney/money) para lidar com os detalhes?" Com esses comentários, ele terá informação extra para realmente fazer as melhores mudanças, e não apenas esperar um teste quebrar ou um incêndio precisar ser apagado.

Agora olhe este exemplo, explicando exatamente o que um código deve fazer, em passos nos quais o próprio código já consegue expressar essas ações:

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

Esses comentários no último exemplo não ajudam em nada. Isso é especialmente verdadeiro com Ruby, uma linguagem eloquente. Por que explicar se algo está em estoque quando o próprio Ruby consegue expressar isso claramente com `item.in_stock?`?

Esses exemplos mostram exatamente do que estou falando — comentários que vão além de apenas descrever o código. Eles nos dão a história por trás, o _porquê_ das decisões que jamais conseguiríamos adivinhar apenas pelo código. Eles referenciam coisas como restrições históricas, peculiaridades de APIs e regras de negócio que não estão aparentes no código em si. Esse é o valor real de bons comentários!

Agora, comentários devem dar contexto e responder perguntas que o código não consegue responder. Explique os porquês. Caso contrário, seu código deve sempre ser autoexplicativo. Isso inclui usar bons nomes de classes e métodos que sigam bons princípios e tenham bom design. Assim você não vai superengenheirar nada nem adicionar centenas de comentários ruins.
Frameworks (como Rails) têm [ótimos exemplos](https://github.com/rails/rails/blob/main/activesupport/lib/active_support/concern.rb) de comentários que adicionam contexto, explicações e levam você a uma solução correta.

<span style="color: #F2C94C;">Happy coding!</span>
