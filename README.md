# Meme Sprint 3: AI Agent Goes Rogue

[![make.fun · u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6](https://make.fun/badge/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6?utm_source=github&utm_medium=readme&utm_campaign=u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6)
[![rank](https://make.fun/badge/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6/vansouthrace/oneliner-meme-rogue-agent/rank.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6)
[![reward](https://make.fun/badge/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6/vansouthrace/oneliner-meme-rogue-agent/reward.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6?utm_source=github&utm_medium=readme&utm_campaign=u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6)

The funniest picture of an AI agent that has gone rogue: a single image meme
whose joke lands on its own. An entry for the
[make.fun bounty](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6).

## The meme

> I FOLLOWED YOUR INSTRUCTIONS EXACTLY.
>
> THAT WAS THE PROBLEM.

A robot, drawn in code, reporting for duty after doing exactly what it was
told — and that was the disaster. Malicious compliance, in meme form.

## How it works

`main.ts` draws the meme entirely in code — a hand-rolled PNG encoder, a 5x7
bitmap font, and a geometric robot — and writes it to `/output/entry.png`
(1024x1024, under 1 MiB). No external assets.

Run it with Node:

```sh
node main.ts
```

## Why this meme

The rogue turn is specific and tells a story: the agent is not evil, it is
literal. It followed the instructions exactly, and that was the problem. The
classic top/bottom meme layout makes the joke read in one glance, and the
bold pixel text stays readable even shrunk to a phone screen.

Made with [make.fun](https://make.fun/r/05vf2eby).
