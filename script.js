
/**
 * This module stores the game board information
 */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

const gameBoard = (() => {
    let _board = new Array(9);
    const getField = (num) => _board[num];
    /**
     * Changes the sign of the field to the sign of the player
     * @param {*} num number of field in the array from 0 to 8 sstarting from left top
     * @param {*} player the player who changes the field
     */
    const setField = (num, player) => {
        const htmlField = document.querySelector(`.board button:nth-child(${num + 1}) p`);
        htmlField.classList.add('puff-in-center');
        htmlField.textContent = player.getSign();
        _board[num] = player.getSign();
    }

    const setFieldForAiLogic = (num, player) => {
        if (player == undefined) {
            _board[num] = undefined;
            return;
        }
        _board[num] = player.getSign();
    }

    const getEmptyFieldsIdx = () => {
        fields = [];
        for (let i = 0; i < _board.length; i++) {
            const field = _board[i];
            if (field == undefined) {
                fields.push(i);
            }
        }
        return fields;
    }

    const clear = () => {
        for (let i = 0; i < _board.length; i++) {
            _board[i] = undefined;
        }
    }
    return {
        getField,
        getEmptyFieldsIdx,
        setField,
        setFieldForAiLogic,
        clear
    };
})();

const Player = (sign) => {
    let _sign = sign;
    const getSign = () => _sign;
    const setSign = (sign, active) => {
        _sign = sign;
        const p = document.querySelector(`.btn-p.${sign.toLowerCase()}`);
        if(active){
            p.classList.add('selected');
            p.classList.remove('not-selected');
        }
        else{
            p.classList.remove('selected');
            p.classList.add('not-selected');
        }
    }
    return {
        getSign,
        setSign
    }
}

const minimaxAiLogic = ((percentage) => {

    let aiPrecision = percentage;

    const setAiPercentage = (percentage) => {
        aiPrecision = percentage;
    }
    const getAiPercentage = () => {
        return aiPrecision;
    }

    /**
     * Chooses the next filed for the AI Player.
     * The AI player has an 'aiPercentage' value, this function chooses the best move proportionate to that value,
     * and chooses a random move the rest of the time.
     * For example if the 'aiPercentage' is 64 then the probability of the best move is 0.64 and the probability of a random move is 0.34
     */
    const chooseField = () => {

        //random number between 0 and 100
        const value = Math.floor(Math.random() * (100 + 1));

        // if the random number is smaller then the ais threshold, it findds the best move
        let choice = null;
        if (value <= aiPrecision) {
            console.log('bestChoice');
            choice = minimax(gameBoard, gameController.getAiPlayer()).index
            const field = gameBoard.getField(choice);
            if (field != undefined) {
                return "error"
            }
        }
        else {
            console.log('NotbestChoice');
            const emptyFieldsIdx = gameBoard.getEmptyFieldsIdx();
            let noBestMove = Math.floor(Math.random() * emptyFieldsIdx.length);
            choice = emptyFieldsIdx[noBestMove];
        }
        return choice;
    }


    const findBestMove = (moves, player) => {
        let bestMove;
        if (player === gameController.getAiPlayer()) {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        return moves[bestMove];

    }

    /**
     * Returns an object which includes the 'index' and the 'score' of the next best move
     * @param {gameBoard} newBoard - call it with the gameBoard
     * @param {player} player - call it with the AI player
     */
    const minimax = (newBoard, player) => {

        let empty = newBoard.getEmptyFieldsIdx();

        if (gameController.checkForDraw(newBoard)) {
            return {
                score: 0
            };
        }
        else if (gameController.checkForWin(newBoard)) {

            if (player.getSign() == gameController.getHumanPlayer().getSign()) {
                return {
                    score: 10
                };
            }
            else if (player.getSign() == gameController.getAiPlayer().getSign()) {
                return {
                    score: -10
                };
            }
        }

        let moves = [];

        for (let i = 0; i < empty.length; i++) {
            let move = {};
            move.index = empty[i];

            //Change the field value to the sign of the player
            newBoard.setFieldForAiLogic(empty[i], player);

            //Call the minimax with the opposite player
            if (player.getSign() == gameController.getAiPlayer().getSign()) {
                let result = minimax(newBoard, gameController.getHumanPlayer());
                move.score = result.score;
            }
            else {
                let result = minimax(newBoard, gameController.getAiPlayer());
                move.score = result.score;
            }

            //Reset the filed value set before
            newBoard.setFieldForAiLogic(empty[i], undefined);

            moves.push(move);
        }

        //find the best move
        return findBestMove(moves, player);

    }
    return {
        minimax,
        chooseField,
        getAiPercentage,
        setAiPercentage
    }
})(0);




const gameController = (() => {
    const _humanPlayer = Player('X');
    const _aiPlayer = Player('O')
    const _aiLogic = minimaxAiLogic;

    const getHumanPlayer = () => _humanPlayer;
    const getAiPlayer = () => _aiPlayer;

    const _sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Checks if a player has filled a row.
     * If someone filled a row it returns true, else it returns false.
     * @param {gameBoard} board - call with the gameBoard
     */
    const _checkForRows = (board) => {
        for (let i = 0; i < 3; i++) {
            let row = []
            for (let j = i * 3; j < i * 3 + 3; j++) {
                row.push(board.getField(j));
            }

            if (row.every(field => field == 'X') || row.every(field => field == 'O')) {
                return true;
            }
        }
        return false;
    }

   /**
     * Checks if a player has filled a column.
     * If someone filled a column it returns true, else it returns false.
     * @param {gameBoard} board - call with the gameBoard
     */
    const _checkForColumns = (board) => {
        for (let i = 0; i < 3; i++) {
            let column = []
            for (let j = 0; j < 3; j++) {
                column.push(board.getField(i + 3 * j));
            }

            if (column.every(field => field == 'X') || column.every(field => field == 'O')) {
                return true;
            }
        }
        return false;
    }


    /**
     * Checks if a player has filled a diagonal.
     * If someone filled a diagonal it returns true, else it returns false.
     * @param {gameBoard} board - call with the gameBoard
     */
    const _checkForDiagonals = (board) => {
        diagonal1 = [board.getField(0), board.getField(4), board.getField(8)];
        diagonal2 = [board.getField(6), board.getField(4), board.getField(2)];
        if (diagonal1.every(field => field == 'X') || diagonal1.every(field => field == 'O')) {
            return true;
        }
        else if (diagonal2.every(field => field == 'X') || diagonal2.every(field => field == 'O')) {
            return true;
        }
    }

    const checkForWin = (board) => {
        if (_checkForRows(board) || _checkForColumns(board) || _checkForDiagonals(board)) {
            return true;
        }
        return false;
    }

    /**
     * Checks if the game is a draw.
     * If its a draw it returns true, else it returns false.
     * @param {gameBoard} board 
     */
    const checkForDraw = (board) => {
        if (checkForWin(board)) {
            return false;
        }
        for (let i = 0; i < 9; i++) {
            const field = board.getField(i);
            if (field == undefined) {
                return false;
            }
        }
        return true;
    }

    /**
     * changes the sign of the Human player to 'sing' and the AI players to the other sign.
     * @param {string} sign - 'X' or 'O'
     */
    const changeSign = (sign) => {
        if (sign == 'X') {
            _humanPlayer.setSign('X', true);
            _aiPlayer.setSign('O');
        }
        else if (sign == 'O') {
            _humanPlayer.setSign('O', true);
            _aiPlayer.setSign('X');
        }
        else throw 'Incorrect sign';
    }

    /**
     * Steps the player to the field, and checks if the game has come to an end.
     * If the game if finished it disables the buttons.
     * @param {int} num - the index of the field which the player clicked
     */
    const playerStep = (num) => {
        const field = gameBoard.getField(num);
        if (field == undefined) {
            gameBoard.setField(num, _humanPlayer);
            if (checkForWin(gameBoard)) {
                (async () => {
                    await _sleep(500 + (Math.random() * 500));
                    endGame(_humanPlayer.getSign());
                })();  
            }
            else if (checkForDraw(gameBoard)) {
                (async () => {
                    await _sleep(500 + (Math.random() * 500));
                    endGame("Draw");
                })();  
            }
            else {
                displayController.deactivate();
                (async () => {
                    await _sleep(250 + (Math.random() * 300));
                    aiStep();
                    if (!checkForWin(gameBoard)) {
                        displayController.activate();
                    }
                })();
            }
        }
        else {
            console.log('Already Filled')
        }
    }

    
    /**
     * 
     * @param {*} sign 
     */
    const endGame = function(sign){

        const card = document.querySelector('.card');
        card.classList.remove('unblur');
        card.classList.add('blur');

        const winElements = document.querySelectorAll('.win p')

        if (sign == "Draw") {
            winElements[3].classList.remove('hide');
            console.log("Its a draw");
        }
        else {
            console.log(`The winner is player ${sign}`);
            winElements[0].classList.remove('hide');
            if(sign.toLowerCase() == 'x'){
                winElements[1].classList.remove('hide');
            }
            else{
                winElements[2].classList.remove('hide');
            }
        }
        console.log('deactivate');
        displayController.deactivate();
        displayController.makeBodyRestart();
    }

    /**
     * Steps the AI.
     */
    const aiStep = () => {
        const num = _aiLogic.chooseField();
        gameBoard.setField(num, _aiPlayer);
        if (checkForWin(gameBoard)) {
            (async () => {
                await _sleep(500 + (Math.random() * 500));
                endGame(_aiPlayer.getSign())
            })();  
            
        }
        else if (checkForDraw(gameBoard)) {
            (async () => {
                await _sleep(500 + (Math.random() * 500));
                endGame("Draw");
            })();  
        }
    }

    /**
     * Restarts the game.
     */
    const restart = async function () {

        const card = document.querySelector('.card');
        const winElements = document.querySelectorAll('.win p');

        card.classList.add('unblur');

        gameBoard.clear();
        displayController.clear();
        if (_humanPlayer.getSign() == 'O') {
            aiStep();
        }
        console.log('restart');
        console.log(minimaxAiLogic.getAiPercentage());
        displayController.activate();

   
        card.classList.remove('blur');
      
        winElements.forEach(element => {
            element.classList.add('hide');
        });
        document.body.removeEventListener('click', gameController.restart);

    }

    return {
        getHumanPlayer,
        getAiPlayer,
        checkForWin,
        checkForDraw,
        changeSign,
        playerStep,
        endGame,
        restart
    }
})();

const displayController = (() => {
    const htmlBoard = Array.from(document.querySelectorAll('button.field'));
    const form = document.querySelector('.form');
    const restart = document.querySelector('.restart');
    const x = document.querySelector('.x');
    const o = document.querySelector('.o');

    const _changeAI = () => {
        const value = document.querySelector('#levels').value;
        if (value == 'easy') {
            minimaxAiLogic.setAiPercentage(0);
        }
        else if (value == 'medium') {
            minimaxAiLogic.setAiPercentage(75);
        }
        else if (value == 'hard') {
            minimaxAiLogic.setAiPercentage(90);
        }
        else if (value == 'unbeatable') {
            minimaxAiLogic.setAiPercentage(100);
        }
        gameController.restart();
    }

    const _changePlayerSign = (sign) => {
        gameController.changeSign(sign);
        gameController.restart();
    }

    const clear = () => {
        htmlBoard.forEach(field => {
            const p = field.childNodes[0];
            p.classList = [];
            p.textContent = '';
        });
    }


    const deactivate = () => {
        htmlBoard.forEach(field => {
            field.setAttribute('disabled', '');
        });
    }

    const activate = () => {
        htmlBoard.forEach(field => {

            field.removeAttribute('disabled');
        });
    }

    const makeBodyRestart = () =>{
        const body = document.querySelector('body');
        body.addEventListener('click', gameController.restart);
        
    }

    const _init = (() => {
        for (let i = 0; i < htmlBoard.length; i++) {
            field = htmlBoard[i];
            field.addEventListener('click', gameController.playerStep.bind(field, i));
        }

        form.addEventListener('change', _changeAI);

        restart.addEventListener('click', gameController.restart);

        x.addEventListener('click', _changePlayerSign.bind(this, 'X'));

        o.addEventListener('click', _changePlayerSign.bind(this, 'O'));
    })();

    return {
        deactivate,
        activate,
        clear,
        makeBodyRestart
    }
})();

// To highlight the box at start
gameController.changeSign('X')
