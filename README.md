# Rummykruss Rule Book

## Overview
Rummykruss is a Rummikub-inspired game played on a crossword-style 2D grid. Players create valid sets and runs, scoring points for intersections. The game has two phases: a **Setup Phase** for drafting tiles and a **Gameplay Phase** for placing them. Players can lock blocks at the end of their turns, adding a layer of strategy.

## Components
- **Tiles**: Numbered tiles (1-N) in multiple colors (1-C).
- **Wildcards**: Default 2, can replace any tile.
- **Game Grid**: Default size 15x15, includes **X random blocks** that cannot be placed on.

## Objective
Score the most points by forming valid sets and runs while maximizing intersections. Use block-locking strategically to limit your opponent's options.

## Key Terms
- **Set**: 3–C tiles of the same number, different colors.
(1 block of space is needed between sets with the exception of intersections)
- **Run**: 3–N consecutive numbers, same color.
- **Intersections**: A tile contributes to multiple sets, 
- **Locked Blocks**: Grid cells marked as unusable by players at the end of their turns.

## Hyperparameters
- **Number Range**:   Default 1–13.
- **Colors**:         Default 4.
- **Grid Size**:      Default 15x15.
- **Blocked Tiles**:  Default 10
- **Rack Capacity**:  Default 14 tiles.
- **Wildcard Count**: Default 2.
- **Locks Per Turn**: Default 3 block per turn (0 before having 6 on board)
- **Moves Per Turn**: Default inf

## Game Phases

### 1. Setup Phase
- Players alternate drafting tiles from a shuffled pool until racks are full (default: 14 tiles).
- Wildcards are included in the draft.

### 2. Gameplay Phase
Players place tiles on the grid to score points.

#### Turn Steps
1. **Draw(optional)**: draw 1 tile and loose 1 pt
2. **Place\Move**: 
   Move and Place 1 or more tiles, as long as the end result contains only valid set, and the tile placed may not be in multiple sets with the exception for intersections
3. **Score**:
   Score of round $n$, with $i_n$ intersection, while $I$ is the previous largest amount of intersection:
   $$1 + (\sqrt{i_n}-1\quad  if\quad   i_n > I \quad  else\quad 0) $$
     <!--  -->
   
4. **Lock Blocks**:  At the end of their turn, a player can lock **L blocks** on the grid. Locked blocks cannot be moved in next 2 turns, but still partispate in the set and scoring.  

## Endgame
- Game ends when no moves remain and the tile pool is empty (or after a fixed number of turns).
- **Winner**: Player with the highest score. Ties resolved by most intersections.
