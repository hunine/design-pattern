# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

A hands-on learning repository for all 23 GoF design patterns implemented in **TypeScript**. Every pattern has a `raw/` version (dirty code that motivates the pattern) and a `solution/` the learner implements themselves.

## Tech Stack

- **Language**: TypeScript 5
- **Runtime**: Node.js 18+
- **Package manager**: npm
- **Build**: `tsc` (TypeScript compiler)
- **Test runner**: Jest with `ts-jest`

## Project Structure

```
src/
  creational/           # Singleton, Factory Method, Abstract Factory, Builder, Prototype
  structural/           # Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy
  behavioral/           # Chain of Responsibility, Command, Iterator, Mediator, Memento,
                        # Observer, State, Strategy, Template Method, Visitor, Interpreter

Each pattern/
  README.md             # intent, structure, when to use, pros/cons, code walkthrough
  raw/
    index.ts            # dirty code showing the problem the pattern solves
  solution/             # created by /new-solution skill
    index.ts            # learner's implementation
    index.test.ts       # Jest tests

.claude/
  skills/
    new-solution/       # scaffolds solution/index.ts + tests for a given pattern
    review-pattern/     # reviews solution/index.ts against GoF structure and best practices
```

## Commands

```bash
npm install                                     # install dependencies
npm run build                                   # compile TypeScript
npm test                                        # run all tests
npm test -- --testPathPattern=factory-method    # run tests for a specific pattern
```

## Skills

This project has two Claude Code skills. Both can be triggered with a slash command **or** plain natural language.

### new-solution

Scaffolds `solution/index.ts` and `solution/index.test.ts` for a given pattern with typed GoF participant stubs and `// TODO:` markers.

```
/new-solution factory-method
```
Natural language equivalents: _"create a solution for factory method"_, _"scaffold the observer pattern"_, _"I want to implement singleton"_

### review-pattern

Reviews `solution/index.ts` across 8 dimensions: intent check, GoF structure compliance, TypeScript best practices, pattern-specific pitfalls, raw vs solution diff, SOLID principles, test coverage, and a verdict with actionable suggestions.

```
/review-pattern factory-method
```
Natural language equivalents: _"review my factory method solution"_, _"check my observer implementation"_, _"give me feedback on singleton"_

## Learning Workflow

```
1. Read      →  open src/{category}/{pattern}/README.md
2. Study     →  read raw/index.ts to understand the problem
3. Scaffold  →  /new-solution <pattern>  (or ask in plain English)
4. Implement →  fill in every TODO in solution/index.ts
5. Test      →  npm test -- --testPathPattern=<pattern>
6. Review    →  /review-pattern <pattern>  (or ask in plain English)
```

## Conventions

- Every pattern's `solution/index.ts` must compile with `strict: true` — no `any`, explicit return types on all public methods.
- Product roles use `interface`; Creator/base roles with shared logic use `abstract class`.
- Tests verify behavior (what the pattern guarantees), not implementation details (which class was instantiated).
- Do not implement the solution inside the `raw/` folder — that code is intentionally left broken as a reference.
