'use strict'

const MINE = '💣'
const FLAG = '🚩'
const LIVE = '🧡'
///To change//////////////////
const EMPTY = '0'

var isFirstClick
var gTimerInterval
var gBoard
//This is an object by which the board size is set (in this case: 4x4 board and how many mines to place)
var gLevels = [
	{ id: 1, size: 4, mines: 2 },
	{ id: 2, size: 8, mines: 14 },
	{ id: 3, size: 12, mines: 32 },
]
var gLevel = gLevels[0]

//This is an object in which you can keep and update the current game state:
//  isOn: Boolean, when true we let the user play
//   shownCount: How many cells are shown 
//   markedCount: How many cells are marked (with a flag)
//    secsPassed: How many seconds passed
var gGame = {
	isOn: false,
	isVictory: false,
	shownCount: 0,
	markedCount: 0,
	secsPassed: 0,
	lives: 3,
}

function onInit() {


	gBoard = buildBoard()
	renderBoard(gBoard)

	gGame.isOn = true
	gGame.isVictory = false
	gGame.shownCount = 0
	gGame.markedCount = 0
	gGame.secsPassed = 0
	gGame.lives = 3

	isFirstClick = true

	startTimer()
	clearInterval(gTimerInterval)

	renderLives()

	closeModal()

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

	console.log(board)
	return board
}

//DONE
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
				} else if (currCell.minesAroundCount === 0) {
					strHTML += EMPTY
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

//DONE
function createMines(board, minesNumber, firstLocation) {
	var emptyCells = getEmptyCell(board)

	for (var i = 0; i < minesNumber; i++) {
		if (emptyCells.length === 0) break

		var randomIdx = getRandomInt(0, emptyCells.length)
		var cellPos = emptyCells.splice(randomIdx, 1)[0]

		if (cellPos.i !== firstLocation.i && cellPos.j !== firstLocation.j) {
			board[cellPos.i][cellPos.j].isMine = true
		} else {
			i--
		}
	}
}

//DONE
//Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegCount(board) {
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			if (!board[i][j].isMine) {
				board[i][j].minesAroundCount = countNeighbors(i, j, board)
			}
		}
	}
}

//DONE
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

//DONE
function onCellClicked(elCell, i, j) {
	if (!gGame.isOn || gBoard[i][j].isShown || gBoard[i][j].isMarked) return

	if (isFirstClick) {
		handleFirstClick({ i, j })
	}

	if (gBoard[i][j].isMine) {
		handleLives()

	} else {
		gBoard[i][j].isShown = true
		gGame.shownCount++

		if (gBoard[i][j].minesAroundCount === 0) {
			expandShown(gBoard, elCell, i, j)
		}
	}

	renderBoard(gBoard)
	checkGameOver()

}

function handleFirstClick(firstLocation) {

	startTimer()
	gTimerInterval = setInterval(startTimer, 1000)

	createMines(gBoard, gLevel.mines, firstLocation)
	isFirstClick = false
	setMinesNegCount(gBoard)

	console.log(gBoard)
}

function handleLives() {
	if (gGame.lives === 0) {
		gameOver()
	} else {
		renderMsgHitMine()
		gGame.lives--
	}
	renderLives()
}

//DONE
//Called when a cell is right- clicked See how you can hide the context menu on right click
function onCellMarked(event, i, j) {
	event.preventDefault()
	if (!gGame.isOn || gBoard[i][j].isShown) return

	if (!gBoard[i][j].isMarked) {
		gBoard[i][j].isMarked = true
		gGame.markedCount++
	} else {
		gBoard[i][j].isMarked = false
		gGame.markedCount--
	}

	renderBoard(gBoard)
	checkGameOver()
}

//DONE
//Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {
	if ((gGame.shownCount === gLevel.size ** 2 - gLevel.mines) && (gGame.markedCount === gLevel.mines)) {
		gGame.isVictory = true
		gameOver()
	}

}


function gameOver() {
	gGame.isOn = false
	clearInterval(gTimerInterval)

	if (!gGame.isVictory) {
		revelAllMines()
	}

	const msg = gGame.isVictory ? 'YOU WON' : 'Game Over'
	openModal(msg)

}

//DONE
function revelAllMines() {
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			if (gBoard[i][j].isMine) {
				gBoard[i][j].isShown = true
			}
		}
	}
	renderBoard(gBoard)
}

// When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors. 
//DONE //NOTE: start with a basic implementation that only opens the non-mine 1st degree neighbors
//  BONUS: if you have the time later, try to work more like the real algorithm (see description at the Bonuses section below)
function expandShown(board, elCell, i, j) {

	for (var row = i - 1; row <= i + 1; row++) {
		if (row < 0 || row >= board.length) continue

		for (var col = j - 1; col <= j + 1; col++) {
			if (col < 0 || col >= board[row].length) continue
			if (row === i && col === j) continue

			if (board[row][col].isShown || board[row][col].isMarked) return

			board[row][col].isShown = true
			gGame.shownCount++

			if (board[row][col].minesAroundCount === 0) {
				expandShown(board, row, col)
			}
		}
	}
}


//DONE
function onChangeDifficulty(id) {

	for (var i = 0; i < gLevels.length; i++) {

		if (gLevels[i].id === id) {
			gLevel = gLevels[i]
		}
	}

	clearInterval(gTimerInterval)
	onInit()
}


function renderMsgHitMine() {
	const elMsg = document.querySelector('.lives-msg')
	const strMsg = 'You hit a MINE!!'
	elMsg.innerText = strMsg
}

function renderLives() {
	const elLives = document.querySelector('.lives')
	var strLives = LIVE.repeat(gGame.lives)
	elLives.innerText = strLives
}

function renderMsgSmile() {

}



// utils///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getRandomInt(min, max) {
	const minCeiled = Math.ceil(min);
	const maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}


function countNeighbors(i, j, board) {
	var minesAroundCount = 0

	for (var row = i - 1; row <= i + 1; row++) {
		if (row < 0 || row >= board.length) continue

		for (var col = j - 1; col <= j + 1; col++) {
			if (col < 0 || col >= board[row].length) continue
			if (row === i && col === j) continue
			if (board[row][col].isMine) minesAroundCount++
		}
	}
	return minesAroundCount
}


function openModal(msg) {
	const elModal = document.querySelector('.modal')
	const elMsg = elModal.querySelector('.msg')
	elMsg.innerText = msg
	elModal.style.display = 'block'

}

function closeModal() {
	const elModal = document.querySelector('.modal')
	elModal.style.display = 'none'

}


function startTimer() {

	const elTimer = document.querySelector('.timer')
	const formattedTime = gGame.secsPassed.toString().padStart(3, '0');
	elTimer.innerText = formattedTime
	gGame.secsPassed++

}
