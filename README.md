## Overview
In Rummikruss,  players place cards  of different colors to create
connected patterns. The goal is to maximize your score by forming sets
while blocking your opponent's moves.

## Setup
- Decide hyper-parameter
   + b := board size (5-20 squares)
   + n := number of colors (1-8)
   + c := largest number in the deck (5-16)
   + r := number of repetitions of cards with the same color.
A few randomly selected cards will be placed on the board.

## Game Rules

### Basic Placement Rules
1. Players alternate turns placing cards on empty board cells.
2. Card placement must create a valid set:
   - Ascending or descending sequence (e.g. with the same color).
   - Repeated number in different colors (e.g. blue 4, red 4, yellow 4).

3. Placement Restrictions:
   - Cards can only be placed in empty cells.
   - Must connect to form a valid set.
   - Last played card blocks all cards of the same color and all cards of the same number for the next player.

### Scoring Mechanics
- The score is updated as the length of the largest sequence made by the newly added card (see example 1 below).
- If the placed card connects two disconnected blocks the new score is the total number of connected cards containing the placed card (see example 2 below).

### Scoring Examples
| Scenario | Placement | Points Earned |
|----------|-----------|---------------|
| ![alt text](image.png) | Yellow 2 | 3 points (3 connected '2's) |
| ![alt text](image-1.png) | Blue 6 | 6 points (connecting blue, red, yellow cards) |

### Winning the Game
- Game ends when:
   - All cards are played or,
   - no valid moves remain.
- Highest total score wins.
