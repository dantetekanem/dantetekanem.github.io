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

The local build was verified on macOS with Ruby **4.0.5**, Bundler **2.6.5** and the locked Jekyll **4.4.1** dependencies. These are tested versions, not a minimum-version claim. The repository does not select a Ruby runtime automatically. macOS system Ruby 2.6.10 failed to find the required Bundler; select the managed runtime instead.

Run these commands from the repository root. The examples use mise (https://mise.jdx.dev/); another Ruby version manager is fine if it selects the same runtime.

```sh
mise exec ruby@4.0.5 -- ruby --version
mise exec ruby@4.0.5 -- bundle --version
mise exec ruby@4.0.5 -- bundle check
```

If Ruby, Bundler or dependencies are missing, install them under the managed runtime, then repeat the checks:

```sh
mise install ruby@4.0.5
mise exec ruby@4.0.5 -- gem install bundler -v 2.6.5
mise exec ruby@4.0.5 -- bundle install
```

### Build without changing the checkout

Build into a new temporary directory outside the repository and disable Jekyll's disk cache:

```sh
site_dir="$(mktemp -d /tmp/leonardo-blog.XXXXXX)"
mise exec ruby@4.0.5 -- bundle exec jekyll build \
  --disable-disk-cache --destination "$site_dir"
git status --short
```

A clean tree should remain clean. This avoids overwriting the tracked `_site/` directory or creating `.jekyll-cache/`. Inspect the generated pages in `$site_dir`, including the latest post under `2026/09/20/your-agents-can-do-more-than-you-imagine/index.html`.

For an interactive preview, use a separate temporary destination:

```sh
site_dir="$(mktemp -d /tmp/leonardo-blog.XXXXXX)"
mise exec ruby@4.0.5 -- bundle exec jekyll serve \
  --disable-disk-cache --destination "$site_dir"
```

Visit http://localhost:4000 and stop the server with Ctrl-C. Remove only your temporary output directories when finished.

### Focused behavioral tests

The Einstein Field Lab checks use Node's built-in test runner, verified with Node **26.3.1**. No JavaScript dependency installation is needed:

```sh
node --test \
  --test-name-pattern='the laser maps distinguish|BFCache pagehide|the Kruskal map preserves|the uncompactified|the pre-animation coordinate|coordinate-map values|the later coordinate|the pure model' \
  experiments/einstein-field-lab/test/lab.test.cjs
```

This selects eight tests covering physics relationships and a source-based BFCache cleanup contract. It excludes standalone copy/markup assertions and the generated `_site/` test copy. It does not exercise browser interactions or the other experiments. No lint command is configured in this repository.

## Publishing

GitHub Pages is configured to build from the root of `main` (`main:/`) and publish to https://blog.leonardopereira.com/. Submit source changes through a pull request; once they reach `main`, Pages rebuilds the site. Committing a local build is not the publishing mechanism. `_site/` remains tracked, but Pages generates its own output from source rather than serving that checked-in directory verbatim.

Local and production builds currently use different Jekyll versions. The successful September 20, 2026 Pages build used **github-pages v232 / Jekyll 3.10.0** and warned that it could not satisfy the Gemfile. A successful local Jekyll 4.4.1 build therefore does not prove production parity. This setup does not change the Pages engine or settings.

Publishing configuration and build evidence were checked on November 1, 2026:

- Pages API: https://api.github.com/repos/dantetekanem/dantetekanem.github.io/pages (repository access may be required).
- Successful build log: https://github.com/dantetekanem/dantetekanem.github.io/actions/runs/35523598230

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

Or use the post command:

```
mise exec ruby@4.0.5 -- bundle exec jekyll post "Title Of The Post"
```

## License

This project is open source and available under the [MIT License](LICENSE). 