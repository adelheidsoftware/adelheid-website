---
title: "Adelkrieg Dev Blog: A Backend Architecture Deep Dive"
pubDate: 2026-02-28T22:00:00.000-05:00
summary: "A look at the engine powering Adelkrieg, from handling concurrent lobbies and social features to our modular, event-driven game core."
author: 'Aaron Yoder'
authorTitle: ''
tags: ['gamedev', 'development', 'adelkrieg', 'backend']
---

# Adelkrieg's Backend Architecture

The backend is at the heart of what makes Adelkrieg work. Over the past year and a half, and especially the past few months, we've been heavily focused on building out the backend architecture for Adelkrieg. A lot of the work hasn't been visually flashy, but it forms the critical infrastructure required to handle multiplayer game sessions, social features, and a scalable game core.

Rather than rushing to get something out right away, we took our time to build a solid foundation that we can rely on as we continue to develop the game. For anyone familiar with the previous iteration played via Discord, you'll know that it was a bit of a mess, and more than once we lost user data. For Adelkrieg, that is completely unacceptable, and we want to do right by our community, even if it means taking a little extra time up front.

To that end, we've carefully separated our backend into distinct modules and services. Today we're going to dive into how these systems are structured, without getting *too* bogged down in the code, and explore why we built things the way we did.

## The Lobby System

When a player wants to host or join a game, they interact with our lobby system. We decided to split this into several distinct services, each handling a specific part of the lobby feature-set:

- **Lifecycle Management**: Lobbies follow a state progression of Pre-Game -> Play <-> Pause -> Pre-Game, with the ability to also close the lobby at any time. We've also implemented safety net features like auto-close and auto-pause behaviors based on active connections. This ensures that lobbies always minimize backend resource usage based on their current state.
- **Membership & Concurrency**: We've built out a robust lobby system that supports regular members, spectators, lobby invites, and a live chat system.
- **Computer Player Integration**: The computer player service manages adding and removing computer players. Computer player personas of varying difficulty levels can be dynamically dropped into an open lobby. We'll dive deeper on computer players in a later blog post.

## Social and Friend Systems

First, to answer the question of "Why does Adelkrieg need a friend system?", we wanted to ensure that we could support the community's desire to socialize and form groups, which is something that happened naturally on Discord. We wanted you to be able to easily invite your friends to a game, or just chat with them while you play, without having to leave and go somewhere else. In our opinion, the social foundation of Adelkrieg is just as important as the game itself.

To support this, we needed a robust system to handle friend requests, blocking, and visibility. We also highly value your privacy, and want to give you control over who can see your profile. Your profile will be visible to everyone by default, but we offer controls that allow you to restrict what's visible on your profile to others, such as restricting it to friends-only, friends-of-friends, or just you. We will be adding more privacy controls during the early access period, such as the ability to restrict who can send you invites, and who can join your lobbies.

## Supporter Perks

To help support the game's infrastructure costs, we have a service that handles **Supporter Perks**. By default, an account is capped at 50 friends and can be in up to 3 lobbies concurrently, with a cap of 50 spectators per lobby, among other similar limitations. For Supporters, the backend automatically scales these limits up, allowing for 200 friends, 10 concurrent lobbies, and 100-player spectator limits. It also unlocks the ability to change your username, complete with a 60-day reservation on the old name to prevent anyone else from sniping it. All Supporter perks will be revealed when the Early Access releases.

We will never add Supporter perks that offer unfair gameplay advantages. Supporter Perks are primarily convenience and cosmetic features.

## The Core Game Engine

The most interesting architectural decision we made was how we built the core game engine. Strategy games are notoriously complex, with dozens of overlapping rules. Instead of building a tangled web of game objects that mutate each other's state, we built the core around a **Pure Logic Processor**, **Event Sourcing**, and **Event Cascading**.

### The Immutable Game State

What is event sourcing? Our game's state is entirely immutable, meaning it cannot be changed once created. Whenever a player engages in combat, a territory changes hands, or an alliance is formed, the game emits events that are used to create new state from the existing state, thus updating the game.

For example, if a player attacks a territory, the game emits an `AttackEvent`, which itself may emit a `TerritoryConqueredEvent` if the attack is successful. The game then applies these events to the current state to generate an updated game state.

Why is this useful? Because instead of storing saves, we can store all of the events that occurred in a game and simply replay them to get the latest state. Of course, we take snapshots at regular intervals to ensure that games start up quickly after being idle, but this architecture allows us to natively support features like replays.

### General Structure

The architecture of Adelkrieg's core gameplay experience is constructed of modules, generally split into standalone features: `CoreModule`, `AllianceModule`, etc. Modules define the overall structure and rules for a given feature.

Each module contains three major aspects:
* Policies
* Strategies
* Cascade handlers

Not all modules implement all three, but they exist for specific purposes.

**Policies** define how game commands should be interpreted. For example, if an AttackCommand is sent, do we want to use a simple dice roll to simulate the attack? What if we want to modify the attack based on some game state? What if we want players to be able to choose different attack implementations? This is what an `AttackPolicy` handles. There could be any number of `AttackPolicy` implementations, chosen at game creation or based on a particular mode or feature-set, and they can be swapped out without requiring any changes to any other code.

**Strategies** are custom behavior components. Think of them as policies that aren't associated with specific commands. For example, maybe we want to be able to choose what happens if a player loses a capital territory (if they have the Capitals module enabled), without having to lock players in to one behavior. We want these behaviors to be swappable just like policies are.

**Cascade handlers** allow us to dynamically inject events into the event stream, typically in response to a particular event, in order to add new functionality. For example, for the capitals feature, instead of modifying the core `TerritoryConqueredEvent` to handle capitals, we instead define a cascade handler in the `CapitalsModule` that listens for `TerritoryConqueredEvent` and injects `CapitalLostEvent` when needed. This allows us to add new features without modifying the core game flow whatsoever.

#### Module State

Along with the global game state, each module is allowed to add state for specific features. For example, we need extra state to handle storing data for capitals. This state lives in the `CapitalsModule`, and is added dynamically to the core game state on game creation.

### The Pure Logic Processor

At the end of the day, everything boils down to a stream of events that need to be processed to modify game state.

In order to apply the events to the current state, we use a **Pure Logic Processor**. You can think of it as a black box referee. It has no memory and connects to no databases. This processor takes the current state and a list of events and returns new state. It is a pure function, meaning it has no side effects and always returns the same output for the same input.

This architecture allows us to give you the power to create your own modes by granularity enabling or disabling game features. It also gives us the ability to add new features to the game without having to worry about breaking existing feature modules.

### Event Sourcing Benefits

- **Perfect Crash Recovery**: If a server node completely crashes, we don't lose any game data. A new node can simply load the initial blank map and fast-forward through the saved list of game events. Within milliseconds, it rebuilds the exact state the game was in right before the crash, and players can resume seamlessly.
- **Post-Game Replays**: Because we have a historical ledger of every single action that occurred, we can build end-of-game timelapses. Players will eventually be able to watch a fast-forwarded replay of the entire world map shifting colors and borders over the course of the match.
- **Client Synchronization**: We don't need to send the entire massive game to everyone's browser 60 times a second. We just send the small events ("Player red attacked territory 5 and won"), and the players' browsers compute the exact same logic as the server to stay perfectly in sync.

***

## Early Access Roadmap

So, given all of this, what's left to do before Early Access? The back-end is pretty much feature-complete. Most of the work left is with the front-end website. Here's a list:

* Integrate the full lobby flow into the front-end
* Integrate the full game flow into the front-end
* Integrate the map browsing experience into the front-end
* Improve profile customizability on the front-end (avatars, profile banners)
* Integrate moderation/admin tooling into the front-end

There are a few other things that may come before Early Access, but may be pushed until later in Early Access:
* Integrate the map submission system into the front-end
* In-browser map editor
* Map, lobby, and user search
* Leaderboards and ranks (using OpenSkill)

While we don't yet have a specific date for Early Access release, we can assure you that it's going to release in **2026**! The website will initially be invite-only, with existing members able to generate and send out invites to their friends. We will eventually open it up to everyone and remove the invite system, but we believe an Early Access invite system is the healthiest way to grow the game while remaining sustainable.

Thanks for reading!