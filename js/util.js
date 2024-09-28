'use strict'


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

function setMinesNegCount(board) {

	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			if (!board[i][j].isMine) {
				board[i][j].minesAroundCount = countNeighbors(i, j, board)
			}
		}
	}
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

function checkCellContent(board, row, col) {

	var cellContent = ''
	if (board[row][col].isMine) {
		cellContent = MINE

	} else if (board[row][col].minesAroundCount > 0) {
		cellContent = board[row][col].minesAroundCount
	}

	return cellContent
}