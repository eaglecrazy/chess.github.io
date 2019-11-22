/*jslint devel: true, plusplus: true, vars: true, white: true*/
/*eslint-env browser*/
/*eslint no-console: 0*/
//"use strict";

function random(min, max) {
    "use strict";
    return parseInt(Math.random() * (max - min) + min, 10);
}

//объект с фигурами в юникоде
var nameOfPiece = {
    wKing: '&#9812;',
    wQueen: '&#9813;',
    wRook: '&#9814;',
    wBishop: '&#9815;',
    wKnight: '&#9816;',
    wPawn: '&#9817;',

    bKing: '&#9818;',
    bQueen: '&#9819;',
    bRook: '&#9820;',
    bBishop: '&#9821;',
    bKnight: '&#9822;',
    bPawn: '&#9823;'
};

//табло    
var info = {
    turnW: 'Ходят белые.',
    turnB: 'Ходят чёрные.',
    checkW: 'Шах! Ходят белые.',
    checkB: 'Шах! Ходят чёрные.',
    winW: 'Мат! Выиграли белые.',
    winB: 'Мат! Выиграли чёрные.',
    winWP: 'Пат! Выиграли белые.',
    winBP: 'Пат! Выиграли чёрные.',
    table: document.querySelector('.info'),
    turn: true,
    cW: function () {
        "use strict";
        this.table.innerText = this.checkW;
    },
    cB: function () {
        "use strict";
        this.table.innerText = this.checkB;
    },
    wW: function () {
        "use strict";
        this.table.innerText = this.winW;
    },
    wB: function () {
        "use strict";
        this.table.innerText = this.winB;
    },
    wWP: function () {
        "use strict";
        this.table.innerText = this.winWP;
    },
    wBP: function () {
        "use strict";
        this.table.innerText = this.winBP;
    },
    none: function () {
        "use strict";
        this.table.innerText = '';
    },
    changeTurn: function () {
        "use strict";
        if (this.turn) {
            this.table.innerText = this.turnW;
        } else {
            this.table.innerText = this.turnB;
        }
        this.turn = !this.turn;
    },
    start : function () {
        "use strict";
        this.table.classList.remove('infoText');
    }
};

function IiMoves(c, m) {
    "use strict";
    this.current = c;
    this.move = m;
}

//конструктор клетки
function Cell(l, n) {
    "use strict";
    this.letter = l;
    this.number = n;
    this.piece = undefined;
}

//конструктор объекта для хранения числовых значений ключей (принимает клетку с данными)
function KeysToNumbers(cell) {
    "use strict";
    switch (cell.letter) {
        case 'a':
            this.x = 1;
            break;
        case 'b':
            this.x = 2;
            break;
        case 'c':
            this.x = 3;
            break;
        case 'd':
            this.x = 4;
            break;
        case 'e':
            this.x = 5;
            break;
        case 'f':
            this.x = 6;
            break;
        case 'g':
            this.x = 7;
            break;
        case 'h':
            this.x = 8;
            break;
    }
    this.y = parseInt(cell.number[1], 10);
}

//конструктор фигуры
function Piece(c, n) {
    "use strict";
    this.color = c;
    this.name = n;
}

//объект лог с ходами
var log = {
    stackCells: [],
    logTable: document.querySelector('.log'),

    add: function (a, b) {
        "use strict";
        //добавим информацию в панель лога
        var aY = a.number[1];
        var aX = a.letter.toUpperCase();
        var bY = b.number[1];
        var bX = b.letter.toUpperCase();
        var str = aX + aY + ' - ' + bX + bY;
        var span = document.createElement('span');
        span.classList.add('logSpan');
        span.innerText = str;
        this.logTable.prepend(span);

        //сделаем копии клеток с фигурами и запихнём в стек
        var copyA = this.copyCell(a);
        var copyB = this.copyCell(b);
        var turn = {
            a: copyA,
            b: copyB
        };
        this.stackCells.push(turn);
    },

    addCheck: function () {
        "use strict";
        this.stackCells[this.stackCells.length - 1].check = true;
    },

    addFirst: function (value) {
        "use strict";
        this.stackCells[this.stackCells.length - 1].first = value;
    },

    addRoque: function (corner) {
        "use strict";
        this.stackCells[this.stackCells.length - 1].roque = corner;
    },

    remove: function () {
        "use strict";
        //уберём первый спан в логе
        var span = this.logTable.querySelector('span:first-child');
        if (!span) {
            return;
        }
        span.parentNode.removeChild(span);
        //вернём сохранённые ячейки
        var turn = this.stackCells.pop();
        return turn;
    },

    copyCell: function (cell) {
        "use strict";
        var newCell = new Cell(cell.letter, cell.number);
        if (cell.piece !== undefined) {
            newCell.piece = new Piece(cell.piece.color, cell.piece.name);
        }
        return newCell;
    },

    clear: function () {
        "use strict";
        this.logTable.innerHTML = '';
        this.stackCells = [];
    }
};

//объект доска
var board = {
    grid: {},
    HvC: false,
    number: undefined,
    lastCell: undefined,
    lastActiveCell: undefined,
    lastActiveDataCell: undefined,
    lastPaintedCells: undefined,
    bottomKingNotMove: true,
    bottomLeftRookNotMove: true,
    bottomRightRookNotMove: true,
    topKingNotMove: true,
    topLeftRookNotMove: true,
    topRightRookNotMove: true,
    whiteTurn: true, //ход белых
    bottomTurn: true, //по умолчанию белые внизу
    сheck: false,
    mate: false,
    checkCell: undefined,
    toKingClick: false,
    notKingClick: false,
    pawnAttackCheck: false,
    title: undefined,
    start: false,

    //изменение хода
    changeTurn: function () {
        "use strict";
        this.whiteTurn = !this.whiteTurn;
        this.bottomTurn = !this.bottomTurn;
    },

    //сброс свойств к изначальным
    reset: function () {
        "use strict";
        this.HvC = false;
        this.unPaintCellsToMove();
        this.unHighlightingCell();
        this.unHighlightingGreenCells();
        var c = document.querySelector('.check');
        if (c) {
            c.classList.remove('check');
        }
        this.lastActiveCell = undefined;
        this.lastCell = undefined;
        this.lastActiveDataCell = undefined;
        this.lastPaintedCells = undefined;
        this.bottomKingNotMove = true;
        this.bottomLeftRookNotMove = true;
        this.bottomRightRookNotMove = true;
        this.topKingNotMove = true;
        this.topLeftRookNotMove = true;
        this.topRightRookNotMove = true;
        this.whiteTurn = true; //ход белых
        this.bottomTurn = true; //по умолчанию белые внизу
        this.check = undefined;
        this.mate = false;
        this.pat = false;
        this.checkCell = undefined;
        this.toKingClick = false;
        this.notKingClick = false;
        this.pawnAttackCheck = false;
        this.title = undefined;
        this.start = false;
        this.arrangement(true);
        this.drawPieces();
    },

    //метод для рокировки
    roque: function (corner) {
        "use strict";
        var roqueY, roqueKing, roqueRookA, roqueRookB;

        switch (corner) {
            case 'south-west':
                roqueY = 'h1';
                roqueKing = 'c';
                roqueRookA = 'a';
                roqueRookB = 'd';
                break;
            case 'south-east':
                roqueY = 'h1';
                roqueKing = 'g';
                roqueRookA = 'h';
                roqueRookB = 'f';
                break;
            case 'north-west':
                roqueY = 'a8';
                roqueKing = 'c';
                roqueRookA = 'a';
                roqueRookB = 'd';
                break;
            case 'north-east':
                roqueY = 'a8';
                roqueKing = 'g';
                roqueRookA = 'h';
                roqueRookB = 'f';
                break;
            default:
                alert('error roque');
        }

        //на всякий случай уберём флаги рокировки
        if (roqueY === 'h1') {
            this.bottomKingNotMove = false;
            if (roqueRookA === 'a') {
                this.bottomLeftRookNotMove = false;
            } else if (roqueRookA === 'h') {
                this.bottomRightRookNotMove = false;
            }
        } else if (roqueY === 'a8') {
            this.topKingNotMove = false;
            if(roqueRookA === 'a') {
                this.topLeftRookNotMove = false;
            } else if (roqueRookA === 'h') {
                this.topRightRookNotMove = false;
            }
        }

        //передвинем фигуры в данных   
        this.grid[roqueY][roqueKing].piece = new Piece(this.whiteTurn, 'king');
        this.grid[roqueY].e.piece = undefined;
        this.grid[roqueY][roqueRookB].piece = new Piece(this.whiteTurn, 'rook');
        this.grid[roqueY][roqueRookA].piece = undefined;

        //передвинем фигуры на доске
        document.querySelector('#' + roqueY + roqueRookA).innerHTML = '';
        document.querySelector('#' + roqueY + roqueRookB).innerHTML = (!this.whiteTurn) ? nameOfPiece.bRook : nameOfPiece.wRook;
        document.querySelector('#' + roqueY + 'e').innerHTML = '';
        document.querySelector('#' + roqueY + roqueKing).innerHTML = (!this.whiteTurn) ? nameOfPiece.bKing : nameOfPiece.wKing;

        this.unPaintCellsToMove();
        this.unHighlightingCell();

        //запишем в лог
        log.addRoque(corner);
    },

    //метод подкрашивает клетку с шахом
    drawCheck: function (cell) {
        "use strict";
        this.checkCell = document.querySelector('#' + cell.number + cell.letter);
        this.checkCell.classList.add('check');
    },

    //метод убирает пометку клетки с шахом
    unDrawCheck: function () {
        "use strict";
        if (this.checkCell !== undefined) {
            this.checkCell.classList.remove('check');
            this.checkCell = undefined;
        }
    },

    //метод создаёт массив клеток с вражескими фигурами 
    createEnemyPiecesArray: function (currentColor) {
        "use strict";
        var enemyPiecesCells = [];
        var letterKey;
        for (letterKey in this.grid) {
            if (this.grid.hasOwnProperty(letterKey)) {
                var numberKey;
                for (numberKey in this.grid[letterKey]) {
                    if (this.grid[letterKey].hasOwnProperty(numberKey)) {
                        if (this.grid[letterKey][numberKey].piece !== undefined && (this.grid[letterKey][numberKey].piece.color !== currentColor)) { //
                            enemyPiecesCells.push(this.grid[letterKey][numberKey]);
                        }
                    }
                }
            }
        }
        return enemyPiecesCells;
    },

    //проверка на пат
    isPat: function () {
        "use strict";
        var me = this; //внутри foreach this будет другим
        //по умолчанию пат есть
        var pat = true;
        //найдём все свои фигуры
        var currentPieces = this.createEnemyPiecesArray(this.whiteTurn);
        //на время проверки поменяем ход
        this.changeTurn();
        //проверим каждую
        currentPieces.forEach(function (piece) {
            //если пата нет, то незачем проверять
            if (!pat) {
                return;
            }
            //найдём все ходы этой фигуры
            if (piece.piece.name !== 'king') {
                me.notKingClick = true;
            } else {
                me.toKingClick = true;
            }
            var ability = me.findCellsToMove(piece);
            //не пат
            if (ability.length > 0) {
                pat = false;
            }
        });
        //поменяем ход обратно
        this.changeTurn();
        return pat;
    },

    //метод для проверки шаха
    //если есть шах, то возвращает клетку с королём которому объявлен шах
    //если нет, то undefined
    isCheck: function () {
        "use strict";
        var check;
        //внутри foreach this будет другим
        var me = this;
        //найдём все свои фигуры
        var currentPieces = this.createEnemyPiecesArray(!this.whiteTurn);
        //проверим каждую
        currentPieces.forEach(function (piece) {
            if (check !== undefined) {
                return;
            }
            //найдём все ходы этой фигуры
            var ability = me.findCellsToMove(piece);

            ability.forEach(function (cell) {
                if (check !== undefined) {
                    return;
                }
                //если в возможных ходах есть король
                if (cell.piece !== undefined && cell.piece.name === 'king') {
                    check = cell;
                }
            });
        });
        return check;
    },

    //метод для проверки мата
    isMate: function () {
        "use strict";
        //найдём все фигуры игрока который делает следующий ход
        var currentPieces = this.createEnemyPiecesArray(this.whiteTurn);
        //на время проверки поменяем ход
        this.changeTurn();
        var me = this;
        var found = true; //по умолчанию мат
        //по всем фигурам будем искать возможные ходы
        currentPieces.forEach(function (piece) {
            //уже есть ходы
            if (!found) {
                return;
            }
            //будем считать что на фигуру кликнули
            if (piece.piece.name !== 'king') {
                me.notKingClick = true;
            } else {
                me.toKingClick = true;
            }
            var ability = me.findCellsToMove(piece);
            //если есть возможные ходы
            if (ability.length > 0) {
                found = false;
            }
        });
        //поменяем ход обратно
        this.changeTurn();
        return found;
    },

    //возвращае клетку в данных сответствующую клетке из браузера
    findDataCell: function (cell) {
        "use strict";
        var y = cell.id[0] + cell.id[1];
        var x = cell.id[2];
        return this.grid[y][x];
    },

    //убираем подкрашивание зелёных клеток
    unHighlightingGreenCells: function () {
        "use strict";
        var lastCell = document.querySelector('.lastCell');
        if (lastCell) {
            lastCell.classList.remove('lastCell');
        }
        lastCell = document.querySelector('.lastCell');
        if (lastCell) {
            lastCell.classList.remove('lastCell');
        }
    },

    //передвигаем фигуру в данных и броузере
    movePiece: function (a, b) {
        "use strict";
        log.add(a, b);
        if (this.check !== undefined) {
            log.addCheck();
        }
        var itIsRoque = false;
        //если это король или ладьи, то нужно установить флаги рокировки
        if (this.bottomTurn) { //ход нижнего игрока
            //если король не ходил и игрок ходит королём
            if (this.bottomKingNotMove && a.piece.name === 'king' && a.letter === 'e' && a.number === 'h1') {
                this.bottomKingNotMove = false;
                if (b.number === 'h1' && (b.letter === 'c' || b.letter === 'g')) {
                    itIsRoque = true;
                }
                log.addFirst('bottomKingNotMove');
            }
            //если левая ладья не ходила и игрок ходит ей
            if (this.bottomLeftRookNotMove && a.piece.name === 'rook' && a.letter === 'a' && a.number === 'h1') {
                this.bottomLeftRookNotMove = false;
                log.addFirst('bottomLeftRookNotMove');
            }
            //если правая ладья не ходила и игрок ходит ей
            if (this.bottomRightRookNotMove && a.piece.name === 'rook' && a.letter === 'h' && a.number === 'h1') {
                this.bottomRightRookNotMove = false;
                log.addFirst('bottomRightRookNotMove');
            }
        } else { //ход верхнего игрока
            //если король не ходил и игрок ходит королём
            if (this.topKingNotMove && a.piece.name === 'king' && a.letter === 'e' && a.number === 'a8') {
                this.topKingNotMove = false;
                if (b.number === 'a8' && (b.letter === 'c' || b.letter === 'g')) {
                    itIsRoque = true;
                }
                log.addFirst('topKingNotMove');
            }
            //если левая ладья не ходила и игрок ходит ей
            if (this.topLeftRookNotMove && a.piece.name === 'rook' && a.letter === 'a' && a.number === 'a8') {
                this.topLeftRookNotMove = false;
                log.addFirst('topLeftRookNotMove');
            }
            //если левая ладья не ходила и игрок ходит ей
            if (this.topRightRookNotMove && a.piece.name === 'rook' && a.letter === 'h' && a.number === 'a8') {
                this.topRightRookNotMove = false;
                log.addFirst('topRightRookNotMove');
            }
        }
        //если это рокировка
        if (this.bottomTurn && itIsRoque) {
            if (this.bottomLeftRookNotMove && a.number === 'h1' && a.letter === 'e' && b.number === 'h1' && b.letter === 'c') {
                this.roque('south-west');
                return;
            }
            if (this.bottomRightRookNotMove && a.number === 'h1' && a.letter === 'e' && b.number === 'h1' && b.letter === 'g') {
                this.roque('south-east');
                return;
            }
        }
        if (!this.bottomTurn && itIsRoque) {
            if (this.topLeftRookNotMove && a.number === 'a8' && a.letter === 'e' && b.number === 'a8' && b.letter === 'c') {
                this.roque('north-west');
                return;
            }
            if (this.topRightRookNotMove && a.number === 'a8' && a.letter === 'e' && b.number === 'a8' && b.letter === 'g') {
                this.roque('north-east');
                return;
            }
        }
        //передвинем фигуру в данных
        b.piece = a.piece;
        a.piece = undefined;
        //изменим отображение ячеек
        var aCell = document.querySelector('#' + a.number + a.letter);
        var bCell = document.querySelector('#' + b.number + b.letter);
        //копируем содержимое последней активной ячейки на эту
        bCell.innerText = aCell.innerText;
        //убираем содержимое последней активной ячейки 
        aCell.innerText = '';
        //убираем закрашивание и выделение  последней активной ячейки
        this.unPaintCellsToMove();
        this.unHighlightingCell();
        //уберём подкрашивание зелёных клеток
        this.unHighlightingGreenCells();
        //пометим клетки этого хода
        aCell.classList.add('lastCell');
        bCell.classList.add('lastCell');
        //если фигура это пешка и она дошла до конца, то это ферзь
        if (b.piece.name === 'pawn' && (b.number === 'a8' || b.number === 'h1')) {
            b.piece.name = 'queen';
            if (this.whiteTurn) {
                bCell.innerHTML = nameOfPiece.wQueen;
            } else {
                bCell.innerHTML = nameOfPiece.bQueen;
            }
        }
    },

    //делаем ход
    move: function (a, b) {
        "use strict";
        this.movePiece(a, b);
        //уберём отображение шаха
        this.unDrawCheck();
        //this.check - клетка на которой стоит король
        this.check = this.isCheck();
        //проверка на мат
        if (this.check !== undefined) {
            this.mate = this.isMate();
            if (this.mate) {
                //изменим ход чтобы можно было отменить ход
                this.changeTurn();
                info.changeTurn();
                if (!b.piece.color) {
                    info.wB();
                } else {
                    info.wW();
                }
                return;
            }
        }
        //проверка на пат
        this.pat = this.isPat();
        if (this.pat) {
            //изменим ход чтобы можно было отменить ход
            this.changeTurn();
            info.changeTurn();
            if (!b.piece.color) {
                info.wBP();
            } else {
                info.wWP();
            }
            return;
        }
        //изменим ход
        this.changeTurn();
        info.changeTurn();
        if (this.check !== undefined && !this.mate) {
            //вывод инфы о шахе в интерфейс
            this.drawCheck(this.check);
            if (b.piece.color) {
                info.cB();
            } else {
                info.cW();
            }
        }
    },

    cellClickEvent: function (cell) {
        "use strict";
        var me = this;
        cell.addEventListener('click', function () {
            if (!me.start) {
                return;
            }
            //найдём клетку в данных
            var dataCell = me.findDataCell(cell);
            //если был сделан ход
            if (this.classList.contains('avalaibleToMove')) {
                me.move(me.lastActiveDataCell, dataCell);
                if (me.HvC && !me.mate && !me.pat) {
                    setTimeout(function () {
                        me.iiTurn();
                    }, 300);
                }
                return;
            }
            //проверим, можно ли выделить клетку
            //нельзя выделить пустую клетку
            if (dataCell.piece === undefined) {
                return;
            }
            //соблюдаем очерёдность ходов
            //нельзя выделить фигуры
            if (me.whiteTurn !== dataCell.piece.color) {
                return;
            }
            //убираем закрашивание клеток и выделение ячейки
            me.unPaintCellsToMove();
            me.unHighlightingCell();
            //выделим ячейку
            cell.classList.add('activeCell');
            me.lastActiveCell = cell;
            me.lastActiveDataCell = me.findDataCell(cell);
            if (dataCell.piece.name === 'king') {
                me.toKingClick = true; //флаг о том, что был клик на короля
            } else {
                me.notKingClick = true; //флаг о том, что был клик на фигуру
            }
            //клетку с фигурой выделили, теперь находим и показываем возможные ходы
            //ability массив клеток на которые можно ходить
            var ability = me.findCellsToMove(dataCell);
            //закрасим найденные ячейки
            me.paintCellsToMove(ability);
            if (me.againstII) {
                me.iiTurn();
            }
        });
    },

    //возвращает дополнительный индекс ячейки по горизонтали
    additionalIndexX: function (x) {
        "use strict";
        switch (parseInt(x, 10)) {
            case 1:
                return 'a';
            case 2:
                return 'b';
            case 3:
                return 'c';
            case 4:
                return 'd';
            case 5:
                return 'e';
            case 6:
                return 'f';
            case 7:
                return 'g';
            case 8:
                return 'h';
        }
        return undefined;
    },
    //
    //возвращает дополнительный индекс ячейки по вертикали
    additionalIndexY: function (y) {
        "use strict";
        switch (parseInt(y, 10)) {
            case 1:
                return 'h1';
            case 2:
                return 'g2';
            case 3:
                return 'f3';
            case 4:
                return 'e4';
            case 5:
                return 'd5';
            case 6:
                return 'c6';
            case 7:
                return 'b7';
            case 8:
                return 'a8';
        }
        return undefined;
    },

    //расстановка фигур
    arrangement: function (color) {
        "use strict";
        //ходит ли нижний игрок первым
        this.bottomTurn = color;
        //обнулим данные доски
        var numberKey;
        for (numberKey in this.grid) {
            if (this.grid.hasOwnProperty(numberKey)) {
                var letterKey;
                for (letterKey in this.grid[numberKey]) {
                    if (this.grid[numberKey].hasOwnProperty(letterKey)) {
                        var cell = this.grid[numberKey][letterKey];
                        cell.piece = undefined;
                    }
                }
            }
        }
        //сначала расставим пешки
        var j;
        for (j = 97; j <= 104; j++) {
            var letter = String.fromCharCode(j);
            this.grid.b7[letter].piece = new Piece(!color, 'pawn'); //пешка
            this.grid.g2[letter].piece = new Piece(color, 'pawn'); //пешка
        }
        //ладья - rook
        this.grid.h1.a.piece = new Piece(color, 'rook');
        this.grid.h1.h.piece = new Piece(color, 'rook');
        this.grid.a8.a.piece = new Piece(!color, 'rook');
        this.grid.a8.h.piece = new Piece(!color, 'rook');
        //конь - knight
        this.grid.h1.b.piece = new Piece(color, 'knight');
        this.grid.h1.g.piece = new Piece(color, 'knight');
        this.grid.a8.b.piece = new Piece(!color, 'knight');
        this.grid.a8.g.piece = new Piece(!color, 'knight');
        //слон - bishop
        this.grid.h1.c.piece = new Piece(color, 'bishop');
        this.grid.h1.f.piece = new Piece(color, 'bishop');
        this.grid.a8.c.piece = new Piece(!color, 'bishop');
        this.grid.a8.f.piece = new Piece(!color, 'bishop');
        //королева
        this.grid.h1.d.piece = new Piece(color, 'queen');
        this.grid.a8.d.piece = new Piece(!color, 'queen');
        //король
        this.grid.h1.e.piece = new Piece(color, 'king');
        this.grid.a8.e.piece = new Piece(!color, 'king');

        //                this.grid.a8.a.piece = new Piece(!color, 'knight');
        //                this.grid.b7.a.piece = new Piece(!color, 'pawn');
        //                this.grid.c6.a.piece = new Piece(!color, 'knight');
        //                this.grid.d5.a.piece = new Piece(!color, 'queen');
        //                this.grid.e4.a.piece = new Piece(!color, 'queen');
        //                this.grid.f3.a.piece = new Piece(!color, 'queen');
        //                this.grid.g2.a.piece = new Piece(!color, 'queen');
        //                this.grid.h1.a.piece = new Piece(!color, 'queen');
    },

    //вывод в виде текста
    outText: function () {
        "use strict";
        var text = document.querySelector('.text');
        var str = '<table>';
        var letterKey;
        for (letterKey in this.grid) {
            if (this.grid.hasOwnProperty(letterKey)) {
                var numberKey;
                str += '<tr>';
                for (numberKey in this.grid[letterKey]) {
                    if (this.grid[letterKey].hasOwnProperty(numberKey)) {
                        var piece = this.grid[letterKey][numberKey].piece;
                        str += '<td>';
                        if (piece !== undefined) {
                            var n;
                            if (piece.color) {
                                switch (piece.name) {
                                    case 'king':
                                        n = '&#9812;';
                                        break;
                                    case 'queen':
                                        n = '&#9813;';
                                        break;
                                    case 'rook':
                                        n = '&#9814;';
                                        break;
                                    case 'bishop':
                                        n = '&#9815;';
                                        break;
                                    case 'knight':
                                        n = '&#9816;';
                                        break;
                                    case 'pawn':
                                        n = '&#9817;';
                                        break;
                                }
                            } else {
                                switch (piece.name) {
                                    case 'king':
                                        n = '&#9818;';
                                        break;
                                    case 'queen':
                                        n = '&#9819;';
                                        break;
                                    case 'rook':
                                        n = '&#9820;';
                                        break;
                                    case 'bishop':
                                        n = '&#9821;';
                                        break;
                                    case 'knight':
                                        n = '&#9822;';
                                        break;
                                    case 'pawn':
                                        n = '&#9823;';
                                        break;
                                }
                            }
                            str += n;
                        }
                        str += '</td>';
                    }
                }
                str += '</tr>';
            }
        }
        str += '</table>';
        text.innerHTML = str;
    },

    //нарисовать доску
    drawBoard: function () {
        "use strict";
        var i, j, letterCell, numberCell, cell, color,
            letterIndex = 97,
            numberIndex = 8,
            change = true;
        //доска
        var wrap = document.querySelector('.boardWrap');
        var board = document.createElement('div');
        board.classList.add('board');
        wrap.appendChild(board);
        //обёртка верхних букв
        var lettersWrap = document.createElement('div');
        lettersWrap.classList.add('letters-wrap');
        board.appendChild(lettersWrap);
        //верхние буквы
        for (i = 0; i < 8; i++) {
            letterCell = document.createElement('div');
            letterCell.classList.add('letterCell', 'reverse');
            letterCell.innerText = String.fromCharCode(letterIndex++);
            lettersWrap.appendChild(letterCell);
        }
        for (i = 0; i < 8; i++) {
            //нумерация
            numberCell = document.createElement('div');
            numberCell.classList.add('numberCell');
            numberCell.innerText = numberIndex;
            board.appendChild(numberCell);
            //клетки
            letterIndex = 97;
            for (j = 0; j < 8; j++) {
                cell = document.createElement('div');
                color = (change) ? 'white' : 'black';
                change = !change;
                cell.classList.add('cell', color);
                //добавим каждой клетке id
                cell.id = this.additionalIndexY(numberIndex) + String.fromCharCode(letterIndex++);
                board.appendChild(cell);
                //событие клика
                this.cellClickEvent(cell);
            }
            //нумерация
            numberCell = document.createElement('div');
            numberCell.classList.add('numberCell', 'reverse');
            board.appendChild(numberCell);
            numberCell.innerText = numberIndex--;
            change = !change;
        }
        //обёртка нижних букв
        lettersWrap = document.createElement('div');
        lettersWrap.classList.add('letters-wrap');
        board.appendChild(lettersWrap);
        //нижние буквы
        letterIndex = 97;
        for (i = 0; i < 8; i++) {
            letterCell = document.createElement('div');
            letterCell.classList.add('letterCell');
            letterCell.innerText = String.fromCharCode(letterIndex++);
            lettersWrap.appendChild(letterCell);
        }
    },

    //метод возвращает клетку с координатами относительно текущей ячейки, или undefined
    findCell: function (currentCell, x, y) {
        "use strict";
        var current = new KeysToNumbers(currentCell);
        var nextX = current.x + x;
        var nextY = current.y + y;
        //клетка выходит за пределы доски
        if (nextX <= 0 || nextX > 8 || nextY <= 0 || nextY > 8) {
            return undefined;
        }
        nextX = this.additionalIndexX(nextX);
        nextY = this.additionalIndexY(nextY);
        return this.grid[nextY][nextX];
    },
    //метод возвращает возможные ходы для пешки
    findCellsToMovePawn: function (currentCell, currentColor) {
        "use strict";
        var ability = [];
        var near, far, pawnRow;
        if (this.bottomTurn) { //это ход пешки нижнего игрока
            near = 1;
            far = 2;
            pawnRow = 'g2';
        } else { //это ход пешки верхнего игрока
            near = -1;
            far = -2;
            pawnRow = 'b7';
        }
        //если есть слева и там есть фигура и она вражеская
        var straightLeft = this.findCell(currentCell, -1, near);
        if (straightLeft !== undefined && straightLeft.piece !== undefined && straightLeft.piece.color !== currentColor) {
            ability.push(straightLeft);
        }
        //если на С есть свободная клетка
        var straigh = this.findCell(currentCell, 0, near);
        if (straigh !== undefined && straigh.piece === undefined) {
            ability.push(straigh);
        }
        //если есть справа и там есть фигура и она вражеская
        var straightRight = this.findCell(currentCell, 1, near);
        if (straightRight !== undefined && straightRight.piece !== undefined && straightRight.piece.color !== currentColor) {
            ability.push(straightRight);
        }
        //если это первый ход пешки
        var farStraight = this.findCell(currentCell, 0, far);
        var nearStraight = this.findCell(currentCell, 0, near);
        if (currentCell.number === pawnRow && farStraight !== undefined && farStraight.piece === undefined && nearStraight !== undefined && nearStraight.piece === undefined) {
            ability.push(farStraight);
        }
        //так как пешки ходят и едят по разному нужно проверять при проверке возможности хода королём только две возможных позиции у каждой пешки
        if (this.pawnAttackCheck) {
            ability = [];
            if (!this.bottomTurn) { //рассматриваем действия пешек с другой стороны
                near = -1;
            } else {
                near = 1;
            }
            //если впереди-слева и впереди-справа  нет фигур, или это вражеские фигуры то эти клетки находятся под боем
            straightLeft = this.findCell(currentCell, -1, near);
            if (straightLeft !== undefined) {
                if (straightLeft.piece === undefined || (straightLeft.piece !== undefined && straightLeft.piece.color !== currentColor)) {
                    ability.push(straightLeft);
                }
            }
            straightRight = this.findCell(currentCell, 1, near);
            if (straightRight !== undefined) {
                if (straightRight.piece === undefined || (straightRight.piece !== undefined && straightRight.piece.color !== currentColor)) {
                    ability.push(straightRight);
                }
            }
        }
        return ability;
    },

    //метод находитя ячейку с королём цвета currentColor
    findKing: function (currentColor) {
        "use strict";
        var letterKey;
        for (letterKey in this.grid) {
            if (this.grid.hasOwnProperty(letterKey)) {
                var numberKey;
                for (numberKey in this.grid[letterKey]) {
                    if (this.grid[letterKey].hasOwnProperty(numberKey)) {
                        if (this.grid[letterKey][numberKey].piece !== undefined && (this.grid[letterKey][numberKey].piece.name === 'king' && this.grid[letterKey][numberKey].piece.color === currentColor)) {
                            return this.grid[letterKey][numberKey];
                        }
                    }
                }
            }
        }
    },

    //метод исключает из массива ability клетки которые находятся под боем
    checkCellsToMoveKing: function (ability, currentColor, kingCell) {
        "use strict";
        //перед проверкой переключимся на второй режим проверки пешек
        this.pawnAttackCheck = true;
        //король может съесть защищённую фигуру
        //проверим каждую из клеток на которую может походить король
        //проверять будем с конца, так как массив будет уменьшаться
        var cellNumber, enemyNumber;
        for (cellNumber = ability.length - 1; cellNumber >= 0; cellNumber--) {
            var abilityCell = ability[cellNumber];
            //если на abilityCell стоит вражеская фигура, то её нужно временно убрать
            var tempPiece;
            var useTempPiece = false;
            if (abilityCell.piece !== undefined) {
                useTempPiece = true;
                tempPiece = abilityCell.piece;
            }
            //на время переставим короля на abilityCell
            abilityCell.piece = kingCell.piece;
            kingCell.piece = undefined;
            //если это уход от шаха рокировкой, то нужно временно поставить ладью перед королём
            var rNorthWest = false,
                rNorthEast = false,
                rSouthWest = false,
                rSouthEast = false;
            if (!this.bottomTurn) { //проверяем верхнего короля
                if (kingCell.number === 'a8' && kingCell.letter === 'e' && abilityCell.number === 'a8' && abilityCell.letter === 'c') {
                    this.grid.a8.d.piece = new Piece(this.whiteTurn, 'rook');
                    rNorthWest = true;
                }
                if (kingCell.number === 'a8' && kingCell.letter === 'e' && abilityCell.number === 'a8' && abilityCell.letter === 'g') {
                    this.grid.a8.f.piece = new Piece(this.whiteTurn, 'rook');
                    rNorthEast = true;
                }
            } else { //проверяем нижнего короля
                if (kingCell.number === 'h1' && kingCell.letter === 'e' && abilityCell.number === 'h1' && abilityCell.letter === 'c') {
                    this.grid.h1.d.piece = new Piece(this.whiteTurn, 'rook');
                    rSouthWest = true;
                }
                if (kingCell.number === 'h1' && kingCell.letter === 'e' && abilityCell.number === 'h1' && abilityCell.letter === 'g') {
                    this.grid.h1.f.piece = new Piece(this.whiteTurn, 'rook');
                    rSouthEast = true;
                }
            }
            //на время переключим возможность хода на другого игрока
            this.changeTurn();
            //соберём все вражеские фигуры в массив, проверка тут, так как одну фигуру король мог съесть на время
            var enemyPiecesCells = this.createEnemyPiecesArray(currentColor);
            for (enemyNumber = 0; enemyNumber < enemyPiecesCells.length; enemyNumber++) {
                //найдём все возможные ходы для вражеской фигуры   
                var enemyPiece = enemyPiecesCells[enemyNumber];
                var enemyPieceAbility = this.findCellsToMove(enemyPiece);
                //если в этих ходах содержится проверяемая клетка
                if (enemyPieceAbility.includes(abilityCell)) {
                    var index = ability.indexOf(abilityCell);
                    ability.splice(index, 1);
                    //текущую ячейку abilityCell убрали, следующие вражеские фигуры проверять не имеет смысла
                    break;
                }
            }
            //уберём рокировку
            if (rNorthWest) {
                this.grid.a8.d.piece = undefined;
            }
            if (rNorthEast) {
                this.grid.a8.f.piece = undefined;
            }
            if (rSouthWest) {
                this.grid.h1.d.piece = undefined;
            }
            if (rSouthEast) {
                this.grid.h1.f.piece = undefined;
            }
            //вернём короля обратно
            kingCell.piece = abilityCell.piece;
            abilityCell.piece = undefined;
            //если с клетки убирали фигуру
            if (useTempPiece) {
                abilityCell.piece = tempPiece;
            }
            //вернём возможность хода обратно
            this.changeTurn();

        }
        //вернём режим проверки пешек обратно
        this.pawnAttackCheck = false;
    },

    //метод возвращает возможные ходы для короля
    findCellsToMoveKing: function (currentCell, currentColor) {
        "use strict";
        var ability = [];
        var north = this.findCell(currentCell, 0, 1);
        if (north !== undefined && (north.piece === undefined || north.piece.color !== currentColor)) {
            ability.push(north);
        }
        var northWest = this.findCell(currentCell, 1, 1);
        if (northWest !== undefined && (northWest.piece === undefined || northWest.piece.color !== currentColor)) {
            ability.push(northWest);
        }
        var west = this.findCell(currentCell, 1, 0);
        if (west !== undefined && (west.piece === undefined || west.piece.color !== currentColor)) {
            ability.push(west);
        }
        var southWest = this.findCell(currentCell, 1, -1);
        if (southWest !== undefined && (southWest.piece === undefined || southWest.piece.color !== currentColor)) {
            ability.push(southWest);
        }
        var south = this.findCell(currentCell, 0, -1);
        if (south !== undefined && (south.piece === undefined || south.piece.color !== currentColor)) {
            ability.push(south);
        }
        var southEast = this.findCell(currentCell, -1, -1);
        if (southEast !== undefined && (southEast.piece === undefined || southEast.piece.color !== currentColor)) {
            ability.push(southEast);
        }
        var east = this.findCell(currentCell, -1, 0);
        if (east !== undefined && (east.piece === undefined || east.piece.color !== currentColor)) {
            ability.push(east);
        }
        var northEast = this.findCell(currentCell, -1, 1);
        if (northEast !== undefined && (northEast.piece === undefined || northEast.piece.color !== currentColor)) {
            ability.push(northEast);
        }
        //рокировка
        if (currentCell.number === 'a8' && currentCell.letter === 'e') {
            if (!this.bottomTurn && this.topKingNotMove) { //если верхний король
                if (this.topLeftRookNotMove) { //слева
                    if (this.grid.a8.b.piece === undefined && this.grid.a8.c.piece === undefined && this.grid.a8.d.piece === undefined) { //слева пустые клетки
                        if (this.grid.a8.a.piece !== undefined && this.grid.a8.a.piece.name === 'rook' && this.grid.a8.a.piece.color === this.whiteTurn) { //там до сих пор ладья нужного цвета
                            ability.push(this.grid.a8.c);
                        }
                    }
                }
                if (this.topRightRookNotMove) { //справа
                    if (this.grid.a8.f.piece === undefined && this.grid.a8.g.piece === undefined) { //справа пустые клетки
                        if (this.grid.a8.h.piece !== undefined && this.grid.a8.h.piece.name === 'rook' && this.grid.a8.h.piece.color === this.whiteTurn) { //там до сих пор ладья нужного цвета
                            ability.push(this.grid.a8.g);
                        }
                    }
                }
            }
        }
        if (currentCell.number === 'h1' && currentCell.letter === 'e') { //если нижний король
            if (this.bottomTurn && this.bottomKingNotMove) {
                if (this.bottomLeftRookNotMove) { //слева
                    if (this.grid.h1.b.piece === undefined && this.grid.h1.c.piece === undefined && this.grid.h1.d.piece === undefined) { //слева пустые клетки
                        if (this.grid.h1.a.piece !== undefined && this.grid.h1.a.piece.name === 'rook' && this.grid.h1.a.piece.color === this.whiteTurn) { //там до сих пор ладья нужного цвета
                            ability.push(this.grid.h1.c);
                        }
                    }
                }
                if (this.bottomRightRookNotMove) { //справа
                    if (this.grid.h1.f.piece === undefined && this.grid.h1.g.piece === undefined) { //справа пустые клетки
                        if (this.grid.h1.h.piece !== undefined && this.grid.h1.h.piece.name === 'rook' && this.grid.h1.h.piece.color === this.whiteTurn) { //там до сих пор ладья нужного цвета
                            ability.push(this.grid.h1.g);
                        }
                    }
                }
            }
        }
        //проверим, не находятся ли эти клетки под боем вражеских фигур
        //если да, исключим эти клетки из ability
        if (this.toKingClick) {
            this.toKingClick = false;
            this.checkCellsToMoveKing(ability, currentColor, currentCell);
        }
        return ability;
    },

    //метод убирает из ability фигуры все ходы, которые несут опасность своему королю
    checkDangerForKing: function (ability, currentCell, currentColor) {
        "use strict";
        var kingCell = this.findKing(currentColor);
        //пройти по всем клеткам  из ability
        var abilityCell;
        for (abilityCell = ability.length - 1; abilityCell >= 0; abilityCell--) {
            //по умолчанию ничего не нашли
            var found = false;
            //на время переставим фигуру на эту клетку
            var tempPiece = ability[abilityCell].piece;
            ability[abilityCell].piece = currentCell.piece;
            currentCell.piece = undefined;
            //соберём все вражеские фигуры в массив, одну из фигур могли съесть, поэтому  собирать нужно тут
            var enemyPiecesCells = this.createEnemyPiecesArray(currentColor);
            //на время переключим возможность хода на другого игрока
            this.changeTurn();
            //перед проверкой переключимся на второй режим проверки пешек
            this.pawnAttackCheck = true;
            //проверим не бьют ли вражеские фигуры  клетку с королём
            var enemyPieceCell;
            for (enemyPieceCell = 0; enemyPieceCell < enemyPiecesCells.length; enemyPieceCell++) {
                var enemyPieceAbility = this.findCellsToMove(enemyPiecesCells[enemyPieceCell]);
                //если король под ударом
                if (enemyPieceAbility.includes(kingCell)) {
                    found = true;
                    break;
                }
            }
            //вернём возможность хода обратно
            this.changeTurn();
            //вернём режим проверки пешек обратно
            this.pawnAttackCheck = false;
            //переставим фигуры обратно
            currentCell.piece = ability[abilityCell].piece;
            ability[abilityCell].piece = tempPiece;
            //если нашли, то удалим
            if (found) {
                var index = ability.indexOf(ability[abilityCell]);
                ability.splice(index, 1);
            }
        }
    },

    //метод добавляет в ability возможные ходы для ладьи, слона и королевы в зависимости от направления
    findCellsToMoveLine: function (direction, currentCell, currentColor, ability) {
        "use strict";
        var indexes = new KeysToNumbers(currentCell);
        var indexNameX = this.additionalIndexX(indexes.x);
        var indexNameY = this.additionalIndexY(indexes.y);
        var nextCell = this.grid[indexNameY][indexNameX];
        //идём на direction до конца поля, или пока не встретим фигуру
        //начинаем цикл с текущей клетки, но не добавляем её в массив
        while ((nextCell !== undefined && nextCell.piece === undefined) ||
            nextCell === currentCell) {
            if (nextCell !== currentCell) {
                ability.push(nextCell);
            }
            switch (direction) {
                case 'up':
                    indexNameY = this.additionalIndexY(++indexes.y);
                    break;
                case 'up-right':
                    indexNameX = this.additionalIndexX(++indexes.x);
                    indexNameY = this.additionalIndexY(++indexes.y);
                    break;
                case 'right':
                    indexNameX = this.additionalIndexX(++indexes.x);
                    break;
                case 'down-right':
                    indexNameX = this.additionalIndexX(++indexes.x);
                    indexNameY = this.additionalIndexY(--indexes.y);
                    break;
                case 'down':
                    indexNameY = this.additionalIndexY(--indexes.y);
                    break;
                case 'down-left':
                    indexNameX = this.additionalIndexX(--indexes.x);
                    indexNameY = this.additionalIndexY(--indexes.y);
                    break;
                case 'left':
                    indexNameX = this.additionalIndexX(--indexes.x);
                    break;
                case 'up-left':
                    indexNameX = this.additionalIndexX(--indexes.x);
                    indexNameY = this.additionalIndexY(++indexes.y);
                    break;
                default:
                    alert('error findCellsToMoveLine');
            }
            //дошли до края доски и в направлении direction искать не нужно
            if (indexNameY === undefined || indexNameX === undefined) {
                return;
            }
            nextCell = this.grid[indexNameY][indexNameX];
        }
        //если на nextCell есть вражеская фигура то тоже добавим её
        if (nextCell.piece.color !== currentColor) {
            ability.push(nextCell);
        }
    },

    //метод возвращает возможные ходы для ладьи
    findCellsToMoveRook: function (currentCell, currentColor) {
        "use strict";
        var ability = [];
        this.findCellsToMoveLine('up', currentCell, currentColor, ability);
        this.findCellsToMoveLine('down', currentCell, currentColor, ability);
        this.findCellsToMoveLine('left', currentCell, currentColor, ability);
        this.findCellsToMoveLine('right', currentCell, currentColor, ability);
        return ability;
    },

    //метод возвращает возможные ходы для слона
    findCellsToMoveBishop: function (currentCell, currentColor) {
        "use strict";
        var ability = [];
        this.findCellsToMoveLine('up-right', currentCell, currentColor, ability);
        this.findCellsToMoveLine('up-left', currentCell, currentColor, ability);
        this.findCellsToMoveLine('down-left', currentCell, currentColor, ability);
        this.findCellsToMoveLine('down-right', currentCell, currentColor, ability);
        return ability;
    },

    //метод возвращает возможные ходы для коня
    findCellsToMoveKnight: function (currentCell, currentColor) {
        "use strict";
        var ability = [];
        //на 13 часов
        var hours13 = this.findCell(currentCell, 1, 2);
        if (hours13 !== undefined && (hours13.piece === undefined || hours13.piece.color !== currentColor)) {
            ability.push(hours13);
        }
        //на 14 часов
        var hours14 = this.findCell(currentCell, 2, 1);
        if (hours14 !== undefined && (hours14.piece === undefined || hours14.piece.color !== currentColor)) {
            ability.push(hours14);
        }
        //на 16 часов
        var hours16 = this.findCell(currentCell, 2, -1);
        if (hours16 !== undefined && (hours16.piece === undefined || hours16.piece.color !== currentColor)) {
            ability.push(hours16);
        }
        //на 17 часов
        var hours17 = this.findCell(currentCell, 1, -2);
        if (hours17 !== undefined && (hours17.piece === undefined || hours17.piece.color !== currentColor)) {
            ability.push(hours17);
        }
        //на 19 часов
        var hours19 = this.findCell(currentCell, -1, -2);
        if (hours19 !== undefined && (hours19.piece === undefined || hours19.piece.color !== currentColor)) {
            ability.push(hours19);
        }
        //на 20 часов
        var hours20 = this.findCell(currentCell, -2, -1);
        if (hours20 !== undefined && (hours20.piece === undefined || hours20.piece.color !== currentColor)) {
            ability.push(hours20);
        }
        //на 22 часа
        var hours22 = this.findCell(currentCell, -2, 1);
        if (hours22 !== undefined && (hours22.piece === undefined || hours22.piece.color !== currentColor)) {
            ability.push(hours22);
        }
        //на 23 часа
        var hours23 = this.findCell(currentCell, -1, 2);
        if (hours23 !== undefined && (hours23.piece === undefined || hours23.piece.color !== currentColor)) {
            ability.push(hours23);
        }
        return ability;
    },

    //метод возвращает возможные ходы для королевы
    findCellsToMoveQueen: function (currentCell, currentColor) {
        "use strict";
        var ability = [];
        this.findCellsToMoveLine('up', currentCell, currentColor, ability);
        this.findCellsToMoveLine('down', currentCell, currentColor, ability);
        this.findCellsToMoveLine('left', currentCell, currentColor, ability);
        this.findCellsToMoveLine('right', currentCell, currentColor, ability);
        this.findCellsToMoveLine('up-right', currentCell, currentColor, ability);
        this.findCellsToMoveLine('up-left', currentCell, currentColor, ability);
        this.findCellsToMoveLine('down-left', currentCell, currentColor, ability);
        this.findCellsToMoveLine('down-right', currentCell, currentColor, ability);
        return ability;
    },

    //показывает клетки на которые возможно походить
    findCellsToMove: function (currentCell) {
        "use strict";
        var currentColor = currentCell.piece.color; //цвет фигуры на текущей клетке
        //доступные клетки зависят от фигуры
        var ability = [];
        switch (currentCell.piece.name) {
            case 'pawn':
                ability = this.findCellsToMovePawn(currentCell, currentColor);
                break;
            case 'rook':
                ability = this.findCellsToMoveRook(currentCell, currentColor);
                break;
            case 'bishop':
                ability = this.findCellsToMoveBishop(currentCell, currentColor);
                break;
            case 'knight':
                ability = this.findCellsToMoveKnight(currentCell, currentColor);
                break;
            case 'queen':
                ability = this.findCellsToMoveQueen(currentCell, currentColor);
                break;
            case 'king':
                ability = this.findCellsToMoveKing(currentCell, currentColor);
                break;
            default:
                break;
        }
        //уберём из ability все ходы, которые несут опасность королю
        //это нужно делать только если ходит не король
        if (this.notKingClick) {
            this.notKingClick = false;
            this.checkDangerForKing(ability, currentCell, currentColor);
        }

        return ability;
    },

    //метод закрашивает клетки на доске на которые возможен ход
    paintCellsToMove: function (cells) {
        "use strict";
        var i;
        //закрасим новые клетки
        for (i = 0; i < cells.length; i++) {
            var cellToPaint = document.querySelector('#' + cells[i].number + cells[i].letter);
            cellToPaint.classList.add('avalaibleToMove');
        }
        //сохраним массив закрашенных клеток
        this.lastPaintedCells = cells;
    },

    //метод убирает закрашивание клеток на доске
    unPaintCellsToMove: function () {
        "use strict";
        var i;
        //уберём закрашивание с прошлых закрашенных клеток
        if (this.lastPaintedCells !== undefined) {
            for (i = 0; i < this.lastPaintedCells.length; i++) {
                var cellToUnPaint = document.querySelector('#' + this.lastPaintedCells[i].number + this.lastPaintedCells[i].letter);
                cellToUnPaint.classList.remove('avalaibleToMove');
            }
        }
    },

    //метод убирает выделение клетки на доске
    unHighlightingCell: function () {
        "use strict";
        if (this.lastActiveCell !== undefined) {
            this.lastActiveCell.classList.remove('activeCell');
            //также уберём выделенную ячейку в данных, мало ли что
            this.lastActiveDataCell = undefined;
        }
    },

    //метод для заполнения объекта доска клетками
    createDataCells: function () {
        "use strict";
        for (this.number = 8; this.number >= 1; this.number--) {
            var cellNumber = this.additionalIndexY(this.number);
            this.grid[cellNumber] = {};
            var j;
            for (j = 97; j <= 104; j++) {
                var letter = String.fromCharCode(j);
                this.grid[cellNumber][letter] = new Cell(letter, cellNumber);
            }
        }
    },

    //переставляет фигуры в соответствии с данными
    drawPieces: function () {
        "use strict";
        var numberKey;
        for (numberKey in this.grid) {
            if (this.grid.hasOwnProperty(numberKey)) {
                var letterKey;
                for (letterKey in this.grid[numberKey]) {
                    if (this.grid[numberKey].hasOwnProperty(letterKey)) {
                        var cell = this.grid[numberKey][letterKey];
                        var id = '#' + numberKey + letterKey;
                        var boardCell = document.querySelector(id);
                        if (cell.piece !== undefined) {
                            if (cell.piece.color) {
                                switch (cell.piece.name) {
                                    case 'king':
                                        boardCell.innerHTML = '&#9812;';
                                        break;
                                    case 'queen':
                                        boardCell.innerHTML = '&#9813;';
                                        break;
                                    case 'rook':
                                        boardCell.innerHTML = '&#9814;';
                                        break;
                                    case 'bishop':
                                        boardCell.innerHTML = '&#9815;';
                                        break;
                                    case 'knight':
                                        boardCell.innerHTML = '&#9816;';
                                        break;
                                    case 'pawn':
                                        boardCell.innerHTML = '&#9817;';
                                        break;
                                }
                            } else {
                                switch (cell.piece.name) {
                                    case 'king':
                                        boardCell.innerHTML = '&#9818;';
                                        break;
                                    case 'queen':
                                        boardCell.innerHTML = '&#9819;';
                                        break;
                                    case 'rook':
                                        boardCell.innerHTML = '&#9820;';
                                        break;
                                    case 'bishop':
                                        boardCell.innerHTML = '&#9821;';
                                        break;
                                    case 'knight':
                                        boardCell.innerHTML = '&#9822;';
                                        break;
                                    case 'pawn':
                                        boardCell.innerHTML = '&#9823;';
                                        break;
                                }
                            }
                        } else {
                            boardCell.innerHTML = '';
                        }
                    }
                }
            }
        }
    },

    //метод возвращает доску на ход назад
    previousTurn: function (turn) {
        "use strict";
        this.unDrawCheck();
        this.check = undefined;
        this.mate = false;
        this.pat = false;
        this.changeTurn();
        this.grid[turn.a.number][turn.a.letter] = turn.a;
        this.grid[turn.b.number][turn.b.letter] = turn.b;
        this.unHighlightingCell();
        this.unPaintCellsToMove();
        this.unHighlightingGreenCells();
        if (turn.check) {
            var kingCell = this.findKing(turn.a.piece.color);
            this.drawCheck(kingCell);
            this.check = kingCell;
        }
        //если это была рокировка, то вернём ладью обратно
        if (turn.roque) {
            switch (turn.roque) {
                case 'south-west':
                    this.grid.h1.a.piece = new Piece(turn.a.piece.color, 'rook');
                    this.grid.h1.d.piece = undefined;
                    this.bottomKingNotMove = true;
                    this.bottomLeftRookNotMove = true;
                    break;
                case 'south-east':
                    this.grid.h1.h.piece = new Piece(turn.a.piece.color, 'rook');
                    this.grid.h1.f.piece = undefined;
                    this.bottomKingNotMove = true;
                    this.bottomRightRookNotMove = true;
                    break;
                case 'north-west':
                    this.grid.a8.a.piece = new Piece(turn.a.piece.color, 'rook');
                    this.grid.a8.d.piece = undefined;
                    this.topKingNotMove = true;
                    this.topLeftRookNotMove = true;
                    break;
                case 'north-east':
                    this.grid.a8.h.piece = new Piece(turn.a.piece.color, 'rook');
                    this.grid.a8.f.piece = undefined;
                    this.topKingNotMove = true;
                    this.topRightRookNotMove = true;
                    break;
            }
        }
        if (turn.first) {
            this[turn.first] = true;
        }
        this.drawPieces();
    },

    //сделаем доску
    createBoard: function () {
        "use strict";
        //заполним объект доску клетками
        this.createDataCells();
        //расставим фигуры на доске-объекте
        this.arrangement(true);
        //нарисуем доску в броузере
        this.drawBoard();
        //нарисуем фигуры на доску в броузере
        this.drawPieces();
    },

    //метод возвращает стоимость фигуры
    costOfPiece: function (cell) {
        "use strict";
        switch (cell.piece.name) {
            case 'queen':
                return 5;
            case 'rook':
                return 4;
            case 'bishop':
                return 3;
            case 'knight':
                return 2;
            case 'pawn':
                return 1;
            default:
                alert('error costOfPiece');
        }
    },

    //метод определяет, угрожает ли опасность фигуре на клетке cell
    itIsDangerCell: function (cell) {
        "use strict";
        var result = false; //по умолчанию опасности нет
        var me = this;
        //найдём вражеские фигуры
        var enemyPiecesCells = this.createEnemyPiecesArray(this.whiteTurn);
        //перед поиском переключимся на второй режим проверки пешек
        this.pawnAttackCheck = true;
        //на время переключим возможность хода на другого игрока
        this.changeTurn();
        //проверим все клетки с вражескими фигурами
        enemyPiecesCells.forEach(function (cellWithEnemyPiece) {
            if (result) {
                return;
            }
            //кликнем на фигуру
            if (cell.piece.name !== 'king') {
                me.notKingClick = true;
            } else {
                me.toKingClick = true;
            }
            var enemyAbility = me.findCellsToMove(cellWithEnemyPiece);
            //если фигуре угрожает опасность, но её нет в массиве фигур с опасностью
            if (enemyAbility.includes(cell)) {
                result = true;
            }
        });
        //переключимся обратно
        this.pawnAttackCheck = false;
        this.changeTurn();
        return result;
    },

    //метод сравнивает две клетки по старшинству фигур
    compareCellsWithEnemyPieces: function (a, b) {
        "use strict";
        var costA = board.costOfPiece(a.move);
        var costB = board.costOfPiece(b.move);
        return costB - costA;
    },

    //метод сравнивает две клетки по меньшинству фигур
    compareCellsWithOwnPieces: function (a, b) {
        "use strict";
        var costA = board.costOfPiece(a.current);
        var costB = board.costOfPiece(b.current);
        return costA - costB;
    },

    //ИИ ходит
    iiMove: function (moves) {
        "use strict";
        var moveNumber = random(0, moves.length);
        if (moves.length === 0) {
            alert('error iiMove');
        }
        this.move(moves[moveNumber].current, moves[moveNumber].move);
    },

    //ИИ хочет сделать мат
    iiWantToDoMate: function (cellsWithPieces, iiAbility) {
        "use strict";
        //проверяем все ходы у каждой фигуры
        var me = this;
        cellsWithPieces.forEach(function (currentCell) {
            if (iiAbility.length > 0) {
                return;
            }
            //кликнем на фигуру
            if (currentCell.piece.name === 'king') {
                me.toKingClick = true; //флаг о том, что был клик на короля
            } else {
                me.notKingClick = true; //флаг о том, что был клик на фигуру
            }
            //найдём её ходы
            var ability = me.findCellsToMove(currentCell);
            //проверим все эти ходы
            ability.forEach(function (abilityCell) {
                if (iiAbility.length > 0) {
                    return;
                }
                //на время переставим фигуру на эту клетку
                var tempPiece = abilityCell.piece;
                abilityCell.piece = currentCell.piece;
                currentCell.piece = undefined;
                //проверим, не поставили ли шах            
                if (me.isCheck()) {
                    if (me.isMate()) {
                        iiAbility.push(new IiMoves(currentCell, abilityCell));
                    }
                }
                //переставим фигуры обратно
                currentCell.piece = abilityCell.piece;
                abilityCell.piece = tempPiece;
            });
        });
    },

    //ИИ хочет съесть фигуру (true - фигура безопасная, false - под защитой)
    iiWantoToEat: function (cellsWithPieces, iiAbility, safe) {
        "use strict";
        var me = this;
        //ии пробует найти безопасные ходы для фигур из cellsWithPieces
        cellsWithPieces.forEach(function (cell) {
            //кликнем на фигуру
            if (cell.piece.name !== 'king') {
                me.notKingClick = true;
            } else {
                me.toKingClick = true;
            }
            //для каждой фигуры из cellsWithPieces получаем ability
            var iiPieceAbility = me.findCellsToMove(cell);
            //ищем в ability вражеские фигуры для еды
            iiPieceAbility.forEach(function (iiPieceAbilityCell) {
                //если фигура ИИ может съесть фигуру противника
                if (iiPieceAbilityCell.piece !== undefined && iiPieceAbilityCell.piece.color !== me.whiteTurn) {
                    //на время переставим фигуры
                    var tempPiece = iiPieceAbilityCell.piece;
                    iiPieceAbilityCell.piece = cell.piece;
                    cell.piece = undefined;

                    //если нет ли угрозы для нашей переставленной фигуры
                    //то добавляем в список возможных ходов
                    if (!me.itIsDangerCell(iiPieceAbilityCell)) {
                        iiAbility.push(new IiMoves(cell, iiPieceAbilityCell));
                    } else if (!safe) {
                        iiAbility.push(new IiMoves(cell, iiPieceAbilityCell));
                    }
                    //вернём фигуры обратно
                    cell.piece = iiPieceAbilityCell.piece;
                    iiPieceAbilityCell.piece = tempPiece;
                }
            });
        });
        //если ходы были найдены то нужно найти самые выгодные
        if (iiAbility.length > 0) {
            iiAbility.sort(this.compareCellsWithEnemyPieces);
            var maxValue = this.costOfPiece(iiAbility[0].move);
            //найдём индекс первого хода, который хуже 0 позиции
            var i;
            for (i = 0; i < iiAbility.length; i++) {
                if (this.costOfPiece(iiAbility[i].move) < maxValue) {
                    break;
                }
            }
            //если есть менее эффективные ходы, то уберём их
            iiAbility.splice(i, iiAbility.length - i + 1);
            return;
        }
    },

    //ИИ хочет походить на безопасную клетку (true) или опасную (false) клетку
    iiWantToMove: function (cellsWithPieces, iiAbility, safe) {
        "use strict";
        var me = this;
        cellsWithPieces.forEach(function (cell) {
            //кликнем на фигуру
            if (cell.piece.name !== 'king') {
                me.notKingClick = true;
            } else {
                me.toKingClick = true;
            }
            //для каждой фигуры из cellsWithPieces получаем ability
            var iiPieceAbility = me.findCellsToMove(cell);
            iiPieceAbility.forEach(function (abilityCell) {
                //если фигура ИИ может съесть фигуру противника
                if (abilityCell.piece === undefined) {
                    //на время переставим фигуру
                    abilityCell.piece = cell.piece;
                    cell.piece = undefined;
                    //если нет ли угрозы для нашей переставленной фигуры
                    //то добавляем в список возможных ходов
                    if (safe && !me.itIsDangerCell(abilityCell)) {
                        iiAbility.push(new IiMoves(cell, abilityCell));
                    }
                    //можно и опасный ход сделать
                    if (!safe) {
                        iiAbility.push(new IiMoves(cell, abilityCell));
                    }
                    //вернём фигуру обратно
                    cell.piece = abilityCell.piece;
                    abilityCell.piece = undefined;
                }
            });
        });

    },

    //ИИ хочет спасти свою фигуру
    iiSavePieces: function (cellsWithPieces, iiAbility, pieceValue) {
        "use strict";
        var me = this;
        //ии ищет все фигуры со стоимостью pieceValue
        var sameCostPiecesCells = [];
        cellsWithPieces.forEach(function (cellWithPiece) {
            if (cellWithPiece.piece.name === 'king') {
                return;
            }
            if (me.costOfPiece(cellWithPiece) === pieceValue) {
                sameCostPiecesCells.push(cellWithPiece);
            }
        });
        //найдём ячейки с фигурами, которым грозит опасность
        var dangerCells = [];
        sameCostPiecesCells.forEach(function (cellWithIiPiece) {
            //если это опасная клетка и её нет в dangerCells
            if (me.itIsDangerCell(cellWithIiPiece) && !dangerCells.includes(cellWithIiPiece)) {
                dangerCells.push(cellWithIiPiece);
            }
        });
        //фигура, которой угрожает опасность пробует съесть вражескую и попасть в безопасное место
        this.iiWantoToEat(dangerCells, iiAbility, true);
        //фигура, которой угрожает опасность пробует попасть в безопасное место
        if (iiAbility.length === 0) {
            this.iiWantToMove(dangerCells, iiAbility, true);
        }
    },

    //ИИ хочет выгодно разменяться съев фигуру уровня level
    iiWantoToChange: function (cellsWithPieces, iiAbility, level) {
        "use strict";
        var me = this;
        //ии пробует найти ходы для фигур из cellsWithPieces
        cellsWithPieces.forEach(function (cell) {
            if (cell.piece.name === 'king') {
                return;
            }
            var pieceLevel = me.costOfPiece(cell);
            //кликнем на фигуру
            if (cell.piece.name !== 'king') {
                me.notKingClick = true;
            } else {
                me.toKingClick = true;
            }
            //для каждой фигуры из cellsWithPieces получаем ability
            var iiPieceAbility = me.findCellsToMove(cell);
            //ищем в ability вражеские фигуры для еды
            iiPieceAbility.forEach(function (iiPieceAbilityCell) {
                //если фигура ИИ может съесть фигуру противника
                if (iiPieceAbilityCell.piece !== undefined && iiPieceAbilityCell.piece.color !== me.whiteTurn) {
                    var enemyLevel = me.costOfPiece(iiPieceAbilityCell);
                    if (enemyLevel === level && enemyLevel > pieceLevel) {
                        //то добавляем в список возможных ходов
                        iiAbility.push(new IiMoves(cell, iiPieceAbilityCell));
                    }
                    if (pieceLevel === 1 && level === 1 && enemyLevel === 1) { //размен пешек
                        //то добавляем в список возможных ходов
                        iiAbility.push(new IiMoves(cell, iiPieceAbilityCell));
                    }
                }
            });
        });
        //если ходы были найдены то нужно найти самые выгодные
        if (iiAbility.length > 0) {
            iiAbility.sort(this.compareCellsWithPieces);
            var minValue = this.costOfPiece(iiAbility[0].current);
            //найдём индекс первого хода, который хуже 0 позиции
            var i;
            for (i = 0; i < iiAbility.length; i++) {
                if (this.costOfPiece(iiAbility[i].current) > minValue) {
                    break;
                }
            }
            //если есть менее эффективные ходы, то уберём их
            iiAbility.splice(i, iiAbility.length - i + 1);
        }
    },

    //ИИ думает над ходом
    iiTurn: function () {
        "use strict";
        if (this.mate || this.pat) {
            return;
        }
        var iiAbility = [];
        //ии находит все свои фигуры
        var cellsWithPieces = this.createEnemyPiecesArray(!this.whiteTurn);

        //ии должен защитить свою фигуру если её не убрать        
        //ии должен сделать шах
        console.log('!!! ИИ НАЧИНАЕТ ДУМАТЬ НАД ХОДОМ !!!');

        //1) комп старается сделать мат
        console.log('1) комп старается сделать мат');
        this.iiWantToDoMate(cellsWithPieces, iiAbility);

        if (iiAbility.length === 0) {
            //2) комп спасает свои фигуры 5 уровня
            console.log('2) комп спасает свои фигуры 5 уровня');
            this.iiSavePieces(cellsWithPieces, iiAbility, 5);

            if (iiAbility.length === 0) {
                //3) комп разменивается на 5 уровень
                console.log('3) комп разменивается на 5 уровень');
                this.iiWantoToChange(cellsWithPieces, iiAbility, 5);

                if (iiAbility.length === 0) {
                    //4) комп спасает свои фигуры 4 уровня
                    console.log('4) комп спасает свои фигуры 4 уровня');
                    this.iiSavePieces(cellsWithPieces, iiAbility, 4);

                    if (iiAbility.length === 0) {
                        //4) комп спасает свои фигуры 3 уровня
                        console.log('4) комп спасает свои фигуры 3 уровня');
                        this.iiSavePieces(cellsWithPieces, iiAbility, 3);

                        if (iiAbility.length === 0) {
                            //4) комп спасает свои фигуры 2 уровня
                            console.log('4) комп спасает свои фигуры 2 уровня');
                            this.iiSavePieces(cellsWithPieces, iiAbility, 2);
                            //6) ии делает ШАХ в 1 из 3х случаев
                            if (iiAbility.length === 0) {
                                //6) комп ест безопасные фигуры
                                console.log('6) комп ест безопасные фигуры');
                                this.iiWantoToEat(cellsWithPieces, iiAbility, true);

                                if (iiAbility.length === 0) {
                                    //7) комп разменивается на 4 уровень
                                    console.log('7) комп разменивается на 4 уровень');
                                    this.iiWantoToChange(cellsWithPieces, iiAbility, 4);

                                    if (iiAbility.length === 0) {
                                        //7) комп разменивается на 3 уровень
                                        console.log('7) комп разменивается на 3 уровень');
                                        this.iiWantoToChange(cellsWithPieces, iiAbility, 3);

                                        if (iiAbility.length === 0) {
                                            //7) комп разменивается на 2 уровень
                                            console.log('7) комп разменивается на 2 уровень');
                                            this.iiWantoToChange(cellsWithPieces, iiAbility, 2);
                                            if (iiAbility.length === 0) {
                                                //7) комп разменивается пешками в 1 из 3х случаев
                                                //ТУТ НУЖНО ПОСТАВИТЬ УСЛОВИЕ 1/3
                                                console.log('7) комп разменивается пешками');
                                                this.iiWantoToChange(cellsWithPieces, iiAbility, 1);

                                                if (iiAbility.length === 0) {
                                                    //8) комп ходит на безопасные клетки
                                                    console.log('8) комп ходит на безопасные клетки');
                                                    this.iiWantToMove(cellsWithPieces, iiAbility, true);

                                                    if (iiAbility.length === 0) {
                                                        //9) комп ест небезопасные фигуры
                                                        console.log('9) комп ест небезопасные фигуры');
                                                        this.iiWantoToEat(cellsWithPieces, iiAbility, false);

                                                        if (iiAbility.length === 0) {
                                                            //10) комп ходит на небезопасные клетки
                                                            console.log('10) комп ходит на любые клетки');
                                                            this.iiWantToMove(cellsWithPieces, iiAbility, false);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        this.iiMove(iiAbility);
//        this.outText();
        console.log('----------------------------------');
        console.log('----------------------------------');
    },

    createTest: function (test) {
        "use strict";
        var moves = [];
        var me = this;
        test.forEach(function (m) {
            var move = m.split('-'); //['a1', 'a2']
            var aX = move[0][0];
            var aY = me.additionalIndexY(move[0][1]);
            var bX = move[1][0];
            var bY = me.additionalIndexY(move[1][1]);
            var aCell = new Cell(aX, aY);
            var bCell = new Cell(bX, bY);
            moves.push({
                a: aCell,
                b: bCell
            });
        });

        moves.forEach(function (m) {
            me.move(me.grid[m.a.number][m.a.letter], me.grid[m.b.number][m.b.letter]);

        });


    }
};

//кнопки
var buttons = {
    bHvC: document.querySelector('#b1'),
    bCvC: document.querySelector('#b2'),
    bHvH: document.querySelector('#b3'),
    bChange: document.querySelector('#b4'),
    bMainMenu: document.querySelector('#b5'),
    bBack: document.querySelector('#b6'),
    bNext: document.querySelector('#b8'),

    hideMain: function () {
        "use strict";
        this.bHvC.classList.add('displayNone');
        this.bCvC.classList.add('displayNone');
        this.bHvH.classList.add('displayNone');
        this.bChange.classList.add('displayNone');
        this.bMainMenu.classList.remove('displayNone');
        this.bBack.classList.remove('displayNone');
        this.bNext.classList.remove('displayNone');
    },

    showMain: function () {
        "use strict";
        this.bHvC.classList.remove('displayNone');
        this.bCvC.classList.remove('displayNone');
        this.bHvH.classList.remove('displayNone');
        this.bChange.classList.remove('displayNone');
        this.bMainMenu.classList.add('displayNone');
        this.bBack.classList.add('displayNone');
        this.bNext.classList.add('displayNone');
    },

    setEvents: function () {
        "use strict";
        var me = this;
        this.bHvC.onclick = function () {
            info.start();
            info.turn = true;
            info.changeTurn();
            me.hideMain();
            board.start = true;
            board.HvC = true;
            if (!board.bottomTurn) {
                board.iiTurn();
            }
        };
        this.bCvC.onclick = function () {
            me.hideMain();
            info.start();
            info.turn = true;
            info.changeTurn();
            board.start = true;
            board.CvC = true;
            board.iiTurn();
        };
        this.bHvH.onclick = function () {
            info.start();
            info.turn = true;
            me.hideMain();
            info.changeTurn();
            board.start = true;

        };
        this.bChange.onclick = function () {
            board.arrangement(!board.bottomTurn);
            board.drawPieces();
        };
        this.bMainMenu.onclick = function () {
            board.reset();
            me.showMain();
            info.none();
            log.clear();
        };
        this.bBack.onclick = function () {
            var turn = log.remove();
            if (turn === undefined) {
                return;
            }
            info.changeTurn();
            board.previousTurn(turn);
        };
        this.bNext.onclick = function () {
            board.iiTurn();
        };
    }
};

//var t = 'B5-C7*F6-E4*C3-B5*B4-C6*A2-A3*G4-F6*H2-H3*H7-H5*G5-F4*G8-H8*F1-C4*H8-G8*E2-E3*F6-G4*E3-G5*G8-F6*D2-E3*F7-F5*C1-D2*C6-B4*B1-C3*B8-C6*G1-F3*B7-B6*D2-D4';
//t = t.toLowerCase();
//var test = t.split('*');
//test.reverse();

board.createBoard();
buttons.setEvents();
//board.createTest(test);
