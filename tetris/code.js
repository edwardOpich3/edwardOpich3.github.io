var svg;
var svgNS = "http://www.w3.org/2000/svg";
var gameState = 0;	// 0 = menu, 1 = game, 2 = game over?
var score = 0;	// Current score; no limit.
var level = 1;	// Current level; goes up to 20.
var lines = 0;	// Number of completed lines.
var currentBlock = []; // A size 16 array that contains the current block definition.
// These block definitions each have a number, 1 - 7.
// In order: Line, Square, T, J, L, S, and Z.
// The colors for these are ROYGBV and Pink, in that order.
// Empty slots are gray.
var currentBlockDef = 1;	// Used to determine which color the tiles the block resides in need to be colored.

var currentRot = 0; // Current rotation, increasing clockwise.
// If one rotates past 3 or before 0, the value will wrap around.

var currentColumn = 0;	// The column the leftmost tiles of the block definition are currently in.
var currentRow = 0;	// The row the bottommost tiles of the block definition are currently in.
// If there are any blocks in this row, we need to check for collision.

var nextBlock = []; // Same as currentBlock, but for the block preview.
var nextBlockDef = 1; // The number of the definition of the next block.
// Used to determine which block definition to assign currentBlock once the tradeoff is made.

var blockSize = 32;	// Block size in pixels. Here simply for convenience.
var gameWidth = 10;	// How wide is the game field in blocks?
var gameHeight = 18;// How tall is the game field in blocks?
var gameArray = [];	// The array of game blocks
// Notice that it's single dimensional; so how do we access a specific coordinate?
// (row * gameWidth) + column. That's how.

var blockColors = ["none", "red", "orange", "yellow", "green", "blue", "purple", "deeppink"];

var blockTimer = 0;		// The timer to use when calculating the block fall


window.onload = game;

/*var gameBlock = 	// This represents a single tile on the game field, or in a block definition.
{
	value: 0,	// Same scheme as current/next block. 0 means there's nothing there.
	row: -1,	// Which row is it in?
	column: -1	// Which column is it in?
}*/

function game()
{
	// Everything within the game happens here!
	init();
	setupTitleScreen();
	document.addEventListener("keydown", setupGame);
		
	/*ctx.fillText("Level:", 336, 128);
	
	// Draw the next block preview!
	ctx.fillText("Next:", 336, 256);
	ctx.fillRect(432, 196, 128, 128);*/
}

function init()
{
	svg = document.getElementById("game");
	document.addEventListener("keydown", handleInput);
	window.setInterval(fall, 1000 / 60);
	//svg.onkeypress = handleInput;
}

function setupTitleScreen()
{
	displayTitle();		
	displayInstructions();
}

function setupGame(e)
{
	if(e.keyCode == 13)
	{
		if(gameState != 1)
		{
			gameState = 1;
			score = 0;
			level = 1;
			lines = 0;
			
			clearSVG();
			displayGame();
			
			for(var i = 0; i < gameWidth * gameHeight; i++)	// Create the game field
			{
				gameArray[i] = document.createElementNS(svgNS, "rect");
				gameArray[i].setAttributeNS(null, "x", (i % gameWidth) * blockSize);
				gameArray[i].setAttributeNS(null, "y", Math.floor(i / gameWidth) * blockSize);
				gameArray[i].setAttributeNS(null, "width", blockSize);
				gameArray[i].setAttributeNS(null, "height", blockSize);
				gameArray[i].setAttributeNS(null, "stroke", "black");
				gameArray[i].setAttributeNS(null, "stroke-width", "1");
				gameArray[i].style.fill = blockColors[0];
				
				gameArray.push({
					colorValue: 0,	// Determines the color to fill the square. Based on block definition.
					row: -1,	// Which row is it in?
					column: -1	// Which column is it in?
				});
				
				gameArray[i].colorValue = 0;
				
				gameArray[i].row = Math.floor(i / gameWidth);
				gameArray[i].column = i % gameWidth;
				
				svg.appendChild(gameArray[i]);
			}
			
			// Initialize some game variables
			currentBlockDef = Math.floor((Math.random() * 7) + 1);
			rot = 0;
			
			nextBlockDef = Math.floor((Math.random() * 7) + 1);
			currentColumn = 4;
			currentRow = 0;
			blockTimer = 3 * (20 / level);
			
			// Create the next block preview and current block
			for(var i = 0; i < 16; i++)
			{
				nextBlock[i] = document.createElementNS(svgNS, "rect");
				nextBlock[i].setAttributeNS(null, "x", ((i % 4) * blockSize) + 436);
				nextBlock[i].setAttributeNS(null, "y", (Math.floor(i / 4) * blockSize) + 192);
				nextBlock[i].setAttributeNS(null, "width", blockSize);
				nextBlock[i].setAttributeNS(null, "height", blockSize);

				nextBlock.push( {colorValue: 0} );
				nextBlock[i].colorValue = 0;
				
				currentBlock[i] = document.createElementNS(svgNS, "rect");
				currentBlock[i].setAttributeNS(null, "x", ((i % 4) + currentColumn) * blockSize);
				currentBlock[i].setAttributeNS(null, "y", (Math.floor(i / 4) + currentRow) * blockSize);
				currentBlock[i].setAttributeNS(null, "width", blockSize);
				currentBlock[i].setAttributeNS(null, "height", blockSize);
				
				currentBlock.push( {colorValue: 0} );
				currentBlock[i].colorValue = 0;
			}
			
			assignCurrentBlockDef(currentBlockDef, rot);
			assignNextBlockDef(nextBlockDef, 0);
				
			for(var i = 0; i < 16; i++)
			{
				nextBlock[i].style.fill = blockColors[nextBlock[i].colorValue];
				if(nextBlock[i].colorValue > 0)
				{
					nextBlock[i].setAttributeNS(null, "stroke", "black");
					nextBlock[i].setAttributeNS(null, "stroke-width", "1");
				}
				
				svg.appendChild(nextBlock[i]);
				
				currentBlock[i].style.fill = blockColors[currentBlock[i].colorValue];
				if(currentBlock[i].colorValue > 0)
				{
					currentBlock[i].setAttributeNS(null, "stroke", "black");
					currentBlock[i].setAttributeNS(null, "stroke-width", "1");
				}
				
				svg.appendChild(currentBlock[i]);
			}
		}
	}
}

function instructionInit(instructions)
{
	instructions = document.createElementNS(svgNS, "text");
	instructions.setAttributeNS(null, "x", "320");
	instructions.setAttributeNS(null, "font-size", "16");
	instructions.setAttributeNS(null, "font-family", "Verdana");
	instructions.setAttributeNS(null, "fill", "#000000");
	instructions.setAttributeNS(null, "text-anchor", "middle");
	
	return instructions;
}

function displayTitle()
{
	// The title tag
	var title = document.createElementNS(svgNS, "text");
	title.setAttributeNS(null, "x", "320");
	title.setAttributeNS(null, "y", "128");
	title.setAttributeNS(null, "font-size", "64");
	title.setAttributeNS(null, "font-family", "Verdana");
	title.setAttributeNS(null, "fill", "#000000");
	title.setAttributeNS(null, "text-anchor", "middle");
	
	// The actual text itself
	var text = document.createTextNode("TETRIS");
	
	title.appendChild(text);
	svg.appendChild(title);
}

function displayInstructions()
{
	// A brief paragraph containing instructions
	var instructions;
	var text;
	instructions = instructionInit(instructions);
	instructions.setAttributeNS(null, "y", "196");
	
	text = document.createTextNode("Press the 'z' key to rotate the block counter-clockwise.");
	instructions.appendChild(text);
	svg.appendChild(instructions);
	
	instructions = instructionInit(instructions);
	instructions.setAttributeNS(null, "y", "220");
	
	text = document.createTextNode("Press the 'x' key to rotate the block clockwise.");
	instructions.appendChild(text);
	svg.appendChild(instructions);
	
	instructions = instructionInit(instructions);
	instructions.setAttributeNS(null, "y", "244");
	
	text = document.createTextNode("Press the down arrow key to drop the block quicker.");
	instructions.appendChild(text);
	svg.appendChild(instructions);
	
	instructions = instructionInit(instructions);
	instructions.setAttributeNS(null, "y", "268");
	
	text = document.createTextNode("Press the left or right arrow keys to move the block in that direction.");
	instructions.appendChild(text);
	svg.appendChild(instructions);
	
	instructions = instructionInit(instructions);
	instructions.setAttributeNS(null, "y", "402");
	
	text = document.createTextNode("Press Enter to begin!");
	instructions.appendChild(text);
	svg.appendChild(instructions);
	// End Instructions paragraph
}

function displayGameOver()
{
	// The title tag
	var title = document.createElementNS(svgNS, "text");
	title.setAttributeNS(null, "x", "320");
	title.setAttributeNS(null, "y", "128");
	title.setAttributeNS(null, "font-size", "64");
	title.setAttributeNS(null, "font-family", "Verdana");
	title.setAttributeNS(null, "fill", "#000000");
	title.setAttributeNS(null, "text-anchor", "middle");
	
	// The actual text itself
	var text = document.createTextNode("GAME OVER");
	
	title.appendChild(text);
	svg.appendChild(title);
	
	// Display the score text
	var textElement = document.createElementNS(svgNS, "text");
	textElement.setAttributeNS(null, "font-family", "Arial");
	textElement.setAttributeNS(null, "font-size", "30");
	textElement.setAttributeNS(null, "x", "320");
	textElement.setAttributeNS(null, "y", "256");
	textElement.setAttributeNS(null, "text-anchor", "middle");
	
	var text = document.createTextNode("Score: " + score);
	
	textElement.appendChild(text);
	svg.appendChild(textElement);
	
	textElement = instructionInit(textElement);
	textElement.setAttributeNS(null, "y", "402");
	
	text = document.createTextNode("Press Enter to play again.");
	textElement.appendChild(text);
	svg.appendChild(textElement);
}

function clearSVG()
{
	for(var i = svg.childNodes.length - 1; i > 0; i--)
	{
		svg.removeChild(svg.childNodes[i]);
	}
}

function displayGame()
{
	// Display the game field
	var gameField = document.createElementNS(svgNS, "rect");
	gameField.setAttributeNS(null, "width", "320");
	gameField.setAttributeNS(null, "height", "576");
	gameField.style.fill = "#CCCCCC";
	
	svg.appendChild(gameField);
	
	// Display the score field
	var scoreField = document.createElementNS(svgNS, "rect");
	scoreField.setAttributeNS(null, "x", "320");
	scoreField.setAttributeNS(null, "width", "320");
	scoreField.setAttributeNS(null, "height", "576");
	scoreField.style.fill = "#AAAAAA";
	
	svg.appendChild(scoreField);
	
	// Display the score text
	var textElement = document.createElementNS(svgNS, "text");
	textElement.setAttributeNS(null, "font-family", "Arial");
	textElement.setAttributeNS(null, "font-size", "30");
	textElement.setAttributeNS(null, "x", "336");
	textElement.setAttributeNS(null, "y", "64");
	textElement.setAttributeNS(null, "id", "score");
	
	var text = document.createTextNode("Score: " + score);
	
	textElement.appendChild(text);
	svg.appendChild(textElement);
	
	// Display the current level text
	textElement = document.createElementNS(svgNS, "text");
	textElement.setAttributeNS(null, "font-family", "Arial");
	textElement.setAttributeNS(null, "font-size", "30");
	textElement.setAttributeNS(null, "x", "336");
	textElement.setAttributeNS(null, "y", "128");
	textElement.setAttributeNS(null, "id", "level");
	
	text = document.createTextNode("Level: " + level);
	
	textElement.appendChild(text);
	svg.appendChild(textElement);
	
	// Display the number of lines completed
	textElement = document.createElementNS(svgNS, "text");
	textElement.setAttributeNS(null, "font-family", "Arial");
	textElement.setAttributeNS(null, "font-size", "30");
	textElement.setAttributeNS(null, "x", "496");
	textElement.setAttributeNS(null, "y", "128");
	textElement.setAttributeNS(null, "id", "lines");
	
	text = document.createTextNode("Lines: " + lines);
	
	textElement.appendChild(text);
	svg.appendChild(textElement);
	
	// Display the next block text
	textElement = document.createElementNS(svgNS, "text");
	textElement.setAttributeNS(null, "font-family", "Arial");
	textElement.setAttributeNS(null, "font-size", "30");
	textElement.setAttributeNS(null, "x", "336");
	textElement.setAttributeNS(null, "y", "256");
	
	text = document.createTextNode("Next:");
	
	textElement.appendChild(text);
	svg.appendChild(textElement);
}

function assignCurrentBlockDef(block, rot)
{
	switch(block)
	{
		case 1:	// Line
		{
			if(rot == 0 || rot == 2)
			{
				currentBlock[0].colorValue = 1;
				currentBlock[1].colorValue = 1;
				currentBlock[2].colorValue = 1;
				currentBlock[3].colorValue = 1;
			}
			else if(rot == 1 || rot == 3)
			{
				currentBlock[0].colorValue = 1;
				currentBlock[4].colorValue = 1;
				currentBlock[8].colorValue = 1;
				currentBlock[12].colorValue = 1;
			}
			break;
		}
		case 2:	// Square
		{
			currentBlock[0].colorValue = 2;
			currentBlock[1].colorValue = 2;
			currentBlock[4].colorValue = 2;
			currentBlock[5].colorValue = 2;
			break;
		}
		case 3:	// T-block
		{
			switch(rot)
			{
				case 0:
				{
					currentBlock[0].colorValue = 3;
					currentBlock[1].colorValue = 3;
					currentBlock[2].colorValue = 3;
					currentBlock[5].colorValue = 3;
					break;
				}
				case 1:
				{
					currentBlock[1].colorValue = 3;
					currentBlock[4].colorValue = 3;
					currentBlock[5].colorValue = 3;
					currentBlock[9].colorValue = 3;
					break;
				}
				case 2:
				{
					currentBlock[1].colorValue = 3;
					currentBlock[4].colorValue = 3;
					currentBlock[5].colorValue = 3;
					currentBlock[6].colorValue = 3;
					break;
				}
				case 3:
				{
					currentBlock[0].colorValue = 3;
					currentBlock[4].colorValue = 3;
					currentBlock[5].colorValue = 3;
					currentBlock[8].colorValue = 3;
					break;
				}
			}
			break;
		}
		case 4:	// J-block
		{
			switch(rot)
			{
				case 0:
				{
					currentBlock[1].colorValue = 4;
					currentBlock[5].colorValue = 4;
					currentBlock[8].colorValue = 4;
					currentBlock[9].colorValue = 4;
					break;
				}
				case 1:
				{
					currentBlock[0].colorValue = 4;
					currentBlock[4].colorValue = 4;
					currentBlock[5].colorValue = 4;
					currentBlock[6].colorValue = 4;
					break;
				}
				case 2:
				{
					currentBlock[0].colorValue = 4;
					currentBlock[1].colorValue = 4;
					currentBlock[4].colorValue = 4;
					currentBlock[8].colorValue = 4;
					break;
				}
				case 3:
				{
					currentBlock[0].colorValue = 4;
					currentBlock[1].colorValue = 4;
					currentBlock[2].colorValue = 4;
					currentBlock[6].colorValue = 4;
					break;
				}
			}
			break;
		}
		case 5:	// L-block
		{
			switch(rot)
			{
				case 0:
				{
					currentBlock[0].colorValue = 5;
					currentBlock[4].colorValue = 5;
					currentBlock[8].colorValue = 5;
					currentBlock[9].colorValue = 5;
					break;
				}
				case 1:
				{
					currentBlock[0].colorValue = 5;
					currentBlock[1].colorValue = 5;
					currentBlock[2].colorValue = 5;
					currentBlock[4].colorValue = 5;
					break;
				}
				case 2:
				{
					currentBlock[0].colorValue = 5;
					currentBlock[1].colorValue = 5;
					currentBlock[5].colorValue = 5;
					currentBlock[9].colorValue = 5;
					break;
				}
				case 3:
				{
					currentBlock[2].colorValue = 5;
					currentBlock[4].colorValue = 5;
					currentBlock[5].colorValue = 5;
					currentBlock[6].colorValue = 5;
					break;
				}
			}
			break;
		}
		case 6:	// S-block
		{
			if(rot == 0 || rot == 2)
			{
				currentBlock[1].colorValue = 6;
				currentBlock[2].colorValue = 6;
				currentBlock[4].colorValue = 6;
				currentBlock[5].colorValue = 6;
			}
			else if(rot == 1 || rot == 3)
			{
				currentBlock[0].colorValue = 6;
				currentBlock[4].colorValue = 6;
				currentBlock[5].colorValue = 6;
				currentBlock[9].colorValue = 6;
			}
			break;
		}
		case 7:	// Z-block
		{
			if(rot == 0 || rot == 2)
			{
				currentBlock[0].colorValue = 7;
				currentBlock[1].colorValue = 7;
				currentBlock[5].colorValue = 7;
				currentBlock[6].colorValue = 7;
			}
			else if(rot == 1 || rot == 3)
			{
				currentBlock[1].colorValue = 7;
				currentBlock[4].colorValue = 7;
				currentBlock[5].colorValue = 7;
				currentBlock[8].colorValue = 7;
			}
			break;
		}
	}
}

function assignNextBlockDef(block, rot)
{
	switch(block)
	{
		case 1:	// Line
		{
			if(rot == 0 || rot == 2)
			{
				nextBlock[0].colorValue = 1;
				nextBlock[1].colorValue = 1;
				nextBlock[2].colorValue = 1;
				nextBlock[3].colorValue = 1;
			}
			else if(rot == 1 || rot == 3)
			{
				nextBlock[0].colorValue = 1;
				nextBlock[4].colorValue = 1;
				nextBlock[8].colorValue = 1;
				nextBlock[12].colorValue = 1;
			}
			break;
		}
		case 2:	// Square
		{
			nextBlock[0].colorValue = 2;
			nextBlock[1].colorValue = 2;
			nextBlock[4].colorValue = 2;
			nextBlock[5].colorValue = 2;
			break;
		}
		case 3:	// T-block
		{
			switch(rot)
			{
				case 0:
				{
					nextBlock[0].colorValue = 3;
					nextBlock[1].colorValue = 3;
					nextBlock[2].colorValue = 3;
					nextBlock[5].colorValue = 3;
					break;
				}
				case 1:
				{
					nextBlock[1].colorValue = 3;
					nextBlock[4].colorValue = 3;
					nextBlock[5].colorValue = 3;
					nextBlock[9].colorValue = 3;
					break;
				}
				case 2:
				{
					nextBlock[1].colorValue = 3;
					nextBlock[4].colorValue = 3;
					nextBlock[5].colorValue = 3;
					nextBlock[6].colorValue = 3;
					break;
				}
				case 3:
				{
					nextBlock[0].colorValue = 3;
					nextBlock[4].colorValue = 3;
					nextBlock[5].colorValue = 3;
					nextBlock[8].colorValue = 3;
					break;
				}
			}
			break;
		}
		case 4:	// J-block
		{
			switch(rot)
			{
				case 0:
				{
					nextBlock[1].colorValue = 4;
					nextBlock[5].colorValue = 4;
					nextBlock[8].colorValue = 4;
					nextBlock[9].colorValue = 4;
					break;
				}
				case 1:
				{
					nextBlock[0].colorValue = 4;
					nextBlock[4].colorValue = 4;
					nextBlock[5].colorValue = 4;
					nextBlock[6].colorValue = 4;
					break;
				}
				case 2:
				{
					nextBlock[0].colorValue = 4;
					nextBlock[1].colorValue = 4;
					nextBlock[4].colorValue = 4;
					nextBlock[8].colorValue = 4;
					break;
				}
				case 3:
				{
					nextBlock[0].colorValue = 4;
					nextBlock[1].colorValue = 4;
					nextBlock[2].colorValue = 4;
					nextBlock[6].colorValue = 4;
					break;
				}
			}
			break;
		}
		case 5:	// L-block
		{
			switch(rot)
			{
				case 0:
				{
					nextBlock[0].colorValue = 5;
					nextBlock[4].colorValue = 5;
					nextBlock[8].colorValue = 5;
					nextBlock[9].colorValue = 5;
					break;
				}
				case 1:
				{
					nextBlock[0].colorValue = 5;
					nextBlock[1].colorValue = 5;
					nextBlock[2].colorValue = 5;
					nextBlock[4].colorValue = 5;
					break;
				}
				case 2:
				{
					nextBlock[0].colorValue = 5;
					nextBlock[1].colorValue = 5;
					nextBlock[5].colorValue = 5;
					nextBlock[9].colorValue = 5;
					break;
				}
				case 3:
				{
					nextBlock[2].colorValue = 5;
					nextBlock[4].colorValue = 5;
					nextBlock[5].colorValue = 5;
					nextBlock[6].colorValue = 5;
					break;
				}
			}
			break;
		}
		case 6:	// S-block
		{
			if(rot == 0 || rot == 2)
			{
				nextBlock[1].colorValue = 6;
				nextBlock[2].colorValue = 6;
				nextBlock[4].colorValue = 6;
				nextBlock[5].colorValue = 6;
			}
			else if(rot == 1 || rot == 3)
			{
				nextBlock[0].colorValue = 6;
				nextBlock[4].colorValue = 6;
				nextBlock[5].colorValue = 6;
				nextBlock[9].colorValue = 6;
			}
			break;
		}
		case 7:	// Z-block
		{
			if(rot == 0 || rot == 2)
			{
				nextBlock[0].colorValue = 7;
				nextBlock[1].colorValue = 7;
				nextBlock[5].colorValue = 7;
				nextBlock[6].colorValue = 7;
			}
			else if(rot == 1 || rot == 3)
			{
				nextBlock[1].colorValue = 7;
				nextBlock[4].colorValue = 7;
				nextBlock[5].colorValue = 7;
				nextBlock[8].colorValue = 7;
			}
			break;
		}
	}
}

function clearCurrentBlock()
{
	for(var i = 0; i < 16; i++)
	{
		currentBlock[i] = 0;
	}
}

function clearNextBlock()
{
	for(var i = 0; i < 16; i++)
	{
		nextBlock[i] = 0;
	}
}

function handleInput(e)
{
	if(gameState == 1)
	{
		if(e.keyCode == 37)	// Left Key
		{
			currentColumn--;
			if(currentColumn < 0)
			{
				currentColumn = 0;
			}
			for(var i = 0; i < 16; i++)
			{
				currentBlock[i].setAttributeNS(null, "x", ((i % 4) + currentColumn) * blockSize);
			}
		}
		else if(e.keyCode == 39)	// Right Key
		{
			currentColumn++;
			var endColumn = 0;	// Used to calculate collision with the right wall
			for(var i = 0; i < 16; i++)
			{
				if(currentBlock[i].colorValue > 0 && (i % 4) > endColumn)
				{
					endColumn = i % 4;
				}
			}
			
			if(currentColumn + endColumn >= gameWidth)
			{
				currentColumn = gameWidth - endColumn - 1;
			}
			
			for(var i = 0; i < 16; i++)
			{
				currentBlock[i].setAttributeNS(null, "x", ((i % 4) + currentColumn) * blockSize);
			}
		}
		else if(e.keyCode == 40)	// Down Key
		{
			/*currentRow = 20;
			
			var endRow = 0;	// Used to calculate collision with the floor
			for(var i = 0; i < 16; i++)
			{
				if(currentBlock[i].colorValue > 0 && Math.floor(i / 4) > endRow)
				{
					endRow = Math.floor(i / 4);
				}
			}
			
			if(currentRow + endRow >= gameHeight)
			{
				currentRow = gameHeight - endRow - 1;
				switchBlock();
			}
			
			for(var i = 0; i < 16; i++)
			{
				currentBlock[i].setAttributeNS(null, "y", (Math.floor(i / 4) + currentRow) * blockSize);
			}*/
			
			blockTimer = 1;
			
			score += 1;
			var scoreDisplay = document.getElementById("score");
			scoreDisplay.innerHTML = "Score: " + score;
		}
		else if(e.keyCode == 90)	// Z
		{
			rot--;
			if(rot < 0)
			{
				rot = 3;
			}
			for(var i = 0; i < 16; i++)
			{
				currentBlock[i].colorValue = 0;
				currentBlock[i].setAttributeNS(null, "stroke", "none");
			}
			assignCurrentBlockDef(currentBlockDef, rot);
			for(var i = 0; i < 16; i++)
			{
				currentBlock[i].style.fill = blockColors[currentBlock[i].colorValue];
				if(currentBlock[i].colorValue > 0)
				{
					currentBlock[i].setAttributeNS(null, "stroke", "black");
				}
			}
			
			var endColumn = 0;	// Used to calculate collision with the right wall
			for(var i = 0; i < 16; i++)
			{
				if(currentBlock[i].colorValue > 0 && (i % 4) > endColumn)
				{
					endColumn = i % 4;
				}
			}
			
			if(currentColumn + endColumn >= gameWidth)
			{
				currentColumn = gameWidth - endColumn - 1;
			}
			
			for(var i = 0; i < 16; i++)
			{
				currentBlock[i].setAttributeNS(null, "x", ((i % 4) + currentColumn) * blockSize);
			}
			
			var endRow = 0;	// Used to calculate collision with the right wall
			for(var i = 0; i < 16; i++)
			{
				if(currentBlock[i].colorValue > 0 && Math.floor(i / 4) > endRow)
				{
					endRow = Math.floor(i / 4);
				}
			}
			
			if(currentRow + endRow >= gameHeight)
			{
				currentRow = gameHeight - endRow - 1;
			}
			
			for(var i = 0; i < 16; i++)
			{
				currentBlock[i].setAttributeNS(null, "y", (Math.floor(i / 4) + currentRow) * blockSize);
			}
		}
		else if(e.keyCode == 88)	// X
		{
			rot++;
			rot %= 4;
			for(var i = 0; i < 16; i++)
			{
				currentBlock[i].colorValue = 0;
				currentBlock[i].setAttributeNS(null, "stroke", "none");
			}
			assignCurrentBlockDef(currentBlockDef, rot);
			for(var i = 0; i < 16; i++)
			{
				currentBlock[i].style.fill = blockColors[currentBlock[i].colorValue];
				if(currentBlock[i].colorValue > 0)
				{
					currentBlock[i].setAttributeNS(null, "stroke", "black");
				}
			}
			
			var endColumn = 0;	// Used to calculate collision with the right wall
			for(var i = 0; i < 16; i++)
			{
				if(currentBlock[i].colorValue > 0 && (i % 4) > endColumn)
				{
					endColumn = i % 4;
				}
			}
			
			if(currentColumn + endColumn >= gameWidth)
			{
				currentColumn = gameWidth - endColumn - 1;
			}
			
			for(var i = 0; i < 16; i++)
			{
				currentBlock[i].setAttributeNS(null, "x", ((i % 4) + currentColumn) * blockSize);
			}
			
			var endRow = 0;	// Used to calculate collision with the right wall
			for(var i = 0; i < 16; i++)
			{
				if(currentBlock[i].colorValue > 0 && Math.floor(i / 4) > endRow)
				{
					endRow = Math.floor(i / 4);
				}
			}
			
			if(currentRow + endRow >= gameHeight)
			{
				currentRow = gameHeight - endRow - 1;
			}
			
			for(var i = 0; i < 16; i++)
			{
				currentBlock[i].setAttributeNS(null, "y", (Math.floor(i / 4) + currentRow) * blockSize);
			}
		}
	}
}

function fall()
{
	if(gameState == 1)
	{
		blockTimer--;
		if(blockTimer <= 0)
		{
			currentRow++;
				
			var endRow = 0;	// Used to calculate collision with the ground
			for(var i = 0; i < 16; i++)
			{
				if(currentBlock[i].colorValue > 0 && Math.floor(i / 4) > endRow)
				{
					endRow = Math.floor(i / 4);
				}
			}
			
			if(currentRow + endRow >= gameHeight)
			{
				currentRow = gameHeight - endRow - 1;
				switchBlock();
			}
			
			// Tetromino collision!
			var gameOverCounter = 0;	// If all 4 blocks of the tetrimino are overlapping something and this would cause the piece to be pushed out of the game, the game's over.
			for(var i = 0; i < 16; i++)
			{
				if(currentBlock[i].colorValue > 0)
				{
					if(gameArray[(currentRow * gameWidth) + currentColumn + (i % 4) + Math.floor(i / 4) * 10].colorValue > 0)
					{
						currentRow--;
						if(currentRow < 0)
						{
							currentRow = 0;
							gameOverCounter++;
						}
						switchBlock();
					}
				}
			}
			
			if(gameOverCounter >= 4)
			{
				// Game Over!
				gameState = 2;
				clearSVG();
				displayGameOver();
			}
			
			for(var i = 0; i < 16; i++)
			{
				currentBlock[i].setAttributeNS(null, "y", (Math.floor(i / 4) + currentRow) * blockSize);
			}
			blockTimer = 3 * (20 / level)
		}
	}
}

function switchBlock()
{
	imprintBlock();

	currentBlockDef = nextBlockDef;
	rot = 0;
	
	for(var i = 0; i < 16; i++)
	{
		currentBlock[i].colorValue = 0;
		currentBlock[i].setAttributeNS(null, "stroke", "none");
	}
	assignCurrentBlockDef(currentBlockDef, rot);
	currentColumn = 4;
	currentRow = 0;
	blockTimer = 3 * (20 / level);
	
	for(var i = 0; i < 16; i++)
	{
		currentBlock[i].setAttributeNS(null, "x", ((i % 4) + currentColumn) * blockSize);
		currentBlock[i].setAttributeNS(null, "y", (Math.floor(i / 4) + currentRow) * blockSize);
		currentBlock[i].style.fill = blockColors[currentBlock[i].colorValue];
		if(currentBlock[i].colorValue > 0)
		{
			currentBlock[i].setAttributeNS(null, "stroke", "black");
			currentBlock[i].setAttributeNS(null, "stroke-width", "1");
		}
	}
	
	nextBlockDef = Math.floor((Math.random() * 7) + 1);
	
	for(var i = 0; i < 16; i++)
	{
		nextBlock[i].colorValue = 0;
		nextBlock[i].setAttributeNS(null, "stroke", "none");
	}
	assignNextBlockDef(nextBlockDef, 0);
	
	for(var i = 0; i < 16; i++)
	{
		nextBlock[i].style.fill = blockColors[nextBlock[i].colorValue];
		if(nextBlock[i].colorValue > 0)
		{
			nextBlock[i].setAttributeNS(null, "stroke", "black");
			nextBlock[i].setAttributeNS(null, "stroke-width", "1");
		}
	}
}

function imprintBlock()
{
	for(var i = 0; i < 16; i++)
	{
		if(currentBlock[i].colorValue > 0)
		{
			gameArray[(currentRow * gameWidth) + currentColumn + (i % 4) + Math.floor(i / 4) * 10].colorValue = currentBlock[i].colorValue;
			gameArray[(currentRow * gameWidth) + currentColumn + (i % 4) + Math.floor(i / 4) * 10].style.fill = blockColors[currentBlock[i].colorValue];
		}
	}
	tallyLine();
}

function tallyLine()
{
	var numLines = 0;
	var isLine = true;
	for(var i = 0; i < gameWidth * gameHeight; i++)
	{
		if(i % gameWidth == 0)
		{
			isLine = true;
		}
		if(gameArray[i].colorValue == 0)
		{
			isLine = false;
		}
		else if(i % gameWidth == gameWidth - 1 && isLine)
		{
			for(var j = i - gameWidth + 1; j <= i; j++)
			{
				gameArray[j].colorValue = 0;
				gameArray[j].style.fill = blockColors[gameArray[j].colorValue];
				for(var k = Math.floor(j / gameWidth); k > 0; k--)
				{
					gameArray[(k * 10) + (j % gameWidth)].colorValue = gameArray[((k - 1) * 10) + (j % gameWidth)].colorValue;
					gameArray[(k * 10) + (j % gameWidth)].style.fill = blockColors[gameArray[(k * 10) + (j % gameWidth)].colorValue];
				}
			}
			numLines++;
		}
	}
	
	switch(numLines)
	{
		case 0:
		{
			break;
		}
		case 1:
		{
			score += 40 * level;
			break;
		}
		case 2:
		{
			score += 100 * level;
			break;
		}
		case 3:
		{
			score += 300 * level;
			break;
		}
		case 4:
		{
			score += 1200 * level;
			break;
		}
	}
	
	var scoreDisplay = document.getElementById("score");
	scoreDisplay.innerHTML = "Score: " + score;
	
	
	lines += numLines;
	var linesDisplay = document.getElementById("lines");
	linesDisplay.innerHTML = "Lines: " + lines;
	
	level = Math.floor(lines / 10) + 1;
	var levelDisplay = document.getElementById("level");
	levelDisplay.innerHTML = "Level: " + level;
}