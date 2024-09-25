'use strict'

const MINE = '💣'
const FLAG = '🚩'
const LIVE = '🧡'
const SMILEY_NORMAL = '😃'
const SMILEY_LOSE = '😿'
const SMILEY_WIN = '🥳'

var revealedCells

var isFirstClick
var isHintOn

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

	isFirstClick = true

	renderTimer()
	clearInterval(gTimerInterval)

	renderLives()
	renderMsgSmile(SMILEY_NORMAL)

	isHintOn = false
	renderHints()

	renderSafeClicks()

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

		var randomIdx = getRandomInt(0, Cells.length)
		var cellPos = Cells.splice(randomIdx, 1)[0]

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
		renderCell({ i, j }, FLAG)
	} else {
		gBoard[i][j].isMarked = false
		gGame.markedCount--
		renderCell({ i, j }, '')
	}
}

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

	var cellContent = board[i][j].minesAroundCount > 0 ? board[i][j].minesAroundCount : ''

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

	clearInterval(gTimerInterval)
	onInit()
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
	var strLives = LIVE.repeat(gGame.lives)
	elLives.innerText = strLives
}

function renderMsgSmile(smiley) {
	const elSmiley = document.querySelector('.btn-smiley')
	var strSmiley = smiley
	elSmiley.innerText = strSmiley
}


// utils///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getRandomInt(min, max) {
	const minCeiled = Math.ceil(min)
	const maxFloored = Math.floor(max)
	return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
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

function renderTimer() {
	const elTimer = document.querySelector('.timer')
	const formattedTime = gGame.secsPassed.toString().padStart(3, '0')
	elTimer.innerText = 'Time: ' + formattedTime
	gGame.secsPassed++

}

function renderCell(location, value) {
	const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
	elCell.innerHTML = value

	if (gBoard[location.i][location.j].isShown) {
		elCell.style.backgroundColor = '#689F38'
	}

}


//BOUNS/////////////////////////////////////////////////////////////////////////////////////////

//HINTS//
function onHintClick(elHint) {
	if (gGame.hints > 0 && !isHintOn) {
		isHintOn = true
		gGame.hints--
		elHint.classList.add('hint-active')
		elHint.disabled = true
	}
}

function hintExpandShown(board, i, j) {

	revealedCells = []

	for (var row = i - 1; row <= i + 1; row++) {
		for (var col = j - 1; col <= j + 1; col++) {
			if (row >= 0 && row < board.length && col >= 0 && col < board[0].length) {
				if (!board[row][col].isShown) {
					board[row][col].isShown = true
					revealedCells.push({ row, col })

					var cellContent = checkCellContent(board, row, col)
					renderCell({ i: row, j: col }, cellContent)

				}
			}
		}
	}
}

function checkCellContent(board, row, col) {

	var cellContent = ''
	if (board[row][col].isMine) {
		cellContent = MINE
	} else if (board[row][col].minesAroundCount > 0) {
		cellContent = board[row][col].minesAroundCount
	}
	return cellContent
}

function hintHideShow(board) {

	setTimeout(() => {
		for (var i = 0; i < revealedCells.length; i++) {
			const currCell = revealedCells[i]
			board[currCell.row][currCell.col].isShown = false


			renderCell({ i: currCell.row, j: currCell.col }, '')
			const elCell = document.querySelector(`.cell-${currCell.row}-${currCell.col}`)
			elCell.style.backgroundColor = ''
		}

		isHintOn = false
		const activeHint = document.querySelector('.hint-active')
		activeHint.classList.remove('hint-active')

	}, 1000)
}

function renderHints() {
	const hintButtons = document.querySelectorAll('.btn-hint')
	for (var i = 0; i < hintButtons.length; i++) {
		const button = hintButtons[i]
		button.classList.remove('hint-active')
		button.disabled = false
	}
}

//SAFE CLICK//

function onSafeClick(elSafeClick) {
	if (gGame.safeClick > 0 && gGame.isOn) {
		getSafeClick()
		gGame.safeClick--
		renderSafeClicks()
	}
}

function getSafeClick() {

	const safeCells = getNonMineCells(gBoard)
	if (safeCells.length > 0) {
		var randomIdx = getRandomInt(0, safeCells.length)
		//console.log(safeCells[randomIdx])
		var safeCell = safeCells[randomIdx]
		var cell = gBoard[safeCell.i][safeCell.j]

		//console.log(safecell)

		cell.isShown = true
		var cellContent = cell.minesAroundCount || ''
		renderCell({ i: safeCell.i, j: safeCell.j }, cellContent)

		setTimeout(() => {

			cell.isShown = false

			renderCell({ i: safeCell.i, j: safeCell.j }, '')

			const elCell = document.querySelector(`.cell-${safeCell.i}-${safeCell.j}`)
			elCell.style.backgroundColor = ''

		}, 1000)

	}
}

function getNonMineCells(board) {
	var cells = []

	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			if (!board[i][j].isMine && !board[i][j].isShown && !board[i][j].isMarked) {
				cells.push({ i, j })
			}
		}
	}
	if (!cells.length) return null
	return cells
}

function renderSafeClicks() {
	const elSafeClick = document.querySelector('.btn-safe-click')
	elSafeClick.innerText = 'Safe Clicks: ' + gGame.safeClick
}

//MANUALLY CREATE MINE MODE//



//LIGHT\DARK MODE//

function toggleDarkMode() {
	document.body.classList.toggle('dark-mode')
	localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'))


}
