---
title: "Sharing Our Code: GDScript Utilities"
pubDate: 2024-07-02T20:07:00.000-05:00
summary: 'We are releasing an open-source repository filled with algorithmic goodies!'
author: 'Aaron Yoder'
authorTitle: ''
tags: ['gamedev', 'algorithms', 'open source']
---

In the course of creating a game, there are various algorithms and utilities that you might come across and want to use. However, you won't always find good example code for these things, and sometimes there's no code at all! This is particularly true for GDScript. We want to help change that.

## GDScript Utilities

Here at Adelheid Software, we enjoy coming up with algorithms to implement in our games. This often requires reading research papers, looking at examples of how others solved a similar problem, or bouncing ideas off of the wall until something sticks. We also love open source, and are committed to giving back to the community.

That's why we have started a new GitHub repository: [GDScript Utilities](https://github.com/adelheidsoftware/gdscript-utilities).

This repository will be updated any time we create a new algorithm or code utility that we think others would find useful for their games or projects. All samples are in typed GDScript for maximum efficiency and understanding.

### Vose's Alias Method

The first algorithm we have submitted to the repository is Vose's Alias Method for sampling a discrete distribution. This is useful for generating random numbers that are weighted in some way, such as for drop tables, dialogue trees, NPC AI, and more. It is an incredibly efficient (at the time of this writing, the most efficient!) algorithm for weighted random sampling that is also very easy to use.

What are the benefits to this algorithm?
* Preprocessing cost: O(n)
* Sampling cost: O(1)

Note that the preprocessing cost is a one-time cost so long as your weights do not change. This means you can generate your random distribution at start-up and sample from it in constant time. Incredible!

Keith Schwarz has a [really interesting post](https://www.keithschwarz.com/darts-dice-coins/) that covers this algorithm, as well as most algorithms you'd come up with prior to stumbling upon this one. This implementation is based on that description.

## Future Contributions

We will continue to add to this repository as we create useful GDScript snippets. We also encourage you to contribute by creating a pull request!

Thanks for reading.