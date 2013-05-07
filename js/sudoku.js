var sudoku = (function() {

  'use strict';

  var BTO_FIX = "btoFix",
      BTO_EMP = "btoEmp",
      BTO_FIX_SEL = "btoFixSel",
      BTO_EMP_SEL = "btoEmpSel",
      BTO_FIX_STF_SEL = "btoStfSel",
      BTO_ERR_SEL = "btoErrSel";
  
  var TXT_BTO_CLEAN_POSITION = "Clean position",
      TXT_BTO_CLN_ALL = "Clean all",
      TXT_BTO_NEW_BOA = "New board";

  var BTO_CLN_ALL = "cleanAll",
      BTO_NEW_BOA = "newBoard",
      BTO_CLEAN_POSITION = "cleanPos";

  var square = null;
  var board = null;
  var numPieceOk = 0;
  var initVal = null;

  var createBoard = function(inVal) {

    initVal = inVal;

    board = new Array(9);
		
    for (var i = 0; i < 9; i++) {
      board[i] = new Array(9);
      for (var j = 0; j < 9; j++) {
        board[i][j] = 0;
        var casilla = document.getElementById(i.toString() + j.toString());
        casilla.attributes.getNamedItem("class").value = BTO_EMP;
        casilla.textContent=0;
      }
    }
    numPieceOk = 0;
    for (var i= 0; i < initVal.length; i++) {
      var nval = initVal[i];
      var casilla = document.getElementById(initVal[i].substr(0,2));
      casilla.attributes.getNamedItem("class").value = BTO_FIX;
      casilla.textContent = initVal[i].substr(2,1);
      board[initVal[i].substr(0,1)][initVal[i].substr(1,1)] = initVal[i].substr(2,1);
      numPieceOk = numPieceOk + 1;
    }
  };
	
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
        //if (this.isValOk(this.square.value)){
        if (isValOk(square.textContent)) {
          numPieceOk = numPieceOk - 1;
        }
      } else {
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
      }	  		  	
      var indFicha= square.attributes.getNamedItem("name").value;
      board[indFicha.substr(0,1)][indFicha.substr(1,1)] = newVal;
      break;
    }
    changeSelectElto(square, false);
    square = null;
  };

  var isValOk = function(newVal){

    if (newVal < 1 || newVal > 9) {
      return false;
    }

    var ok = true;
    var f = square.attributes.getNamedItem("name").value.substr(0,1);
    var c = square.attributes.getNamedItem("name").value.substr(1,1);
    //Verificar que en fila global y columna global no esta ya el nuevo valor
    for (var i = 0; ok && i < 9; i++) {
      //Comprobar fila y columna de todo el tablero
      ok = ((c == i || newVal != document.getElementById(f + i.toString()).textContent) &&
           (f == i || newVal != document.getElementById(i.toString() + c).textContent));						
    }
    if (ok) {
      //Comprobar contenido subtablero
      var fBigBoard = Math.floor(f / 3);
      var fSmallBoard = f % 3;
      var cBigBoard = Math.floor(c / 3);
      var cSmallBoard = c % 3;
      for (var fa = 0; ok && fa < 3; fa++) {
        for (var ca = 0; ok && ca < 3; ca++) {
          if (fa != fSmallBoard && ca != cSmallBoard){
            ok = board[fBigBoard*3 + fa][cBigBoard * 3 + ca] != newVal;
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
  
  return{
    
    init: function(){
      setBtoTxt();
      var initVal = getNewBoard();
      createBoard(initVal);
      document.removeEventListener('click', this);
      document.addEventListener('click', this);
    },		
 	  
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
            createBoard(initVal);
          }else if (target.id == BTO_NEW_BOA){
            this.init();
          }else{
            setValue(target.textContent); 
            if (numPieceOk >= 81){
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

window.addEventListener('load', function sudokuLoad(evt) {
  //window.removeEventListener('load', calcLoad);
  sudoku.init();
});



