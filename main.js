'use strict'

const MINE = '💣';
const FLAG = '🚩';


var gBoard
var gCell

//This is an object by which the board size is set (in this case: 4x4 board and how many mines to place)
var gLevel = {
	size: 4,
	mines: 2,
}

//This is an object in which you can keep and update the current game state:
//  isOn: Boolean, when true we let the user play
//   shownCount: How many cells are shown 
//   markedCount: How many cells are marked (with a flag)
//    secsPassed: How many seconds passed
var gGame = {
	isOn: false,
	shownCount: 0,
	markedCount: 0,
	secsPassed: 0,
}

function onInit() {
	gBoard = buildBoard()
	renderBoard(gBoard)
	gGame.isOn = true

}





//DONE//Builds the board //Set the mines //Call setMinesNegsCount() //Return the created board
function buildBoard() {

	const board = []

	for (var i = 0; i < gLevel.size; i++) {
		board[i] = []
		for (var j = 0; j < gLevel.size; j++) {
			board[i][j] = {
				minesAroundCount: 0,
				isShown: false,
				isMine: false,
				isMarked: false,
			}
		}
	}

	// board[0][0].isMine = true ///step 2
	// board[3][3].isMine = true ////step 2

	// createMines(board ,gLevel.mines)
	setMinesNegCount(board)

	console.log(board)
	return board
}

function renderBoard(board) {

	var strHTML = ''
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>';
		for (var j = 0; j < board[i].length; j++) {
			const currCell = board[i][j]
			const className = `cell cell-${i}-${j}`;

			strHTML += `<td class="${className} " 
				onclick="onCellClicked(this, ${i}, ${j})" 
				oncontextmenu="onCellMarked(event, ${i}, ${j})">`

			if (currCell.isShown) {
				if (currCell.isMine) {
					strHTML += MINE
				} else if (currCell.minesAroundCount > 0) {
					strHTML += currCell.minesAroundCount
				}

			} else if (currCell.isMarked) {
				strHTML += FLAG
			}


			strHTML += `</td>`
		}
		strHTML += '</tr>'
	}

	var elContainer = document.querySelector('.board');
	elContainer.innerHTML = strHTML;

}


function createMines(board, minesNumber) {
	var emptyCells = getEmptyCell(board)

	for (var i = 0; i < minesNumber; i++) {
		if(emptyCells.length === 0) break
		var randomIdx = getRandomInt(0, emptyCells.length)
		var cellPos = emptyCells.splice(randomIdx,1)[0]
		board[cellPos.i][cellPos.j].isMine = true
		
	}

}

//DONE//Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegCount(board) {
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			if (!board[i][j].isMine) {
				board[i][j].minesAroundCount = countNeighbors(i, j, board)
			}
		}
	}
}

function getEmptyCell(board) {
	var emptyCells = []

	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			if (!board[i][j].isMine)
				emptyCells.push({ i: i, j: j })
		}
	}

	if (!emptyCells.length) return null

	return emptyCells
}


function onCellClicked(elCell, i, j) {
	if (!gGame.isOn || gBoard[i][j].isShown || gBoard[i][j].isMarked) return

	gBoard[i][j].isShown = true
	gGame.shownCount++

	// if (gGame.shownCount === 1) {
	// 	startTimer()
	// }

	if (gBoard[i][j].isMine) {
		gameOver()
	}

	if (gBoard[i][j].minesAroundCount === 0) {
		expandShown(gBoard, elCell, i, j)
	} else {

	}

	renderBoard(gBoard)
	checkGameOver()

}

//Called when a cell is right- clicked See how you can hide the context menu on right click
function onCellMarked(elCell) {

}

//Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {

}

function gameOver() {

}

// When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors. 
// NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
//  BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below)
function expandShown(board, elCell, i, j) {

}



function getRandomInt(min, max) {
	const minCeiled = Math.ceil(min);
	const maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}


function countNeighbors(rowIdx, colIdx, Board) {
	var minesAroundCount = 0

	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i >= Board.length) continue

		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j >= Board[i].length) continue
			if (i === rowIdx && j === colIdx) continue
			if (Board[i][j].isMine) minesAroundCount++
		}
	}
	return minesAroundCount
}











function renderCell(location, value) {
	const cellSelector = '.' + getClassName(location)
	const elCell = document.querySelector(cellSelector)
	elCell.innerHTML = value
}