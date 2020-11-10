
const gameBoard = (() => {
    let _board = new Array(9);
    const getFiled = (num) => _board[num];
    /**
     * Changes the sign of the field to the sign of the player
     * @param {*} num number of field in the array from 0 to 8 sstarting from left top
     * @param {*} player the player who changes the field
     */
    const setFiled = (num, player) => {
        const htmlField = document.querySelector(`.board div:nth-child(${num + 1})`);

        htmlField.textContent = player.getSign();
        _board[num] = player.getSign();
    }
    return {
        getFiled,
        setFiled
    };
})();

const Player = (sign) =>{
    const _sign = sign;
    const getSign = () => _sign;
    const setSign = (sign) =>{
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
        console.log('Choice: ' + choice);
        const field = gameBoard.getFiled(choice);
        if(field != undefined){
            return chooseField();
        }
        return choice;
    
    }
    return {
        chooseField
    }
})();

const gameController = (() =>{
    const _humanPlayer = Player('X');
    const _aiPlayer = Player('O')
    const _aiLogic = randomAiLogic;

    const _sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

    const _checkForRows = () =>{
        for(let i = 0; i < 3; i ++){
            let row = []
            for(let j = i * 3; j < i * 3 + 3; j++){
                row.push(gameBoard.getFiled(j));
            }

            if(row.every(field => field == 'X') || row.every(field => field == 'O')){
                return true;
            }
        }
        return false;
    }

    const _checkForColumns = () =>{
        for(let i = 0; i< 3; i++){
            let column = []
            for(let j = 0; j< 3; j++){
                column.push(gameBoard.getFiled(i + 3 * j));
            }

            if(column.every(field => field == 'X') || column.every(field => field == 'O')){
                return true;
            }
        }
        return false;
    }

    const _checkForDiagonals = () => {
        diagonal1 = [gameBoard.getFiled(0), gameBoard.getFiled(4), gameBoard.getFiled(8)];
        diagonal2 = [gameBoard.getFiled(6), gameBoard.getFiled(4), gameBoard.getFiled(2)];
        if(diagonal1.every(field => field == 'X') || diagonal1.every(field => field == 'O')){
            return true;
        }
        else if(diagonal2.every(field => field == 'X') || diagonal2.every(field => field == 'O')){
            return true;
        }
    }

    const _checkForWin = () => {
        if(_checkForRows() || _checkForColumns() || _checkForDiagonals()){
            return true;
        }
       return false;
    }

    const changeSign = (sign) => {
        if(sign == 'X'){
            _humanPlayer.setSign('X');
            _aiPlayer.setSign('O');
        }
        else if( sign == 'O'){
            _humanPlayer.setSign('O');
            _aiPlayer.setSign('X');
        }
        else throw 'Incorrect sign';
    }

    const playerStep = (num) =>{
        filed = gameBoard.getFiled(num);
        if(filed == undefined){
            gameBoard.setFiled(num, _humanPlayer);
           if(_checkForWin()){
               endGame(_humanPlayer.getSign())
           }
           else{
               (async () => {
                   await _sleep(500 + (Math.random() * 500));
                   aiStep();
               })();
           }
        }
        else{
            console.log('Already Filled')
        }
    }

    const endGame = (sign) => {
        console.log(`The winner is player ${sign}`);
    }

    const aiStep = () =>{
        const num = _aiLogic.chooseField();
        console.log(num);
        gameBoard.setFiled(num, _aiPlayer);
        if(_checkForWin()){
            endGame(_aiPlayer.getSign())
        }
    }

    return {
        changeSign, 
        playerStep,
        endGame
    }
})();

const displayController = (() =>{
    const htmlBoard = Array.from(document.querySelectorAll('.field'));
    for(let i = 0; i< htmlBoard.length; i++){
        field = htmlBoard[i];
        field.addEventListener('click',  gameController.playerStep.bind(field, i));
    }
})();

