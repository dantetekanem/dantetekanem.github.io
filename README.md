# Leonardo Pereira's Blog

This is a personal blog built with Jekyll, featuring a clean and modern design similar to [www.leonardopereira.com](https://www.leonardopereira.com).

## Features

- Responsive design with dark theme
- Blog posts with categories and tags
- Archive page with posts organized by year
- Category and tag pages
- Code syntax highlighting
- Markdown support

## Local Development

To run this site locally:

1. Install dependencies:
   ```
   bundle install
   ```

2. Start the Jekyll server:
   ```
   bundle exec jekyll serve
   ```

3. View the site at [http://localhost:4000](http://localhost:4000)

## Adding Content

### Blog Posts

To add a new blog post, create a new markdown file in the `_posts` directory with the following format:

```
---
layout: post
title: "Your Post Title"
date: YYYY-MM-DD HH:MM:SS -0400
last_modified_at: YYYY-MM-DD HH:MM:SS -0400  # Optional
categories: [category1, category2]
tags: [tag1, tag2, tag3]
---

Your post content here...
```

## License

This project is open source and available under the [MIT License](LICENSE). 