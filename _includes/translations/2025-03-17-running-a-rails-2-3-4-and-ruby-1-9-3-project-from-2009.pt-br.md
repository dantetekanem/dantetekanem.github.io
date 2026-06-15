Ontem recebi um e-mail da Squarespace informando que minha conta do Google Domains (agora na Squarespace) teria aumento de preço, já que Gemini e AI estão custando mais e aparecem em todos os produtos deles. O que é horrível; não acho que eles adicionem valor algum e é impossível optar por não usar.
Então comecei a fuçar e ver como poderia deixar as coisas mais baratas para que, pelo menos da minha parte, o Google não pegasse todos os verdinhos que queria. Bem, uma das ferramentas que decidi usar foi procurar arquivos pesados no meu Gmail, Google Photos e Google Drive.

Por curiosidade, encontrei um Git bundle de um projeto do qual participei em 2009. Foi meu primeiro projeto Ruby de verdade, colocando a mão na massa. O projeto era o Sportlog, uma comunidade movida por exercícios e marcos, muito parecida com o que o Strava é hoje. Infelizmente, não deu certo, e o projeto foi encerrado em 2010.
Curioso como sou, tive que ver o que havia ali, agora.
Então rodei:

```bash
git clone ~/Downloads/Sportlog.git.bundle
```

E, para minha surpresa, todos os arquivos estavam lá! Como olhar para o passado:
```
Mar 17 15:15 Capfile
Mar 17 15:15 README
Mar 17 22:21 Rakefile
Mar 17 15:15 app
Mar 17 21:49 config
Mar 17 15:15 db
Mar 17 15:15 doc
Mar 17 15:15 lang
Mar 17 15:15 lib
Mar 17 21:28 log
Mar 17 21:24 patches
Mar 17 15:15 public
Mar 17 15:15 script
Mar 17 15:15 test
Mar 17 15:15 themes
Mar 17 21:57 tmp
Mar 17 15:15 utils
Mar 17 15:15 vendor
```

Finalmente! Então, agora, como eu rodo um projeto de 15 anos atrás? Levaria muito tempo para atualizar tudo, e eu teria que fazer isso em etapas. Do Rails 2 para o 3, depois para o 4 e assim por diante. E na versão 3, [Ruby on Rails e Merb se fundiram](https://yehudakatz.com/2008/12/23/rails-and-merb-merge/), então havia **muita** mudança para lidar. Impossível.

Mas hoje em dia temos uma série de ferramentas que realmente conseguem nos levar para o passado e realizar isso: **Docker** e **AI**.

Com isso em mente, abri o Cursor com meu projeto, dei as primeiras instruções e comecei uma batalha de instruções que durou quase 2 horas. Mas também faltava algo: o banco de dados. As migrations estavam lá, mas eu não tinha dados parecidos para trabalhar. Sorte minha: no meu e-mail também havia uma cópia do banco de dados que usávamos durante o desenvolvimento (quase 15 anos atrás, lidávamos com tudo por e-mail; Dropbox e outros ainda eram muito novos).
Com tudo isso no lugar, aqui está meu git status atual:

```
➜  Sportlog.git git:(master) ✗ git st
On branch master
Your branch is up to date with 'origin/master'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
  (commit or discard the untracked or modified content in submodules)
        modified:   Rakefile
        modified:   app/controllers/application_controller.rb
        modified:   app/controllers/sportlog_sessions_controller.rb
        modified:   app/helpers/application_helper.rb
        modified:   app/helpers/base_helper.rb
        modified:   config/deploy.rb
        modified:   config/environment.rb
        modified:   config/environments/production.rb
        modified:   config/gmaps_api_key.yml
        modified:   config/locales/pt.yml
        modified:   lang/ui/en-US.yml
        modified:   lang/ui/pt-BR.yml
        modified:   themes/sportlog_v1/views/comments/_comment_form.html.erb
        modified:   themes/sportlog_v1/views/comments/_comment_form_training.html.erb
        modified:   themes/sportlog_v1/views/shared/_user_menu.html.erb
        modified:   vendor/plugins/community_engine (new commits, modified content, untracked content)
        modified:   vendor/plugins/ym4r_gm/lib/gm_plugin/key.rb
        modified:   vendor/rails/activesupport/lib/active_support/locale/en.yml
        modified:   vendor/rails/railties/lib/rails/gem_dependency.rb
        modified:   vendor/rails/railties/lib/rails/plugin/loader.rb

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        .dockerignore
        Dockerfile
        README.md
        app/helpers/info_helper.rb
        app/helpers/sportlog_base_helper.rb
        app/helpers/sportlog_helper.rb
        app/helpers/sportlog_posts_helper.rb
        app/helpers/sportlog_sessions_helper.rb
        app/helpers/sportlog_users_helper.rb
        app/helpers/trainings_helper.rb
        config/initializers/desert_compatibility.rb
        config/initializers/desert_object_patch.rb
        config/initializers/encoding_fixes.rb
        config/initializers/gem_compatibility.rb
        config/initializers/i18n_config.rb
        config/initializers/md5_compatibility.rb
        config/initializers/missing_plugins_handler.rb
        config/initializers/rails_2_3_4_compatibility.rb
        config/initializers/ruby193_compatibility.rb
        config/initializers/ruby19_encoding_fixes.rb
        config/initializers/ruby20_compatibility.rb
        config/initializers/skip_missing_plugins.rb
        config/initializers/utf8_templates.rb
        config/preinitializer.rb
        docker-compose.yml
        patches/
        sportlog-2010-02-26.sql
        "themes/sportlog_v1/images/events/foto Corporate Run S\303\243o Paulo.jpg"
        vendor/plugins/white_list/
```

As principais mudanças:
- Vários monkey patches para dar suporte a código ultrapassado em bibliotecas mortas há muito tempo. A AI brilhou aqui.
- Atualização de locales. A maior parte desse projeto foi escrita em português brasileiro, e a codificação naquela época era extremamente dolorosa. Fiz várias mudanças só para remover as palavras mágicas; por exemplo, "Administração" contém 2 caracteres codificados que não são comuns na língua inglesa, e eu simplesmente modifiquei para "Administracao", sem caracteres especiais, sem erros estranhos de encoding.
- Por algum motivo, vários helpers estavam faltando. Acho que o Cursor modificou algo para sempre esperar um helper inexistente, então tive que adicionar vários para as páginas em que naveguei.
- Restaurar plugins antigos (pense como Engines) exigiu passar por todas as versões em um projeto arquivado (`community_engine`) e pegar a versão correta do Rails.
- Remover chaves e e-mails para eu não mandar mensagem para ninguém do meu time antigo `¯\_(ツ)_/¯`; afinal, eu não sou dono desse código.
- Correções e mais correções! Várias, desde uma coluna errada no banco até caracteres ASCII estranhos.


Ah! Era assim que rodávamos `rails console` no passado:
```bash
docker-compose exec web script/console
```

que executa:
```ruby
#!/usr/bin/env ruby
require File.expand_path('../../config/boot',  __FILE__)
require 'commands/console'
```

E depois de algum tempo, estava rodando:
![Página Inicial do Sportlog](/assets/images/sportlog1.png)
![Painel de Treinos do Sportlog](/assets/images/sportlog2.png)

Isso é empolgante demais! Tantas memórias. E tantas coisas interessantes! Agora, vamos olhar para o código.

Hoje temos `refute` e `assert` no Minitest; em 2009, nem tanto:

```ruby
require 'test_helper'

class ExerciseMachineBrandTest < ActiveSupport::TestCase
  test "presence of name" do
    brand = create_exercise_machine_brand(:name => nil)
    assert ! brand.valid?
    assert brand.errors.on(:name)
    
    brand.name = 'brand'
    assert brand.valid?
  end
end
```

Então era `assert ! object.valid?` para verificar se era falso? Um pouco interessante. E fiquei bem feliz em ver muitos testes funcionais. Que, aliás, tinham esta estrutura completa:

```
fixtures
functional
integration
javascript
jmeter.jmx
performance
test_helper.rb
unit
```

Um pouco diferente do que temos hoje.

Os testes funcionais também não eram tão diferentes do que temos hoje:

```ruby
require 'test_helper'

class SportlogCommentsControllerTest < ActionController::TestCase
  alias_method :assert_difference_original, :assert_difference

  include AuthenticatedTestHelper
  
  def setup
    login_as(:rodrigo)    
  end
  
  test "should create a post comment" do
    assert_difference_original('Comment.count') do
      post :create, :post_id => posts(:funny_post), :comment => { :comment => "testing" }, :locale => "pt"
    end
    
    assert_redirected_to dashboard_user_path(posts(:funny_post).user)
    
    assert_no_difference(Comment, 'count') do
      post :create, :post_id => posts(:not_funny_post), :comment => { :comment => "should not be possible" }, :locale => "pt"
    end
    
    assert_redirected_to dashboard_user_path(users(:edgard))

    @request.env['HTTP_ACCEPT'] = 'text/javascript'
    
    assert_difference_original('Comment.count') do
      post :create, :post_id => posts(:funny_post), :comment => { :comment => "testing" }, :locale => "pt"
    end
    
    assert_response :success
    
    assert_no_difference(Comment, 'count') do
      post :create, :post_id => posts(:not_funny_post), :comment => { :comment => "should not be possible" }, :locale => "pt"
    end
    
    assert_response :unauthorized

    assert_no_difference(Comment, 'count') do
      post :create, :training_id => trainings(:one), :comment => { :comment => "should not be possible" }, :locale => "pt"
    end

    assert_response :unauthorized
  end
  
  test "should redirect properly" do
    post :create, {"comment"=>{"comment"=>"asfsdf"}, "commit"=>"comentar", "training_id"=> trainings(:one), "action"=>"create", "locale"=>"pt"}
    assert_redirected_to dashboard_user_path(trainings(:one).milestone.user)
  end
end
```

Consigo ver muitas diferenças e muitas coisas que eu escreveria de outro jeito também, mas ainda assim consigo entender isso facilmente. E essa é a mágica que Ruby on Rails introduziu muito tempo atrás. Ruby é poesia.

Agora, investigando alguns arquivos diferentes. Aqui está o `models/post.rb`:

```ruby
class Post<ActiveRecord::Base
  belongs_to :recipient, :class_name => "User", :foreign_key => "recipient_id"
  
  tracks_unlinked_activities [:post_received, :post_to_myself]
  
  def create_activity_from_self
    # Just needed cause of duplication of post feed
  end
  
  def send_notifications
    SportlogUserNotifier.deliver_post(self) if should_notify_recipient?
  end
  
  def should_notify_recipient?
    return unless recipient
    return false if recipient.eql?(user)
    true    
  end
  
  def username
    user.full_name 
  end
  
  def owner
  	return recipient.blank? ? user : recipient
  end

  def can_be_deleted_by?(person)
     person && (person.admin? || person.id.eql?(user_id) || person.id.eql?(recipient_id))
  end

  def commentable?(commenter)
    ! (commenter.blank? or (!user.blank? and user != commenter and !Friendship.friends?(commenter, user)))
  end
end
```

Várias coisas para notar aqui:
- A falta de espaço em `class Post<ActiveRecord::Base` me mata 😂. Primeira refatoração: `class Post < ActiveRecord::Base`.
- Hash rocket de Ruby para todo lado.
- Muito código inexperiente também com "return", mas em Ruby todo método retorna algo. Essa foi culpa minha!
- Muitos `and` e `or`. Muito estranho, e não acho que tenha sido de propósito.

E mais uma lista de coisas estranhas:

- Esta linha: `flash[:notice] = :youve_been_logged_out_hope_you_come_back_soon.l` Por que não `I18n.l()`?
- Muito `format.xml`; parece que ainda era uma coisa. Não sei bem por que esse projeto dava suporte a isso.
- Muito `define_method` sem um bom motivo.
- O tamanho da fonte era muito pequeno.
- Muito `form_remote_for` e `jQuery`; quero dizer, olha esta beleza:

```html
<% form_remote_for(:comment, 
  :before => " if(jQuery('#comment_textarea_#{item_id}').val() == '') { alert('Seu comentario nao pode ser vazio.'); jQuery('#comment_textarea_#{item_id}').focus(); return false; } ",
  :loading => " jQuery('#form_loader_#{item_id}').show(); jQuery('#comment_sub_#{item_id}').hide(); $$('div#comments div.errors')[0].innerHTML = ''; $('comment_spinner').show(); ", 
  :url => comments_url(commentable.class.to_s.underscore, commentable.id ), 
  :update => "comment_form_#{item_id}", 
  :position => 'before', 
  :success => " jQuery('#form_loader_#{item_id}').hide(); jQuery('#comment_d_#{item_id}').fadeOut('slow'); jQuery('#comment_textarea_#{item_id}').val(''); jQuery('#comment_sub_#{item_id}').show(); cycleCommentList('comment_list_#{item_id}');",  
  :failure => "alert('#{I18n.translate(:not_allowed)}');jQuery('#form_loader_#{item_id}').hide();",
  :html => {:id => 'new_comment_form', :class => "MainForm"}) do |f| %>
      <fieldset>
        <textarea id="comment_textarea_<%= item_id %>" class="ta-a" rows="5" name="comment[comment]" cols="86"></textarea>
        <%= f.submit "comentar", :class => "bt-style-c right", :id => "comment_sub_#{item_id}" %>
        <div id="form_loader_<%= item_id %>" class="loader_comment right" style="display: none;"><%= image_tag "theme/ajax-loader.gif" %></div>	    
      </fieldset>
<%end%> 
```

Muitas ideias de design faltando nessa implementação, o que faz sentido; a maioria dos desenvolvedores vinha de Web Agencies e não tinha conhecimento de Princípios de Design.

<hr>

Bem, esse foi um problema muito interessante. Ir ao passado e ver como as coisas funcionavam, técnicas de deploy, Rack enviando e-mails para avisar sobre bugs em produção e muito mais. Fico feliz em ver o quanto evoluímos!

Espero que você tenha gostado de voltar ao passado comigo.

<span style="color: #F2C94C;">Happy coding!</span>
