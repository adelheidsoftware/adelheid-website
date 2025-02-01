---
title: "Development Changes & Postbound! Update Delay"
pubDate: 2025-02-01T15:15:00.000-05:00
summary: "We talk about where we've been, where we're at, and where we're headed."
author: 'Aaron Yoder'
authorTitle: ''
tags: ['gamedev', 'development']
---

In this blog post, we talk about where we've been, where we're at, and what's coming up next.

## Postbound!'s Next Update

Some of you may have noticed that we've been quiet for a while. You also may have noticed that we've promised Postbound!'s next update is coming soon. Where is it, then? When is it coming? Let's talk about that.

Since Postbound!'s release, we've been working on several different projects, some public, and some still private. While working on Postbound! post-release, we noticed that GDScript simply wasn't going to cut it going forward. GDScript is really nice for smaller games, but it quickly becomes untenable if you have more complex requirements.

### The Problem With GDScript

Even for a small game like Postbound!, we noticed that we would benefit greatly from a more mature language. While working on Postbound!'s next update, we were often working against GDScript and against our existing code to implement new features or fix bugs. GDScript lacks access modifiers, interfaces, abstract classes, structs, rigorous static typing, and explicit overridable methods. Lacking these features makes development much more difficult and slow as you add more to your game.

Certain things, such as lack of explicit overrides, access modifiers, and rigorous static typing are not complete deal-breakers when it comes to language features. You can still override functions, you just have to know what you're overriding. Every function is public, but you can come up with a system, such as prefixing private methods with `p_`, to avoid calling private functions outside of the class. While Godot does not have rigorous static typing, it is gradually typed and supports optional static typing pretty much everywhere except for a few edge-cases; you can enforce static typing in the editor and not really know the difference.

However, despite these not being dealbreakers, they still cause issues during development that simply don't exist in other languages. For example, despite the editor supporting the enforcement of static typing, the type hints are frequently inadequate, and Godot's built-in editor has terrible intellisense and autocompletion. When you couple all of that with the other missing language features already mentioned, the only conclusion is that we have to switch languages.

Good news, though! Godot has incredibly robust support for other languages thanks to its module system and GDExtension!

Let's explore our options.

## Language Considerations

We have a personal preference for C-family programming languages due to our background in Java. However, we wanted to avoid languages that require you to manage your own memory. We want to focus on development, and we can always re-implement small portions of code for better performance if absolutely necessary. We also want to use a mature and well-supported language that has a bright future.

We fairly quickly narrowed down the list of contenders:
* C#
* Java
* Kotlin
* Rust

In no particular order, of course!

Let's see how each of the options compares in a table.

**Legend**:<br>
✅ - Supports<br>
☑️ - Partially Supports<br>
🕐 - Coming Soon<br>
❌ - Doesn't Support<br>
📢 - Actively Discussed<br>
🧪 - Experimental

| Feature | GDScript | C# | Java | Kotlin | Rust
| :- | :-: | :-: | :-: | :-: | :-:
| Explicit Override | ❌ | ✅ | ✅ | ✅ | ❌
| Access Modifiers | ❌ | ✅ | ✅ | ✅ | ✅
| Static Typing | ☑️ | ✅ | ✅ | ✅ | ✅
| Value Types | ❌<sup>1</sup> | ✅ | 🕐 | ☑️ | ✅
| Abstract Classes | ❌ | ✅ | ✅ | ✅ | ❌
| Interfaces | 📢<sup>2</sup> | ✅ | ✅ | ✅ | ❌
| Traits | 📢<sup>2</sup> | ❌ | ❌ | ❌ | ✅
| Web Exports<sup>3</sup> | ✅ | 🕐 | 🕐 | 🕐 | 🧪

<sup>1</sup> <small>GDScript has some built-in value types, but doesn't support the creation of your own value types.</small><br>
<sup>2</sup> <small>GDScript would likely only add either interfaces or traits, or some combined structure, not both. At least, based on current disussion.</small><br>
<sup>3</sup> <small>We personally don't really care about web exports all that much, but it's worth listing anyway.</small>

There are other features to consider as well, such as string interpolation, generic types, lambda expressions, deconstructors, and more, but that would make the table a bit messier and those features aren't quite as important as the ones in the table for us right now. They will still be considered, however!

## So What Language Do We Pick?

If we [take a look at some data](https://survey.stackoverflow.co/2024/technology#most-popular-technologies-language-prof), we can see that there's not all that many Rust programmers, and the ones that are out there probably aren't all that invested in game development. Java and C#, on the other hand, are much more similar in their userbases, with the JVM world taking the lead.

It seems unnecessary to shoot ourselves in the foot by making it difficult to bring people on, so we can pretty quickly rule out Rust here. While we love the language, it also doesn't suit our requirements very well, and we don't want to become a Rust shop. More than that, we don't think it has the chutzpah to go the distance in the game development world.

Nevertheless, if you're personally interested in Rust for game development, check out [godot-rust](https://godot-rust.github.io/) and [Bevy](https://bevyengine.org/)!

That leaves us with C# and Java/Kotlin, which we'll refer to as 'JVM languages' at this point since they come as a pair!

### C# vs. JVM Languages

#### Equivalencies
* C# and JVM Languages have similar enough syntax and language features, with the medium-term outlook putting them on fairly equal ground.
* Switching between the JVM languages and C# would be fairly easy, given how similar they are.

#### Pro-C#
* C# is effectively a first-party language, and it gets bundled with releases at the same time as the main Godot build.
  * With C# going the GDExtension route at around the same time as Godot-Kotlin, this benefit is mostly minimized.
* C# has mildly better integration with the engine and external editors.
* C# has a much larger game development community.
* Console releases would have fewer roadblocks using C#.

#### Pro-JVM
* We personally feel, for a variety of reasons, that the JVM has a much brighter future than C#, even for game development: better language planning, developing the spec out in the open, governed by a consortium of companies + the community, etc. C# is, by and large, controlled by Microsoft, despite looking very open on the surface.
* Java and Kotlin can be used together in the same codebase.
* The JVM community is much larger overall and has far more third party libraries.
* The JVM runtime is more mature than the .NET Runtime, though performance is roughly equivalent. The JVM [seems to come out a bit ahead of C#](https://www.youtube.com/watch?v=c9gRhi-Aucw) in Godot specifically, though.

### And The Winner Is...

We've decided to rewrite Postbound! in C# using Godot 4.4. However, we will circle back and explore using Godot-Kotlin for future projects once they complete the GDExtension version. Until then, we'll continue doing game development in C#.

What does this mean for [gdscript-utilities](/blog/sharing-our-code-gdscript-utilities)? We will change the repository to godot-utilities and offer C#, and potentially Java/Kotlin, scripts in the repository, free to use for any purpose.

## Timeline & Conclusion

So, what does this mean? When's the Postbound! update coming out? We don't have an exact timeline here, unfortunately. We would like it to be as soon as possible, but life events and other important tasks are keeping us quite busy right now. Rewriting Postbound! in C# should be a fairly quick process, and then adding the additional features and content we'd like to add on top of that should be a fairly speedy process as well.

Ultimately, we want Postbound!'s next update to be stable and high quality, so we're going to take the time that's necessary to get it done right. We'll keep you updated on [Bluesky](https://bsky.app/profile/adelheid.org), so if you're keen to know the latest about what we're up to, follow us on there.

Thanks for reading!