var sudoku = (function() {
    'use strict';

    var TOTAL_SQUARE = 81,
        MAX_POS_FIL = 8,
        MAX_POS_COL = 8;

    var BTO_FIX = "btoFix",
        BTO_FIX_SEL = "btoFixSel",
        BTO_EMP = "btoEmp",
        BTO_EMP_SEL = "btoEmpSel",
        BTO_STF_SEL = "btoStfSel",
        BTO_STF = "btoStf",
        BTO_ERR_SEL = "btoErrSel",
        BTO_ERR = "btoErr";
    
    var TXT_BTO_CLEAN_POSITION = "Clean position",
        TXT_BTO_CLN_ALL = "Clean all",
        TXT_BTO_NEW_BOA = "New board";

    var BTO_CLN_ALL = "cleanAll",
        BTO_NEW_BOA = "newBoard",
        BTO_CLEAN_POSITION = "cleanPos";

    var LEVEL_FLASH = 70, //LEVEL_FLASH = 48,
        LEVEL_EASY = 38,
        LEVEL_MEDIUM = 30,
        LEVEL_HARD = 27,
        LEVEL_EXPERT = 24;

    var square = null;
    var board = null;
    var numPieceOk = 0;
    var initVal = null;
    var level;

    var createBoardFromFile = function() {

	initVal = getNewBoard();
	resetBoard();
    };

    var resetBoard = function () {

	board = new Array(MAX_POS_FIL + 1);
	
	for (var i = 0; i < MAX_POS_FIL + 1; i++) {
	    board[i] = new Array(MAX_POS_COL + 1);
	    for (var j = 0; j < MAX_POS_COL + 1; j++) {
		board[i][j] = 0;
		var casilla = document.getElementById(i.toString() + j.toString());
		casilla.attributes.getNamedItem("class").value = BTO_EMP;
		casilla.textContent=0;
	    }
	}
	numPieceOk = 0;
	for (var i= 0, length = initVal.length; i < length; i++) {
	    var nval = initVal[i];
	    var casilla = document.getElementById(initVal[i].substr(0,2));
	    casilla.attributes.getNamedItem("class").value = BTO_FIX;
	    casilla.textContent = initVal[i].substr(2,1);
	    board[initVal[i].substr(0,1)][initVal[i].substr(1,1)] = initVal[i].substr(2,1);
	    numPieceOk = numPieceOk + 1;
	}
    }
	
    var getNewBoard = function() {

	var initBoard = null;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (ex) {
	    if (xhr.readyState === 4) {
		if (xhr.status === 0 || xhr.status === 200) {
		    var datas = JSON.parse(xhr.responseText);
		    //Generar nº aleatorio
		    var nEltos = 0;
		    for (var key in datas) {
			if (datas.hasOwnProperty(key))nEltos++;
		    }
		    var rInf = 1;
		    var ran = Math.floor(Math.random()*(nEltos - rInf)) + parseInt(rInf);
		    initBoard = datas[ran.toString()];
		} else {
		    console.error('Error getting sudoku board.');
		}
	    }
	}				
	xhr.open('GET', 'datas/boards.json',false); //syn
	xhr.responsType = 'text';
	xhr.send(null);
	return initBoard;
    };
    
    var changeSelect =  function (newCeld) {

	changeSelectElto(square,false);
	changeSelectElto(newCeld, true);
	square = newCeld;
    };
    
    var changeSelectElto = function (newCel,sel) {
	if (newCel == null) {
	    return;
	}		
	var f = newCel.attributes.getNamedItem("name").value.substr(0,1);
	var c = newCel.attributes.getNamedItem("name").value.substr(1,1);
	var clsValF;
	var clsValC;
	var clsNewValF;
	var clsNewValC;
	for (var i = 0; i < 9; i++) {
	    clsValF = document.getElementById(f + i.toString()).attributes.getNamedItem("class").value;
	    clsValC = document.getElementById(i.toString() + c).attributes.getNamedItem("class").value;
	    if (sel) {
		clsNewValF = clsValF.substr(0,6) + "Sel";
		clsNewValC = clsValC.substr(0,6) + "Sel";
	    } else {
		clsNewValF = clsValF.substr(0,6);
		clsNewValC = clsValC.substr(0,6);
	    }
	    document.getElementById(f + i.toString()).attributes.getNamedItem("class").value = clsNewValF;
	    document.getElementById(i.toString() + c).attributes.getNamedItem("class").value = clsNewValC;
	}
    };

    function verifyCasilla(casilla, fil, col, board) {
	//Si la casilla era erronea ahora puede ser correcta
	var typeValue = casilla.attributes.getNamedItem("class").value;
	if (typeValue.substr(0,6) === BTO_ERR) {
	    if (isValOk(board[fil][col], board, fil, col)) {
		if (typeValue.length > 6) {
		    casilla.attributes.getNamedItem("class").value = BTO_STF_SEL;
		} else {
		    casilla.attributes.getNamedItem("class").value = BTO_STF;
		}
		numPieceOk = numPieceOk + 1;
	    }
	}	 
    }

    function verifyOthersSquere(board, fil, col) {

	//Verificar que en fila global y columna global algun valor se vuelva correcto
	for (var i = 0; i < 9; i++) {
	    //Comprobar fila y columna de todo el tablero
	    if (col !== i){
		var casilla = document.getElementById("" + fil + i);
		verifyCasilla(casilla, fil, i, board);
	    }
	    if (fil !== i){
		var casilla = document.getElementById("" + i + col);
		verifyCasilla(casilla, i, col, board);
	    }
	}
        //Verificar subtablero 
   	var fBigBoard = Math.floor(fil / 3);
	var fSmallBoard = fil % 3;
	var cBigBoard = Math.floor(col / 3);
	var cSmallBoard = col % 3;
	for (var fa = 0; fa < 3; fa++) {
	    for (var ca = 0; ca < 3; ca++) {
		if (fa !== fSmallBoard && ca !== cSmallBoard){
		    var fa_abs = fBigBoard * 3 + fa;
		    var ca_abs = cBigBoard * 3 + ca;
		    var casilla = document.getElementById("" + fa_abs + ca_abs);
		    verifyCasilla(casilla, fa_abs, ca_abs, board);
		}
	    }
	}
    }

    var setValue = function (newVal) {
	
	if (square == null) {
	    return;
	}
	var clsVal = square.attributes.getNamedItem("class").value;
	switch (clsVal) {
	case BTO_FIX_SEL:
	    break;
	default:
	    if (newVal == TXT_BTO_CLEAN_POSITION) {
		square.textContent = 0;
		//this.square.value = 0;
		square.attributes.getNamedItem("class").value = BTO_EMP_SEL;
		newVal = 0;	  		
		if (isValOk(square.textContent)) {
		    numPieceOk = numPieceOk - 1;
		}
	    } else {
                //Revisar ficha puesta
		if (isValOk(newVal)) {
		    square.attributes.getNamedItem("class").value = BTO_STF_SEL;
		    if (!isValOk(square.textContent)) {
			numPieceOk = numPieceOk + 1;
		    }
		} else {
		    square.attributes.getNamedItem("class").value = BTO_ERR_SEL;	 
		    if (isValOk(square.textContent)) {
			numPieceOk = numPieceOk - 1;
		    }
		}	  			  		
		square.textContent = newVal;
                //Revisar si afecta al resto del tablero
	    }	  		  	
	    var indFicha= square.attributes.getNamedItem("name").value;
	    board[indFicha.substr(0,1)][indFicha.substr(1,1)] = parseInt(newVal);
	    verifyOthersSquere(board, parseInt(square.attributes.getNamedItem("name").value.substr(0,1)), parseInt(square.attributes.getNamedItem("name").value.substr(1,1)));
	    break;
	}
	changeSelectElto(square, false);
	square = null;
    };

    var isValOk = function(newVal, b, fil, col){

	if (newVal < 1 || newVal > 9) {
	    return false;
	}

	var dealBoard = b || board;
	var f = (fil !== undefined? fil: square.attributes.getNamedItem("name").value.substr(0,1));
	var c = (col !== undefined? col: square.attributes.getNamedItem("name").value.substr(1,1));   	
	var ok = true;

	//Verificar que en fila global y columna global no esta ya el nuevo valor
	for (var i = 0; ok && i < 9; i++) {
	    //Comprobar fila y columna de todo el tablero
	    ok = ((c == i || newVal != dealBoard[f][i]) &&
		  (f == i || newVal != dealBoard[i][c]));
	}
	if (ok) {
	    //Comprobar contenido subtablero
	    var fBigBoard = Math.floor(f / 3);
	    var fSmallBoard = f % 3;
	    var cBigBoard = Math.floor(c / 3);
	    var cSmallBoard = c % 3;
	    for (var fa = 0; ok && fa < 3; fa++) {
		for (var ca = 0; ok && ca < 3; ca++) {
		    if (fa !== fSmallBoard && ca !== cSmallBoard){
			ok = dealBoard[fBigBoard*3 + fa][cBigBoard * 3 + ca] != newVal;
		    }
		}
	    }
	}
	return ok;
    };
	
    var setBtoTxt = function() {
	document.getElementById(BTO_CLEAN_POSITION).childNodes[0].nodeValue = TXT_BTO_CLEAN_POSITION;
	document.getElementById(BTO_CLN_ALL).childNodes[0].nodeValue = TXT_BTO_CLN_ALL;
	document.getElementById(BTO_NEW_BOA).childNodes[0].nodeValue = TXT_BTO_NEW_BOA;
    }

    function dameOpciones(){
	var opciones = [];
	var esta = [false, false, false, false, false, false, false, false, false];
	while (opciones.length < 9) {
	    var valor = Math.floor(Math.random()*(10 - 1)) + parseInt(1);
	    if (!esta[valor - 1]){
		opciones.push(valor);
		esta[valor - 1] = true;
	    }
	}
	return opciones;
    }

    function newPosition(posX, posY) {
	var newXY = [posX + 1, posY];
	if (newXY[0] > MAX_POS_FIL) {
	    newXY[0] = 0;
	    newXY[1] = newXY[1] + 1;
	}
	return newXY;
    }

    function solve(board, posX, posY, numSquare) {

	var opciones = dameOpciones(),
	i = -1,
	exito = false;
	do{
	    i++;
	    if (isValOk(opciones[i], board, posX, posY)) {
		board[posX][posY] = opciones[i];
		numSquare++;
		if (numSquare === TOTAL_SQUARE) {
		    exito = true;
		} else {
		    var newXY = newPosition(posX, posY);
		    exito = solve(board, newXY[0], newXY[1], numSquare);
		    if (!exito) {
			board[posX][posY] = 0;
			numSquare--;
		    }
		}
	    }
	}while (!exito && i <  opciones.length - 1);
	return exito;
    }

    function createBoard(level) {

	var tablero =  new Array(MAX_POS_FIL + 1);
	for (var i = 0; i < MAX_POS_FIL + 1; i++){
	    tablero[i] = new Array(MAX_POS_COL + 1);
	    for (var j = 0; j < MAX_POS_COL + 1; j++){
		tablero[i][j] = 0;
	    }
	}
	solve(tablero, 0, 0, 0);
	removeSquaresToLevel(tablero);
	paintBoard(tablero);
    }

    function setLevel(l) {
	level = l || LEVEL_MEDIUM;
    }

    function getLevel(){
	return level || LEVEL_MEDIUM;
    }

    function removeSquaresToLevel(tablero) {

	var fila,
	col;
	var remove = TOTAL_SQUARE - getLevel();

	while (remove > 0) {
	    fila = Math.floor(Math.random()*(9));
	    col = Math.floor(Math.random()*(9));
	    if (tablero[fila][col] !== 0) {
		tablero[fila][col] = 0;
		remove--;
	    }
	}
    }

    function paintBoard(tablero) {

	numPieceOk = 0;
	board = tablero;
	initVal = [];

	for (var i = 0; i < MAX_POS_FIL + 1; i++) {
	    for (var j = 0; j < MAX_POS_COL + 1; j++){
		var id = "" + i + j;
		var casilla = document.getElementById(id);
		casilla.textContent = tablero[i][j];
		if (tablero[i][j] === 0) {
		    casilla.attributes.getNamedItem("class").value = BTO_EMP;
		} else {
		    casilla.attributes.getNamedItem("class").value = BTO_FIX;
		    numPieceOk++;
		    initVal.push("" + i + j + tablero[i][j]);
		}
	    }
	}
    }

    return{
	
	LEVEL_FLASH: LEVEL_FLASH,
	LEVEL_EASY: LEVEL_EASY,
	LEVEL_MEDIUM: LEVEL_MEDIUM,
	LEVEL_HARD: LEVEL_HARD,
	LEVEL_EXPERT: LEVEL_EXPERT,

	init: function(){
	    setBtoTxt();
	    //createBoardFromFile();
	    createBoard();
	    document.removeEventListener('click', this);
	    document.addEventListener('click', this);
	},		

	setLevel: setLevel,
 	
	handleEvent: function sudoku_handleEvent(evt){
	    var target = evt.target;
	    switch (evt.type) {
	    case 'click':
		switch (target.dataset.type) {
		case 'eltoTbl':
		    changeSelect(target); 
		    break;
		case 'ficha':
		    if (target.id == BTO_CLN_ALL) {
			resetBoard();
		    }else if (target.id == BTO_NEW_BOA){
			this.init();
		    }else{
			setValue(target.textContent); 
			if (numPieceOk >= TOTAL_SQUARE){
			    document.getElementById('sudoku-finish').classList.remove('hide');
			}
		    }
		    break;
		default:
		    //De momento ninguno
		    break;
		}
		break;
	    }
	}
    }	
})();


function mostrarTablero(level){
    var seccion = document.getElementById('sudoku-start');
    seccion.setAttribute("class", "hide");
    seccion = document.getElementById('sudoku-menu');
    seccion.attributes.getNamedItem("class").value = "";
    sudoku.setLevel(level);
    sudoku.init();
}

window.addEventListener('load', function sudokuLoad(evt) {
  //window.removeEventListener('load', calcLoad);
    var bto = document.getElementById("levelFlash");
    bto.addEventListener('click',function (evt){
	mostrarTablero(sudoku.LEVEL_FLASH);
    });
    bto = document.getElementById("levelEasy");
    bto.addEventListener('click',function (evt){
	mostrarTablero(sudoku.LEVEL_EASY);
    });
    bto = document.getElementById("levelMedium");
    bto.addEventListener('click',function (evt){
	mostrarTablero(sudoku.LEVEL_MEDIUM);
    });
    bto = document.getElementById("levelHard");
    bto.addEventListener('click',function (evt){
	mostrarTablero(sudoku.LEVEL_HARD);
    });
    bto = document.getElementById("levelExpert");
    bto.addEventListener('click',function (evt){
	mostrarTablero(sudoku.LEVEL_EXPERT);
    });
    bto = document.getElementById("cancel-finish");
    bto.addEventListener('click', function onClick(evt) {
        window.close();
    });
    bto = document.getElementById("close-start");
    bto.addEventListener('click', function onClick(evt) {
        window.close();
    });
    bto = document.getElementById("close-menu");
    bto.addEventListener('click', function onClick(evt) {
        window.close();
    });
});



