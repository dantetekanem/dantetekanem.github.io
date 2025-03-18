---
layout: post
title: Running a Rails 2.3.4 and Ruby 1.9.3 Project from 2009!
date: 2025-03-17 23:07 -0400
categories: [programming, ai, back to the past]
---

Yesterday I got an e-mail from Squarespace, informing me that my Google Domains account (now on Squarespace) would increase the price since Gemini and AI are costing more and in every product of theirs. Which is horrible, I don't think they add any value and it's impossible to opt-out.
So, I started digging and seeing how I could make things cheaper so at least from my side, Google would not get all the greenies it wants. Well, one of the tools I decided to use was to find heavy files in my Gmail, Google Photos and Google Drive.

Out of curiosity, I found a Git bundle of a project I was part of in 2009. It was my first real Ruby project, getting my hands dirty. The project was Sportlog, a community driven by exercises and milestones, very similar to what Strava is nowadays. Unfortunately, it didn't work out, and the project was closed in 2010.
Curious as I am, I had to see what was there, right now.
So, I ran:

```bash
git clone ~/Downloads/Sportlog.git.bundle
```

And to my wonder all the files were there! Like looking into the past:
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

Finally! So now, how can I run a project from 15 years ago? It will take a long time to upgrade everything, and I will need to do it in steps. From Rails 2, to 3, and then 4 and etc. And in version 3, [Ruby on Rails and Merb merged](https://yehudakatz.com/2008/12/23/rails-and-merb-merge/), so it was a **lot** of changes to handle. Impossible.

But nowadays we have a series of tools that can actually make us move to the past and accomplish this: **Docker** and **AI**.

With that in mind, I opened Cursor with my project, gave the first instructions and started a battle of instructions that lasted for almost 2 hours. But something was also missing: the database. The migrations were there, but I did not have similar data to work with. Lucky me, in my e-mail was also a copy of the database we used during development (almost 15 years ago we handled everything through e-mails), Dropbox and others were brand new. 
With all that in place, here is my current git status:

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

The main changes:
- Several monkey patches to support outdated code in libraries dead for a long time. AI shined here.
- Update of locales. Most of this project was written in Brazilian Portuguese, and the encoding at the time was extremely painful. I did several changes to just remove the magic words, for example "Administração" contains 2 encoded characters not common to English language, and I just modified it to be "Administracao", no special characters, no weird encoding errors.
- For some reason, several helpers were missing. I think Cursor modified something to always expect a non-existing helper, so I had to add several for the pages I navigated.
- Restoring old plugins (think like Engines), had to go through all the versions in an archived project (community_engine) and get the correct Rails version.
- Removing keys and e-mails so I don't message anyone from my old team `¯\_(ツ)_/¯` after all, I don't own this code.
- Fixes and fixes! Several, from a wrong column in the database to weird ASCII characters.


Btw! This is how we used to run `rails console` in the past:
```bash
docker-compose exec web script/console
```

which executes:
```ruby
#!/usr/bin/env ruby
require File.expand_path('../../config/boot',  __FILE__)
require 'commands/console'
```

And after some time, it was running:
![Sportlog Home Page](/assets/images/sportlog1.png)
![Sportlog Training Panel](/assets/images/sportlog2.png)

This is so exciting! So many memories. And so many interesting things! Now, let's look at the code.

Today we have `refute` and `assert` on Minitest, in 2009, not quite:

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

So, it was `assert ! object.valid?` to verify if it was false? A bit interesting. And I was quite happy to see a lot of functional tests. Which btw, this is the whole tests structure:

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

A bit different from what we have today.

Functional tests were not so different from what we have today too:

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

I can see many differences and many things I would write differently too, but nonetheless, I can easily understand this. And this is the magic Ruby on Rails introduced a long time ago. Ruby is Poetry.

Now, investigating a few different files. Here is the models/post.rb:

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

Several things to notice here:
- The lack of space on `class Post<ActiveRecord::Base` kills me 😂. First refactor: `class Post < ActiveRecord::Base`.
- Ruby hash rocket all over the place.
- A lot of inexperienced code too "return", but in Ruby, every method returns something. That one was my fault!
- A lot of `and` and `or`. Very weird, and I don't think that was on purpose.

And another list of strange things:

- This line: `flash[:notice] = :youve_been_logged_out_hope_you_come_back_soon.l` Why not I18n.l()?
- A lot of `format.xml`, looks like it was still a thing. Not sure why supported in this project, though.
- A lot of `define_method` for no good reason.
- The font size was very small.
- A lot of `form_remote_for` and `jQuery`, I mean, look at this beauty:

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

A lot of design ideas missing from this implementation, which makes sense, most of the developers came from Web Agencies and had no knowledge of Design Principles.

<hr>

Well, this was a very interesting problem. Going to the past and seeing how things worked, deployment techniques, Rack sending e-mails to notify of bugs in production and much more. Glad to see how far we have come!

Hope you liked going to the past with me.

<span style="color: #F2C94C;">Happy coding!</span>
