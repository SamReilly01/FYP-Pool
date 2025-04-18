/**
 * A service to manage the rules of pool
 * - Tracks player turns
 * - Enforces ball assignments (solids/stripes or reds/yellows)
 * - Handles fouls and game state
 */
class PoolRulesService {
    constructor() {
      // Game state
      this.isGameStarted = false;
      this.currentPlayer = 1; // Player 1 or 2
      this.playerBallGroups = {
        1: null, // Will be 'red' or 'yellow'
        2: null  // Will be the opposite of player 1
      };
      this.isBallGroupsAssigned = false;
      this.isBreakShot = true;
      this.lastPocketedBalls = [];
      this.fouls = {
        1: 0,
        2: 0
      };
      this.winner = null;
      this.gameLog = [];
      
      // Ball counts
      this.remainingBalls = {
        red: 7,
        yellow: 7,
        black: 1,
        white: 1
      };
    }
    
    /**
     * Initialise a new game
     * @param {Array} initialBalls - The initial ball positions
     */
    initGame(initialBalls) {
      this.isGameStarted = true;
      this.currentPlayer = 1;
      this.playerBallGroups = { 1: null, 2: null };
      this.isBallGroupsAssigned = false;
      this.isBreakShot = true;
      this.lastPocketedBalls = [];
      this.fouls = { 1: 0, 2: 0 };
      this.winner = null;
      this.gameLog = [];
      
      // Count the balls from the initial setup
      this.updateBallCounts(initialBalls);
      
      this.logEvent("Game started.");
      
      return {
        isGameStarted: this.isGameStarted,
        currentPlayer: this.currentPlayer,
        isBreakShot: this.isBreakShot,
        message: "Game started. Player 1 to break."
      };
    }
    
    /**
     * Update ball counts based on current balls on the table
     * @param {Array} balls - Current ball positions
     */
    updateBallCounts(balls) {
      // Reset counts
      this.remainingBalls = {
        red: 0,
        yellow: 0,
        black: 0,
        white: 0
      };
      
      // Count non-pocketed balls
      balls.forEach(ball => {
        if (!ball.pocketed && this.remainingBalls.hasOwnProperty(ball.color)) {
          this.remainingBalls[ball.color]++;
        }
      });
      
      return this.remainingBalls;
    }
    
    /**
     * Evaluate a shot and update game state
     * @param {Array} beforeBalls - Ball positions before the shot
     * @param {Array} afterBalls - Ball positions after the shot
     * @param {Object} shotParams - Parameters of the shot (angle, power, etc.)
     * @param {Array} pocketedBalls - Balls pocketed during this shot
     * @returns {Object} Result of the shot with messages and game state
     */
    evaluateShot(beforeBalls, afterBalls, shotParams, pocketedBalls) {
      // Update ball counts
      this.updateBallCounts(afterBalls);
      
      // Determine which balls were pocketed in this shot
      const newlyPocketed = pocketedBalls.filter(
        ball => !this.lastPocketedBalls.some(
          prevBall => prevBall.id === ball.id
        )
      );
      
      // Save the current pocketed balls list for next comparison
      this.lastPocketedBalls = [...pocketedBalls];
      
      // Initialise result object
      const result = {
        currentPlayer: this.currentPlayer,
        isPlayerTurn: true,
        isFoul: false,
        isGameOver: false,
        message: "",
        detailedMessage: "",
        nextPlayer: null,
        pocketedBalls: newlyPocketed,
        ballGroups: this.playerBallGroups
      };
      
      // Check if the cue ball was pocketed (always a foul)
      const cueBallPocketed = newlyPocketed.some(ball => ball.color === "white");
      
      // Check if the black ball was pocketed
      const blackBallPocketed = newlyPocketed.some(ball => ball.color === "black");
      
      // Handle break shot special rules
      if (this.isBreakShot) {
        result.detailedMessage = "Break shot taken. ";
        
        // Handle fouls on the break
        if (cueBallPocketed) {
          result.isFoul = true;
          result.message = "Foul! Cue ball pocketed on the break.";
          result.detailedMessage += "Cue ball pocketed on the break. Opponent gets ball in hand.";
          
          // Switch player turn
          this.switchPlayer();
          result.nextPlayer = this.currentPlayer;
          result.isPlayerTurn = false;
          
          this.logEvent(`Foul on break by Player ${result.currentPlayer}. Cue ball pocketed.`);
        } 
        // Check if the black ball was pocketed on the break (re-rack)
        else if (blackBallPocketed) {
          result.isFoul = true;
          result.message = "Black ball pocketed on the break. Re-rack and try again.";
          result.detailedMessage += "Black ball pocketed on the break. The table should be re-racked and the breaking player breaks again.";
          
          this.logEvent(`Black ball pocketed on break by Player ${this.currentPlayer}. Re-rack.`);
        }
        // Legal break with balls pocketed
        else if (newlyPocketed.length > 0) {
          // Filter out the cue ball if it was pocketed
          const colorBallsPocketed = newlyPocketed.filter(ball => ball.color !== "white");
          
          if (colorBallsPocketed.length > 0) {
            // Check if both red and yellow were pocketed
            const redPocketed = colorBallsPocketed.some(ball => ball.color === "red");
            const yellowPocketed = colorBallsPocketed.some(ball => ball.color === "yellow");
            
            if (redPocketed && yellowPocketed) {
              // Player can choose their group
              result.message = "You pocketed both red and yellow balls. Select your group.";
              result.detailedMessage += "Both red and yellow balls were pocketed. The current player may choose which group they want.";
              result.canSelectGroup = true;
            }
            else if (redPocketed) {
              // Assign red to the current player
              this.assignBallGroups("red");
              result.message = "You're now on the red balls.";
              result.detailedMessage += "Red ball(s) pocketed on the break. Current player is now on red balls.";
            }
            else if (yellowPocketed) {
              // Assign yellow to the current player
              this.assignBallGroups("yellow");
              result.message = "You're now on the yellow balls.";
              result.detailedMessage += "Yellow ball(s) pocketed on the break. Current player is now on yellow balls.";
            }
          }
          else {
            result.message = "Legal break, continue your turn.";
            result.detailedMessage += "Legal break but no balls pocketed. Table is still open.";
          }
        } 
        // Legal break but no balls pocketed
        else {
          result.message = "Legal break, but no balls pocketed. Opponent's turn.";
          result.detailedMessage += "Legal break but no balls pocketed. Opponent's turn.";
          
          // Switch player turn
          this.switchPlayer();
          result.nextPlayer = this.currentPlayer;
          result.isPlayerTurn = false;
        }
        
        // Break shot is now over
        this.isBreakShot = false;
      }
      // Normal shot (not a break)
      else {
        // Get the appropriate ball color for the current player
        const playerColor = this.playerBallGroups[this.currentPlayer];
        
        // Check if balls are assigned to players yet
        if (!this.isBallGroupsAssigned) {
          // Table is "open" - player can hit any ball except black
          
          // Check for fouls
          if (cueBallPocketed) {
            result.isFoul = true;
            result.message = "Foul! Cue ball pocketed.";
            result.detailedMessage = "Cue ball pocketed. Opponent gets ball in hand.";
            
            // Switch player turn
            this.switchPlayer();
            result.nextPlayer = this.currentPlayer;
            result.isPlayerTurn = false;
            
            this.logEvent(`Foul by Player ${result.currentPlayer}. Cue ball pocketed.`);
          }
          // Black ball pocketed when table is open
          else if (blackBallPocketed) {
            result.isFoul = true;
            result.message = "Foul! Cannot pocket the black ball when the table is open.";
            result.detailedMessage = "Black ball pocketed when the table is open. This is a foul.";
            
            // Switch player turn
            this.switchPlayer();
            result.nextPlayer = this.currentPlayer;
            result.isPlayerTurn = false;
            
            this.logEvent(`Foul by Player ${result.currentPlayer}. Black ball pocketed when table is open.`);
          }
          // Check which balls were pocketed and assign groups
          else if (newlyPocketed.length > 0) {
            // Filter out the cue ball if it was pocketed
            const colorBallsPocketed = newlyPocketed.filter(ball => ball.color !== "white" && ball.color !== "black");
            
            if (colorBallsPocketed.length > 0) {
              // Check if both red and yellow were pocketed
              const redPocketed = colorBallsPocketed.some(ball => ball.color === "red");
              const yellowPocketed = colorBallsPocketed.some(ball => ball.color === "yellow");
              
              if (redPocketed && yellowPocketed) {
                // Player can choose their group
                result.message = "You pocketed both red and yellow balls. Select your group.";
                result.detailedMessage = "Both red and yellow balls were pocketed. The current player may choose which group they want.";
                result.canSelectGroup = true;
              }
              else if (redPocketed) {
                // Assign red to the current player
                this.assignBallGroups("red");
                result.message = "You're now on the red balls.";
                result.detailedMessage = "Red ball(s) pocketed. Current player is now on red balls.";
                
                this.logEvent(`Player ${this.currentPlayer} assigned to red balls.`);
              }
              else if (yellowPocketed) {
                // Assign yellow to the current player
                this.assignBallGroups("yellow");
                result.message = "You're now on the yellow balls.";
                result.detailedMessage = "Yellow ball(s) pocketed. Current player is now on yellow balls.";
                
                this.logEvent(`Player ${this.currentPlayer} assigned to yellow balls.`);
              }
            }
            else {
              result.message = "No color balls pocketed. Table is still open.";
              result.detailedMessage = "No color balls pocketed. The table is still open.";
            }
          }
          else {
            // No balls pocketed and no fouls
            result.message = "No balls pocketed. Opponent's turn.";
            result.detailedMessage = "No balls pocketed. The table is still open. Opponent's turn.";
            
            // Switch player turn
            this.switchPlayer();
            result.nextPlayer = this.currentPlayer;
            result.isPlayerTurn = false;
          }
        }
        // Ball groups are assigned - normal gameplay
        else {
          // Determine which ball the player should hit first (their color or black if all their balls are pocketed)
          const shouldHitBlack = this.remainingBalls[playerColor] === 0;
          const opponentColor = playerColor === "red" ? "yellow" : "red";
          
          // Check for fouls
          if (cueBallPocketed) {
            result.isFoul = true;
            result.message = "Foul! Cue ball pocketed.";
            result.detailedMessage = "Cue ball pocketed. Opponent gets ball in hand.";
            
            // Switch player turn
            this.switchPlayer();
            result.nextPlayer = this.currentPlayer;
            result.isPlayerTurn = false;
            
            this.logEvent(`Foul by Player ${result.currentPlayer}. Cue ball pocketed.`);
          }
          // Check if the black ball was pocketed
          else if (blackBallPocketed) {
            // Check if the player was supposed to hit the black
            if (shouldHitBlack) {
              // Check if all of the player's balls are gone
              if (this.remainingBalls[playerColor] === 0) {
                // Player wins!
                result.isGameOver = true;
                result.winner = this.currentPlayer;
                result.message = "Game over! You win by pocketing the black ball.";
                result.detailedMessage = `Game over! Player ${this.currentPlayer} wins by legally pocketing the black ball.`;
                
                this.winner = this.currentPlayer;
                this.logEvent(`Player ${this.currentPlayer} wins by pocketing the black ball!`);
              } else {
                // Player still has their balls on the table - this is a foul
                result.isFoul = true;
                result.message = "Foul! Cannot pocket the black until all your balls are cleared.";
                result.detailedMessage = "Black ball pocketed before clearing all your balls. This is a foul.";
                
                // Switch player turn
                this.switchPlayer();
                result.nextPlayer = this.currentPlayer;
                result.isPlayerTurn = false;
                
                this.logEvent(`Foul by Player ${result.currentPlayer}. Black ball pocketed prematurely.`);
              }
            } else {
              // Player pocketed the black when they shouldn't have - opponent wins
              result.isGameOver = true;
              result.winner = this.currentPlayer === 1 ? 2 : 1;
              result.message = "Game over! You lose by pocketing the black ball illegally.";
              result.detailedMessage = `Game over! Player ${this.currentPlayer} loses by illegally pocketing the black ball.`;
              
              this.winner = result.winner;
              this.logEvent(`Player ${this.currentPlayer} loses by illegally pocketing the black ball. Player ${result.winner} wins!`);
            }
          }
          // Check which balls were pocketed
          else if (newlyPocketed.length > 0) {
            // Filter by the player's color
            const playerBallsPocketed = newlyPocketed.filter(ball => ball.color === playerColor);
            const opponentBallsPocketed = newlyPocketed.filter(ball => ball.color === opponentColor);
            
            // Check if the player pocketed any of their balls
            if (playerBallsPocketed.length > 0) {
              result.message = `Good shot! You pocketed ${playerBallsPocketed.length} of your balls.`;
              result.detailedMessage = `Player pocketed ${playerBallsPocketed.length} of their ${playerColor} balls. Continue your turn.`;
              
              this.logEvent(`Player ${this.currentPlayer} pocketed ${playerBallsPocketed.length} ${playerColor} ball(s).`);
            }
            
            // Check if the player pocketed any of the opponent's balls (this is allowed but turn ends)
            if (opponentBallsPocketed.length > 0) {
              result.message = `You pocketed the opponent's ball(s). Opponent's turn.`;
              result.detailedMessage = `Player pocketed ${opponentBallsPocketed.length} of the opponent's ${opponentColor} balls. Turn ends.`;
              
              // Switch player turn
              this.switchPlayer();
              result.nextPlayer = this.currentPlayer;
              result.isPlayerTurn = false;
              
              this.logEvent(`Player ${result.currentPlayer} pocketed ${opponentBallsPocketed.length} opponent's ball(s). Turn ends.`);
            }
            
            // If none of the player's balls were pocketed but no fouls occurred, end turn
            if (playerBallsPocketed.length === 0 && opponentBallsPocketed.length === 0 && !result.isFoul) {
              result.message = "No balls of your color pocketed. Opponent's turn.";
              result.detailedMessage = "No balls of your color were pocketed. Opponent's turn.";
              
              // Switch player turn
              this.switchPlayer();
              result.nextPlayer = this.currentPlayer;
              result.isPlayerTurn = false;
              
              this.logEvent(`Player ${result.currentPlayer} didn't pocket any balls. Turn ends.`);
            }
          }
          // No balls were pocketed - check first contact
          else {
            // First contact logic would be implemented here
            // In this simulation, we're assuming legal contact for simplicity
            
            result.message = "No balls pocketed. Opponent's turn.";
            result.detailedMessage = "No balls pocketed. Opponent's turn.";
            
            // Switch player turn
            this.switchPlayer();
            result.nextPlayer = this.currentPlayer;
            result.isPlayerTurn = false;
            
            this.logEvent(`Player ${result.currentPlayer} didn't pocket any balls. Turn ends.`);
          }
        }
      }
      
      // Update the result with current game state
      result.currentPlayer = this.currentPlayer;
      result.ballGroups = this.playerBallGroups;
      result.isBallGroupsAssigned = this.isBallGroupsAssigned;
      result.remainingBalls = this.remainingBalls;
      
      return result;
    }
    
    /**
     * Assign ball groups to players
     * @param {string} currentPlayerColor - Color assigned to the current player ('red' or 'yellow')
     */
    assignBallGroups(currentPlayerColor) {
      if (currentPlayerColor !== 'red' && currentPlayerColor !== 'yellow') {
        throw new Error('Invalid ball color. Must be "red" or "yellow"');
      }
      
      const otherColor = currentPlayerColor === 'red' ? 'yellow' : 'red';
      
      this.playerBallGroups = {
        [this.currentPlayer]: currentPlayerColor,
        [this.currentPlayer === 1 ? 2 : 1]: otherColor
      };
      
      this.isBallGroupsAssigned = true;
      
      this.logEvent(`Ball groups assigned: Player ${this.currentPlayer} = ${currentPlayerColor}, Player ${this.currentPlayer === 1 ? 2 : 1} = ${otherColor}`);
      
      return this.playerBallGroups;
    }
    
    /**
     * Switch the current player
     */
    switchPlayer() {
      this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
      return this.currentPlayer;
    }
    
    /**
     * Log an event to the game history
     * @param {string} event - Description of the event
     */
    logEvent(event) {
      const timestamp = new Date().toISOString();
      this.gameLog.push({
        timestamp,
        event,
        player: this.currentPlayer,
        ballGroups: { ...this.playerBallGroups },
        remainingBalls: { ...this.remainingBalls }
      });
    }
    
    /**
     * Get the status of the game
     */
    getGameStatus() {
      return {
        isGameStarted: this.isGameStarted,
        currentPlayer: this.currentPlayer,
        playerBallGroups: this.playerBallGroups,
        isBallGroupsAssigned: this.isBallGroupsAssigned,
        isBreakShot: this.isBreakShot,
        remainingBalls: this.remainingBalls,
        winner: this.winner,
        gameLog: this.gameLog
      };
    }
  }
  
  export default PoolRulesService;