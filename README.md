# Rummykruss Rule Book

## Overview
Rummykruss is a Rummikub-inspired game played on a crossword-style 2D grid. Players create valid sets and runs, scoring points for intersections. The game has two phases: a **Setup Phase** for drafting tiles and a **Gameplay Phase** for placing them.

## Components
- **Tiles**: Numbered tiles (1-N) in multiple colors (1-C).
- **Wildcards**: Default 2, can replace any tile.
- **Game Grid**: Default size 15x15, includes **X random blocks** that cannot be placed on.

## Objective
Score the most points by forming valid sets and runs while maximizing intersections. Use block-locking strategically to limit your opponent's options.

## Key Terms
- **Set**: 
   + 3+ consecutive numbers, same color.
   + 3+ tiles of the same number, different colors.
- **Intersections**: A tile contributes to multiple sets
<!-- 
## Hyperparameters
- **Number Range**:   Default 1–13.
- **Colors**:         Default 4.
- **Grid Size**:      Default 15x15.
- **Blocked Tiles**:  Default 10
- **Rack Capacity**:  Default 14 tiles.
- **Wildcard Count**: Default 2.
- **Moves Per Turn**: Default inf -->

## Game Phases

### 1. Setup Phase
- $s$ blocks will be randomly placed onto the map as a part of the map. They can not be moved
- Players alternate drafting tiles from a shuffled pool until racks are full (default: 14 tiles).
- Wildcards are included in the draft.

### 2. Gameplay Phase
Players place tiles on the grid to score points.

#### Turn option
1. **Draw**: draw 1 tile and loose 1 pt
2. **Place\Move**: 
   - Move and Place 1 or more tiles, as long as the end result contains only valid set
   - tile placed may not be in multiple sets with the exception for intersections.
   - The number used by the opponent last turn may not be used
   - If the number of intersection increased, gain 2 pts, else 1 
   
## Endgame
- Game ends when no moves remain and the tile pool is empty (or after a fixed number of turns).
- **Winner**: Player with the highest score. Ties resolved by most intersections.

<!-- ---------------------------------------------------------- -->
## Testing rules

+ Any set of blocks that connect in the board must obey the patterns [asc, dsc, rep, alone] of size at least 3

+ Can't place the same number as the opponent in the previous turn.

+ Can't place block connecting to the same blocks as the previous turn.

+ [Opt] Can't place block connecting to the same block placed by the opponent in the last turn. 

+ Score:  +1 if not connected, +2 if block connects

## Game engine define:
Get_Game_state() -> 
   Board state(mxm array with numbers)
   card state: k x [1,...,n]

User_input(row:int, col:int, suiteid:int, num:int) -> 
   void

Score(): -> 
   (int,int)