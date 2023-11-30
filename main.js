import './style.css'
import { BOARD_HEIGHT, BOARD_WIDTH, BLOCK_SIZE, COLORS, DIRECTION } from './helpers/const'
import { PIECES } from './helpers/pieces'

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const $score = document.querySelector('span')
let score = 0
let dropCounter = 0
let lastTiime = 0

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

context.scale(BLOCK_SIZE, BLOCK_SIZE)

const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)
function createBoard (width, height) {
  return Array(height).fill().map(() => Array(width).fill(0))
}

// piece
const piece = {
  position: { x: 5, y: 5 },
  shape: [
    [1, 1],
    [1, 1]
  ]
}

// game loop
function update (time = 0) {
  const deltaTime = time - lastTiime
  lastTiime = time

  dropCounter += deltaTime
  if (dropCounter > 1000) {
    piece.position.y++
    dropCounter = 0

    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }
  draw()
  window.requestAnimationFrame(update)
}

function draw () {
  context.fillStyle = COLORS[1]
  context.fillRect(0, 0, canvas.width, canvas.height)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = COLORS[4]
        context.fillRect(x, y, 1, 1)
      }
    })
  })

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = COLORS[7]
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1)
      }
    })
  })
  $score.innerText = score
}

document.addEventListener('keydown', event => {
  if (event.key === DIRECTION.left) {
    piece.position.x--
    if (checkCollision()) {
      piece.position.x++
    }
  }
  if (event.key === DIRECTION.right) {
    piece.position.x++
    if (checkCollision()) {
      piece.position.x--
    }
  }
  if (event.key === DIRECTION.down) {
    piece.position.y++
    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }

  if (event.key === DIRECTION.up) {
    const rotated = []
    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = []
      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i])
      }
      rotated.push(row)
    }
    const previous = piece.shape
    piece.shape = rotated
    if (checkCollision()) {
      piece.shape = previous
    }
  }
})

function checkCollision () {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 &&
        board[y + piece.position.y]?.[x + piece.position.x] !== 0
      )
    })
  })
}

function solidifyPiece () {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1
      }
    })
  })
  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
  piece.position.x = Math.floor(board[0].length / 2) - Math.floor(piece.shape[0].length / 2)
  piece.position.y = 0

  if (checkCollision()) {
    window.alert('Game Over')
    board.forEach(row => {
      row.fill(0)
    })
  }
}

function removeRows () {
  const rowsToRemove = []
  board.forEach((row, y) => {
    if (row.every(value => value === 1)) {
      rowsToRemove.push(y)
    }
  })

  rowsToRemove.forEach(y => {
    board.splice(y, 1)
    board.unshift(new Array(14).fill(0))
    score += 10
  })
}

update()
