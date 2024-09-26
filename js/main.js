'use strict'

const MINE = '💣'
const FLAG = '🚩'
const LIVE = '🧡'
const SMILEY_NORMAL = '😃'
const SMILEY_LOSE = '😿'
const SMILEY_WIN = '🥳'

var gRevealedCells

var isFirstClick
var isHintOn
var isExterminatorOn

var gTimerInterval

var gBoard
const gLevels = [
	{ id: 1, size: 4, mines: 2 },
	{ id: 2, size: 8, mines: 14 },
	{ id: 3, size: 12, mines: 32 },
]
var gLevel = gLevels[0]
var gGame = {
	isOn: false,
	isVictory: false,
	shownCount: 0,
	markedCount: 0,
	remainingMines: 0,
	secsPassed: 0,
	lives: 3,
	hints: 3,
	safeClick: 3,
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
	gGame.hints = 3
	gGame.safeClick = 3
	gGame.remainingMines = gLevel.mines

	isFirstClick = true

	renderTimer()
	clearInterval(gTimerInterval)

	renderRemainingMines()
	renderLives()
	renderMsgSmile(SMILEY_NORMAL)

	isHintOn = false
	renderHints()

	renderSafeClicks()

	isExterminatorOn = false

	renderExterminator()

	closeModal()
}

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

	console.log(board)
	return board
}

function renderBoard(board) {

	var strHTML = ''
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>';
		for (var j = 0; j < board[i].length; j++) {

			const className = `cell cell-${i}-${j}`

			strHTML += `<td class="${className}" 
			onclick="onCellClicked(this, ${i}, ${j})" 
			oncontextmenu="onCellMarked(event, ${i}, ${j})">
            </td>`

		}
		strHTML += '</tr>'
	}

	var elContainer = document.querySelector('.board');
	elContainer.innerHTML = strHTML;
}

function createMines(board, minesNumber, firstLocation) {

	const Cells = []
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			Cells.push({ i: i, j: j })
		}
	}

	for (var i = 0; i < minesNumber; i++) {

		const randomIdx = getRandomInt(0, Cells.length)
		const cellPos = Cells.splice(randomIdx, 1)[0]

		if (cellPos.i !== firstLocation.i && cellPos.j !== firstLocation.j) {
			board[cellPos.i][cellPos.j].isMine = true
		} else {
			i--
		}
	}
}

function setMinesNegCount(board) {

	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			if (!board[i][j].isMine) {
				board[i][j].minesAroundCount = countNeighbors(i, j, board)
			}
		}
	}
}

function onCellClicked(elCell, i, j) {

	if (!gGame.isOn || gBoard[i][j].isShown || gBoard[i][j].isMarked) return

	if (isFirstClick) {
		handleFirstClick({ i, j })
	}

	if (isHintOn) {
		hintExpandShown(gBoard, i, j)
		hintHideShow(gBoard)
		return
	}

	if (gBoard[i][j].isMine) {
		handleLives()

	} else {
		expandShown(gBoard, i, j)
	}

	checkGameOver()
}

function handleFirstClick(firstLocation) {

	renderTimer()
	gTimerInterval = setInterval(renderTimer, 1000)

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

function onCellMarked(event, i, j) {

	event.preventDefault()

	if (!gGame.isOn || gBoard[i][j].isShown) return

	if (!gBoard[i][j].isMarked) {
		gBoard[i][j].isMarked = true
		gGame.markedCount++
		gGame.remainingMines--
		renderCell({ i, j }, FLAG)

	} else {
		gBoard[i][j].isMarked = false
		gGame.markedCount--
		gGame.remainingMines++
		renderCell({ i, j }, '')
	}
	renderRemainingMines()
}

function checkGameOver() {

	if (gGame.shownCount === gLevel.size ** 2 - gLevel.mines) {
		gGame.isVictory = true
		gameOver()
	}
}

function gameOver() {

	gGame.isOn = false

	clearInterval(gTimerInterval)

	if (!gGame.isVictory) {
		revelAllMines()
		renderMsgSmile(SMILEY_LOSE)
	} else {
		renderMsgSmile(SMILEY_WIN)
	}

	const msg = gGame.isVictory ? 'YOU WON' : 'Game Over'
	openModal(msg)
}

function revelAllMines() {

	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			if (gBoard[i][j].isMine) {
				gBoard[i][j].isShown = true
				renderCell({ i, j }, MINE)
			}
		}
	}
}

function expandShown(board, i, j) {

	if (i < 0 || i >= board.length || j < 0 || j >= board[0].length) return
	if (board[i][j].isShown || board[i][j].isMarked) return

	board[i][j].isShown = true
	gGame.shownCount++

	const cellContent = checkCellContent(gBoard, i, j)
	renderCell({ i, j }, cellContent)

	if (board[i][j].minesAroundCount === 0) {

		for (var row = i - 1; row <= i + 1; row++) {
			for (var col = j - 1; col <= j + 1; col++) {
				expandShown(board, row, col)
			}
		}
	}
}

function onChangeDifficulty(id) {

	for (var i = 0; i < gLevels.length; i++) {
		if (gLevels[i].id === id) {
			gLevel = gLevels[i]
		}
	}
	onInit()
}

function renderRemainingMines() {
	const elRemainingMines = document.querySelector('.remaining-mines')
	elRemainingMines.innerText = `💣 ${gGame.remainingMines}`
}

function renderMsgHitMine() {

	const elMsg = document.querySelector('.lives-msg')
	const strMsg = 'YOU HIT A 💣😱💥'
	elMsg.innerText = strMsg

	setTimeout(() => {
		const elMsg = document.querySelector('.lives-msg')
		const strMsg = ''
		elMsg.innerText = strMsg
	}, 1000)
}

function renderLives() {
	const elLives = document.querySelector('.lives')
	const strLives = LIVE.repeat(gGame.lives)
	elLives.innerText = strLives
}

function renderMsgSmile(smiley) {
	const elSmiley = document.querySelector('.btn-smiley')
	const strSmiley = smiley
	elSmiley.innerText = strSmiley
}