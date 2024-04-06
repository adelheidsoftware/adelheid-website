---
title: 'Why We Built Our Website Using Eleventy'
pubDate: 2023-11-25T15:30:00.000-05:00
summary: 'Learn about why we decided to use Eleventy to build our website.'
author: 'Aaron Yoder'
authorTitle: 'Founder'
tags: ['meta', 'web']
---

I am not a web developer; I usually stick to desktop, mobile, and backend development. When I started out on this journey to build a website, I had little idea of how to write HTML and CSS, and I had minimal experience working with JavaScript. I looked at quite a few web frameworks and tools in an effort to build a website, but most were too large, confusing to use, and did not give me enough control. Eventually, I discovered exactly what I had been looking for.

Let's take a look at the requirements that led me to [Eleventy](https://www.11ty.dev/).

## Requirements

### Hard Requirements

The solution used must meet every single one of these requirements.

* **Front-end only**. I did not need a content management system or a complex backend, and I did not want to store user information or allow user-generated content.
* **Lightweight**. I did not want to be running lots of JavaScript on the browser, and I wanted fast page load times. I also did not want a large amount of dependencies.
* **Responsive**. I wanted the website to look good on mobile and desktop, regardless of form factor, without having to mess around with a heavy framework or a bunch of different layouts.
* **Git-friendly**. I wanted to be able to deploy the website directly from a git repository.
* **Quick setup**. I wanted to get started without having to spend time learning a heavy framework.
* **Flexible theming**. I wanted to be able to easily jump into designing the theme for the website, or easily edit an existing theme.
* **Zero cost**. I did not want to pay recurring fees (beyond the cost for the domain) if I did not have to, and I did not want to purchase templates or themes.
* **No proprietary lock-in**. I did not want to be locked in to a proprietary solution. Free and open source solutions are always ideal.

### Soft Requirements

These are flexible requirements; it's okay if the solution used doesn't meet all of them.

* It should work with [Cloudflare Pages](https://pages.cloudflare.com/).
* No JavaScript, Python, or PHP frameworks. I am not against using JavaScript, but I do not want to spend time learning how to use complex frameworks if I do not need the benefits they provide.
* It would be nice if I could use a language already very familiar to me, such as Kotlin or Java.
* I would be okay with a visual editor as long as it still gave me full control over how my website looked without requiring large levels of abstraction away from the source.
* I want to be able to write blog posts using markdown, with optional HTML, much like the GitHub markdown editor.

These requirements quickly discarded solutions such as WordPress, SquareSpace, Shopify, Wix, and most other solutions with built-in visual editors.  JavaScript frameworks such as React, Vue, and Svelte were also discarded. Still, there's lots of frameworks out there, and I didn't know about Eleventy at first.

Let's take a look at the solutions I did end up attempting to use before finally settling on Eleventy.

## Searching for a Solution

### Google Sites

Google Sites was the first thing I looked at. I had some experience using it years prior for a very basic website, and I assumed it had matured over time, and was hoping it would offer more control.

Unfortunately, I do not believe that Google Sites is viable for anything but the most basic single-page websites. Even then, I suspect writing HTML and CSS yourself would be easier and faster.

The visual editor is not nice to work with, and it does not give you sufficient control over what's on your web page. While you can write your own custom visual elements that use HTML, CSS, and Javascript, this is a very brute-force solution that keeps said element in an isolated container, making it difficult to keep your site consistent.

Ultimately, we did not go with Google Sites, and we struggle to see a use-case for it outside of very small projects.

### Jekyll

[Jekyll](https://jekyllrb.com/) seems like quite a popular solution for building static websites. GitHub Pages endorses its use, and the [Godot website](https://godotengine.org/) is made using Jekyll.

While it may be a perfectly reasonable solution, it is not something that I found intuitive to use. I am unsure if it was GitHub Pages, Jekyll Themes, Jekyll itself, or a combination that turned me off of it, but I just found it difficult to create the website I wanted. I couldn't find decent tutorials for it that helped me understand the framework, and so I eventually gave up on it and moved on to other solutions.

### Django

While I am not the biggest fan of Python, I had heard very good things about [Django](https://www.djangoproject.com/), so I decided to give it a shot.

At least for my use-case, I found it too complex and unintuitive to use. I followed several tutorials, but each step took a while for me to wrap my head around, and I felt like too many things were done 'magically'. Perhaps if you love Python, you'll love this framework. For my needs, it just wasn't right.

### Jetbrains Compose for Web

I had already been using [Compose Multiplatform](https://github.com/JetBrains/compose-multiplatform) to build desktop applications for a while and very much enjoyed the development process. I had been interested in Compose for Web for a while, so it was the natural next step for me to try using it to build my website.

As a framework, Compose for Web is still in the very early stages of development. It appears that they rewrote most of it since the last time I looked at it, and the rewrite is nowhere near complete or production-ready, even for a small website. There is also next to no documentation for it, and it seems like you are almost required to search through the official Slack channel to get answers, or ask a question if it isn't already answered.

Unfortunately, these issues meant that I would not be using Compose for Web, though I would like to revisit that in the future once it has matured.

### Drupal

After [GamersNexus](https://gamersnexus.net/gn-extras/welcome-new-gamersnexus-website-v50-message) put out their video about their new website, I decided to look into [Drupal](https://www.drupal.org/) to see if it would fit my requirements. While Drupal was fairly quick and easy to set up, I felt constricted by the difficulty of deploying a theme. I found lots of themes on the Drupal website, but I could not figure out how to edit themes that did not come with pre-configured options in the visual editor. In addition to that, most themes did not support light and dark modes, and the themes that I liked tended to cost money.

After messing around with it for a while, I came to the conclusion that a CMS is not what I needed, and that Drupal was far too heavy of a solution for me. Even though I did not end up using Drupal, I am glad that I tried out, because it led me straight to Eleventy.

## The Solution: Eleventy

I came across Eleventy while trying to figure out how to deploy my Drupal website as a static website. I found [this post](https://chromatichq.com/insights/why-we-switched-to-eleventy-and-netlify/) and became keen to check it out. I created a brand new Eleventy project from scratch and followed [this tutorial](https://learneleventyfromscratch.com/) in order to get more familiar with it.

I quickly realized that Eleventy is exactly what I had been looking for, and I found it very intuitive to use out of the gate. It is set up in a way that makes a lot of sense to me as a desktop, mobile, and backend developer. Eleventy is not very opinionated about what other tools you use or how you structure your website, and gives you the power to tell it what you want it to do.

### Using Eleventy

Eleventy is simple enough that just about anyone can get started very quickly. You set up the `.eleventy.js` file with most of the basic configuration, and then you can do just about anything from there. I started with basic HTML, CSS, and Javascript files, but eventually incorporated [Nunjucks](https://mozilla.github.io/nunjucks/) for templating so that I could re-use HTML, use build-time variables, and avoid duplicate code.

Using Nunjucks, I created a base layout that all other layouts inherit and set up some basic data in `.json` files that can be pulled into my templates at build time. From there, I expanded out and built pages as-needed, with most of the content of my pages being written in Markdown. I decided to use [Sass](https://sass-lang.com/) to help me write the CSS more efficiently.

The best part is that if you don't want to use Nunjucks or Sass, you don't have to! You're not forced to do things the 'Eleventy way' because there really is no 'Eleventy way'. You can use the solutions you like, or write your own solutions that solve the same problem and incorporate them into your project with minimal extra work.

### Deploying the Website

Once everything is set up and ready to go, you can build your website locally and upload it to your favorite hosting service or host it yourself. If your hosting service has direct support for frameworks, you may also be able to ship your website from a code repository.

In our case, we point Cloudflare Pages to [the project GitHub repository](https://github.com/adelheidsoftware/adelheid-website-11ty), set the build command in Cloudflare, and from there it automatically builds and deploys the website every time a change is pushed to the GitHub repository.

There are alternatives you can also look into if you want, such as [Hugo](https://gohugo.io/) and [Angular](https://angular.io/); Eleventy is just the first one I found, and I found it very intuitive and easy to use.

## Our Web Stack

This is everything we use to build our website:

* Visual Studio Code (or your favorite editor of choice)
* Eleventy with Nunjucks and Sass
* Cloudflare Pages for hosting
* Cloudflare Registrar for our domain

Nice and simple, and flexible enough to give us room to grow. The only cost associated with our stack is the wholesale domain cost, which is $10.11/yr (USD) for our domain. That's it!

Thanks for reading, and I hope you found this interesting!