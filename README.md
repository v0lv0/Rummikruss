## Overview
Rummikruss is a strategic board game where players strategically place cards from different suites to create connected patterns. The goal is to maximize your score by forming sets while strategically blocking your opponent's moves.

## Setup
- Decide hyper-parameter
   + b := board size (5-20 squares)
   + n := number of suits (1-8)
   + c := largest number in the deck(5-16)
- A deck with 2(n*c) will be created (2 of every number suit match)
- Few randomly selected card will randomly placed on the board
## Game Rules

### Basic Placement Rules
1. Players alternate turns placing cards on empty board cells
2. Card placement must create a valid set:
   - Ascending sequence (e.g., 1-2-3 in same suite)
   - Descending sequence (e.g., 3-2-1 in same suite)
   - Repeated number in different suites

3. Placement Restrictions:
   - Cards can only be placed in empty cells
   - Must connect to form a valid set
   - Recent card placements temporarily block similar cards

### Scoring Mechanics
- Points earned based on card connections
- Connecting multiple sets multiplies scoring potential
- Bonus points for bridging different sets

### Scoring Examples
| Scenario | Placement | Points Earned |
|----------|-----------|---------------|
| ![alt text](image.png) | Yellow 2 | 3 points (3 connected '2's) |
| ![alt text](image-1.png) | Blue 6 | 6 points (connecting blue, red, yellow cards) |

### Winning the Game
- Game ends when:
  - All cards are played
  - No valid moves remain
- Highest total score wins

## Strategic Tips
- Look for multi-directional connections
- Create opportunities for large set formations
- Block opponent's potential high-scoring moves