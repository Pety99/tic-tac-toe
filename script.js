
const gameBoard = (() => {
    let _board = new Array(9);
    const getFiled = (num) => _board[num];
    /**
     * Changes the sign of the field to the sign of the player
     * @param {*} num number of field in the array from 0 to 8 sstarting from left top
     * @param {*} player the player who changes the field
     */
    const setFiled = (num, player) => {
        const htmlField = document.querySelector(`.board button:nth-child(${num + 1})`);

        htmlField.textContent = player.getSign();
        _board[num] = player.getSign();
    }

    const clear = () => {
        for (let i = 0; i < _board.length; i++) {
            _board[i] = undefined;
        }
    }
    return {
        getFiled,
        setFiled,
        clear
    };
})();

const Player = (sign) => {
    let _sign = sign;
    const getSign = () => _sign;
    const setSign = (sign) => {
        _sign = sign;
    }
    return {
        getSign,
        setSign
    }
}

const randomAiLogic = (() => {
    const chooseField = () => {
        const choice = Math.floor(Math.random() * 9);
        const field = gameBoard.getFiled(choice);
        if (field != undefined) {
            return chooseField();
        }
        return choice;

    }
    return {
        chooseField
    }
})();

const gameController = (() => {
    const _humanPlayer = Player('X');
    const _aiPlayer = Player('O')
    const _aiLogic = randomAiLogic;

    const _sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const _checkForRows = () => {
        for (let i = 0; i < 3; i++) {
            let row = []
            for (let j = i * 3; j < i * 3 + 3; j++) {
                row.push(gameBoard.getFiled(j));
            }

            if (row.every(field => field == 'X') || row.every(field => field == 'O')) {
                return true;
            }
        }
        return false;
    }

    const _checkForColumns = () => {
        for (let i = 0; i < 3; i++) {
            let column = []
            for (let j = 0; j < 3; j++) {
                column.push(gameBoard.getFiled(i + 3 * j));
            }

            if (column.every(field => field == 'X') || column.every(field => field == 'O')) {
                return true;
            }
        }
        return false;
    }

    const _checkForDiagonals = () => {
        diagonal1 = [gameBoard.getFiled(0), gameBoard.getFiled(4), gameBoard.getFiled(8)];
        diagonal2 = [gameBoard.getFiled(6), gameBoard.getFiled(4), gameBoard.getFiled(2)];
        if (diagonal1.every(field => field == 'X') || diagonal1.every(field => field == 'O')) {
            return true;
        }
        else if (diagonal2.every(field => field == 'X') || diagonal2.every(field => field == 'O')) {
            return true;
        }
    }

    const _checkForWin = () => {
        if (_checkForRows() || _checkForColumns() || _checkForDiagonals()) {
            return true;
        }
        return false;
    }

    const _checkForDraw = () => {
        console.log("Checking for draw");
        for (let i = 0; i < 9; i++) {
            const field = gameBoard.getFiled(i);
            if (field == undefined) {
                console.log(i);
                return false;
            }
        }
        return true;
    }

    const changeSign = (sign) => {
        if (sign == 'X') {
            _humanPlayer.setSign('X');
            _aiPlayer.setSign('O');
        }
        else if (sign == 'O') {
            _humanPlayer.setSign('O');
            _aiPlayer.setSign('X');
        }
        else throw 'Incorrect sign';
    }

    const playerStep = (num) => {
        filed = gameBoard.getFiled(num);
        if (filed == undefined) {
            gameBoard.setFiled(num, _humanPlayer);
            if (_checkForWin()) {
                endGame(_humanPlayer.getSign());
            }
            else if (_checkForDraw()) {
                endGame("Draw");
            }
            else {
                displayController.deactivate();
                (async () => {
                    await _sleep(500 + (Math.random() * 500));
                    aiStep();
                    displayController.activate();
                })();
            }
        }
        else {
            console.log('Already Filled')
        }
    }

    const endGame = (sign) => {
        if (sign == "Draw") {
            //TODO display draw
            console.log("Its a draw");
        }
        else {
            //TODO display win
            console.log(`The winner is player ${sign}`);
        }
        displayController.deactivate();
    }

    const aiStep = () => {
        const num = _aiLogic.chooseField();
        gameBoard.setFiled(num, _aiPlayer);
        if (_checkForWin()) {
            endGame(_aiPlayer.getSign())
        }
        else if (_checkForDraw()) {
            endGame("Draw");
        }
    }

    const restart = () => {
        gameBoard.clear();
        displayController.clear();
        if(_humanPlayer.getSign() =='O'){
            aiStep();
        }
        console.log('restart');
        displayController.activate();
    }

    return {
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
        console.log(value);
        gameController.restart();
    }

    const _changePlayerSign = (sign) =>{
        gameController.changeSign(sign);
        gameController.restart();
    }

    const clear = () =>{
        htmlBoard.forEach(field => {
            field.textContent = '';
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

    const _init = (() =>{
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
        clear
    }
})();

