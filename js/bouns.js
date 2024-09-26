'use strict'

var gRevealedCells

//HINTS//
function onHintClick(elHint) {

	if (gGame.hints < 0 || isHintOn) return

	isHintOn = true
	gGame.hints--

	elHint.disabled = true
	elHint.classList.add('hint-active')
}

function hintExpandShown(board, i, j) {

	gRevealedCells = []
	for (var row = i - 1; row <= i + 1; row++) {
		for (var col = j - 1; col <= j + 1; col++) {
			if (row >= 0 && row < board.length && col >= 0 && col < board[0].length) {
				if (!board[row][col].isShown) {
					board[row][col].isShown = true
					gRevealedCells.push({ row, col })

					const cellContent = checkCellContent(board, row, col)
					renderCell({ i: row, j: col }, cellContent)
				}
			}
		}
	}
}

function hintHideShow(board) {

	setTimeout(() => {
		for (var i = 0; i < gRevealedCells.length; i++) {
			const currCell = gRevealedCells[i]
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

		button.disabled = false
		button.classList.remove('hint-active')
	}
}

//SAFE CLICK//
function onSafeClick(elSafeClick) {

	if (!gGame.isOn || gGame.safeClick === 0 || isFirstClick) return

	getSafeClick()
	gGame.safeClick--
	renderSafeClicks()
}

function getSafeClick() {

	const safeCells = getNonMineCells(gBoard)

	const randomIdx = getRandomInt(0, safeCells.length)

	const safeCell = safeCells[randomIdx]
	const cell = gBoard[safeCell.i][safeCell.j]

	cell.isShown = true

	const cellContent = checkCellContent(gBoard, safeCell.i, safeCell.j)
	renderCell({ i: safeCell.i, j: safeCell.j }, cellContent)

	setTimeout(() => {

		cell.isShown = false

		renderCell({ i: safeCell.i, j: safeCell.j }, '')

		const elCell = document.querySelector(`.cell-${safeCell.i}-${safeCell.j}`)
		elCell.style.backgroundColor = ''

	}, 1000)
}

function getNonMineCells(board) {

	const cells = []
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

//LIGHT\DARK MODE//
function toggleDarkMode() {
	document.body.classList.toggle('dark-mode')
	localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'))
}
