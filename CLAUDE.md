# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a learning repository for exploring all major software design patterns implemented in **TypeScript**. Patterns are organized by category (Creational, Structural, Behavioral) with runnable examples.

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Package manager**: npm
- **Build**: `tsc` (TypeScript compiler)
- **Test runner**: Jest with `ts-jest`

## Project Structure

```
src/
  creational/       # Factory, Abstract Factory, Builder, Prototype, Singleton
  structural/       # Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy
  behavioral/       # Chain of Responsibility, Command, Iterator, Mediator, Memento,
                    # Observer, State, Strategy, Template Method, Visitor, Interpreter
```

Each pattern lives in its own directory with:
- `index.ts` — implementation
- `index.test.ts` — Jest tests demonstrating usage

## Commands

```bash
npm install          # install dependencies
npm run build        # compile TypeScript
npm test             # run all tests
npm test -- --testPathPattern=singleton  # run tests for a specific pattern
```

## Design Pattern Categories

### Creational
Deal with object creation mechanisms.
- Singleton, Factory Method, Abstract Factory, Builder, Prototype

### Structural
Deal with object composition and relationships.
- Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy

### Behavioral
Deal with communication and responsibility between objects.
- Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor, Interpreter

## Getting Started

Update this file as the project evolves — add new patterns, update commands, and note anything non-obvious about the setup.
