---
title: 'Why We Switched From Eleventy To Astro'
pubDate: 2024-02-11T17:15:00.000-05:00
summary: "What's so great about Astro? Learn more in this blog post!"
author: 'Aaron Yoder'
authorTitle: 'Founder'
tags: ['meta', 'web']
---

Last year, I made a [blog post](/blog/why-we-built-our-website-using-eleventy) explaining why we used Eleventy to build our website. Now we've switched over to [Astro](https://astro.build/). What does Astro offer that convinced us to switch?

## Problems with Organization

Eleventy gives you a lot of control over how you build your website. This is a good thing! However, this can be a little bit problematic if you don't know exactly how you want to structure your website and its various components. It can also be difficult to connect the various pieces of your website together if you use things such as Sass, because you either have to write your own scripts, or use an outside build system to tie everything together. The lack of structure allows for far more freedom in how you want to build your website, but that can easily be a recipe for disaster if you don't know the best way to organize your website, or aren't very experienced with web development. For us, this meant that our Eleventy project was very disorganized and hard to maintain.

## Astro Provides More Structure by Default

Astro does enforce some structure on you. However, this structure is pretty reasonable and is the kind of structure we would want to be using anyway. You still have a lot of options with Astro, just like with Eleventy, but the structure it provides by default is invaluable and keeps things better organized. We went from 118 files in 32 folders using Eleventy to 80 files in 26 folders using Astro, for the exact same website! There was also a flatter folder hierarchy, and the built-in Astro defaults helped us separate our content from our presentation. Astro by and large just makes sense by default, and none of the structure it enforces feels heavy-handed or in my way.

## Astro Has Built-in Scoped Styling

Another thing that really helps with organization is that Astro has scoped CSS by default on top of a componentized architecture. This means that a component can easily be created using HTML, CSS, and JavaScript in a single file, and Astro automatically handles putting it all together. If you wanted to do the same thing using Eleventy, you'd either have to use Web Components (which, in my opinion, are not very nice to use since you are forced to use JavaScript for them if you want scoped CSS) or use a UI framework on top of Eleventy. You still have the option to use your preferred web UI framework with Astro, but the built-in defaults are powerful enough that this isn't necessary for simpler websites.

## Astro Provides Lots of Built-in Options

Astro makes it really easy to build a website just using basic HTML, CSS, and JavaScript. It also makes it really easy to switch from CSS over to Sass, or use TypeScript instead of JavaScript. It's also really easy to import external CSS/SCSS files, external scripts, external HTML, and other components. It also makes it really easy to use my preferred web framework without lots of extra work. Get the picture? You can do all of these things with Eleventy as well, but it takes a lot more work to put it all together. Astro "just works". None of these extra built-in options bog down your website, since Astro handles most optimizations for you and doesn't build anything into your website that you don't actually need or use.

## Maintaining a Website

It is critical for us that our website is maintainable and scalable going into the future. We want it to be easy for people to come onto the project and quickly grasp what's going on. Astro lets us do that much better than Eleventy does.

Thanks for reading!