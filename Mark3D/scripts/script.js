//===========================
//===========DATA============
//===========================
var map = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, -1, 0, 1, 0],
    [-1, 0, 0, 1, 1, 0, 0, 0, 1, 0],
    [-1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0],
    [-1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [-1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0],
    [-1, -1, -1, 0, 0, 0, 0, 0, 0, 0, 0]
];
var mapHeight = map.length;
var mapWidth = 0;
for(var i = 0; i<map.length;i++) {
    if(map[i].length>mapWidth) mapWidth=map[i].length;
}
var turns = 0;
var damage = 5;
var creep = {
    hp: 25
}
var charList = [
    {name: "Satelle Shan", color: "blue", posX: 1, posY: 1, moveRange: 2, initiative: 3, hp: 15,
        attacks: [{name:"Saber strike", range : 1, damage: 5},{name:"Force Push", range : 3, damage: 2}]},
    {name: "Darth Malgus", color: "yellow", posX: 2, posY: 3, moveRange: 2, initiative: 4, hp: 20,
        attacks: [{name:"Saber strike", range : 1, damage: 6},{name:"Saber throw", range : 2, damage: 4}]},
    {name: "Master Yoda", color: "purple", posX: 9, posY: 9, moveRange: 1, initiative: 2, hp: 15,
        attacks: [{name:"Saber strike", range : 1, damage: 4},{name:"Force Push", range : 4, damage: 2}]},
    {name: "Boba Fett", color: "orange", posX: 2, posY: 9, moveRange: 5, initiative: 6, hp: 15,
        attacks: [{name:"Flamethrower", range : 1, damage: 10},{name:"Blaster", range : 4, damage: 1}]}
];
window.current_player;
window.temp_attack;
//===========================
//=======END OF DATA=========
//===========================

//===========================
//=========FUNCTIONS=========
//===========================
function dynamicSort(property) {
    var sortOrder = -1;
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
function create (className) {
    return document.createElement(className);
}
function getById(string) {
    return document.getElementById(string);
}
function clickCell (object,action) {
    return object.setAttribute("onClick", action);
}
function makeMoveable (position,pos_prev,pers,x,y) {
    allCells()[position].className = "moveable";
    allCells()[position].style.border = "0px;";
    clickCell(allCells()[position],'moveChar(' + pos_prev + ',' + pers + ',' + x + ',' + y + ')');
}
function makeAttackable (position,pers,damage,x,y) {
    allCells()[position].className = "attackable";
    allCells()[position].style.border = "0px;";
    clickCell(allCells()[position], 'attackChar(' + allCells()[position].id + ',' + pers + ',' + damage + ',' + x + ',' + y + ')');
}
var allCells = function () {
    return document.getElementsByTagName('td');
}
var createCharDiv = function (pers, position) {
    var character = create('div');
    character.id = charList[pers].name;
    var tridiv = create('div');
    tridiv.id = "tridiv";
    var scene = create('div');
    scene.className = "scene";
    var cube = create('div');
    cube.className = "shape cuboid-1 cub-1";
    var ft = create('div');
        ft.className = "face ft";
        ft.style.backgroundColor = charList[pers].color;
        var shader = create('div');
        shader.className = "photon-shader";
        shader.style.backgroundColor = charList[pers].color;
        ft.appendChild(shader);
    var bk = create('div');
        bk.className = "face bk";
        bk.style.backgroundColor = charList[pers].color;
        var shader = create('div');
        shader.className = "photon-shader";
        shader.style.backgroundColor = charList[pers].color;
        bk.appendChild(shader);
    var rt = create('div');
        rt.className = "face rt";
        rt.style.backgroundColor = charList[pers].color;
        var shader = create('div');
        shader.className = "photon-shader";
        shader.style.backgroundColor = charList[pers].color;
        rt.appendChild(shader);
    var lt = create('div');
        lt.className = "face lt";
        lt.style.backgroundColor = charList[pers].color;
        var shader = create('div');
        shader.className = "photon-shader";
        shader.style.backgroundColor = charList[pers].color;
        lt.appendChild(shader);
    var bm = create('div');
        bm.className = "face bm";
        bm.style.backgroundColor = charList[pers].color;
        var shader = create('div');
        shader.className = "photon-shader";
        shader.style.backgroundColor = charList[pers].color;
        bm.appendChild(shader);
    var tp = create('div');
        tp.className = "face tp";
        tp.style.backgroundColor = charList[pers].color;
        var shader = create('div');
        shader.className = "photon-shader";
        shader.style.backgroundColor = charList[pers].color;
        tp.appendChild(shader);
    cube.appendChild(ft);
    cube.appendChild(bk);
    cube.appendChild(rt);
    cube.appendChild(lt);
    cube.appendChild(bm);
    cube.appendChild(tp);
    scene.appendChild(cube);
    tridiv.appendChild(scene);
    character.appendChild(tridiv);
    
    allCells()[position].appendChild(character);
    allCells()[position].id = pers;
}
var deleteCharDiv = function (pers) {
    if (getById(charList[pers].name)) {
        getById(charList[pers].name).remove();
    }
}
var clearCells = function () {
    for (var i = 0; i < allCells().length; i++) {
        if (allCells()[i].className != "clear" && allCells()[i].className != "enemy") {
            allCells()[i].className = "";
            clickCell(allCells()[i], "");
        }
    }
}
function getPosition(i, j) {
    var temp = 0;
    for (var k = 0; k < i; k++) {
        temp += map[k].length;
    }
    temp += j;
    return temp;
}
function initTopBar() {
    var body = getById('gamespace'),
        topbar = create('div');
    topbar.className = "top_bar";
    var charName = create('div');
    var charStats = create('div');
    charName.innerHTML = "";
    charName.id = "charName";
    topbar.appendChild(charName);
    charStats.innerHTML = "";
    charStats.id = "charStats";
    topbar.appendChild(charStats);
    body.appendChild(topbar);
}
function initMap() {
    var body = getById('gamespace'), gameMap = create('div'), tbl = create('table');
    for (var i = 0; i < mapHeight; i++) {
        var tr = tbl.insertRow();
        console.log(i*100+"px");

        for (var j = 0; j < map[i].length; j++) {
            switch (map[i][j]) {
                case -1: //empty cell
                    var td = tr.insertCell();
                    td.className = "clear";
                    clickCell(td, "");
                    break;
                case 0:
                    var td = tr.insertCell();
                    td.style.background = "black";
                    clickCell(td, "");
                    break;
                // case 0.01:
                //     var td = tr.insertCell();
                //     td.style.border = "none";
                //     td.style.backgroundImage = "url('../img/wall_top.svg')";
                //     td.setAttribute("onClick", "");
                //     break;
                // case 0.02:
                //     var td = tr.insertCell();
                //     td.style.border = "none";
                //     td.style.background = "url('../img/wall_bot.svg')";
                //     td.setAttribute("onClick", "");
                //     break;
                // case 0.03:
                //     var td = tr.insertCell();
                //     td.style.border = "none";
                //     td.style.background = "url('../img/wall_left.svg')";
                //     td.setAttribute("onClick", "");
                //     break;
                // case 0.04:
                //     var td = tr.insertCell();
                //     td.style.border = "none";
                //     td.style.background = "url('../img/wall_right.svg')";
                //     td.setAttribute("onClick", "");
                //     break;
                // case 0.1: //top left angle
                //     var td = tr.insertCell();
                //     td.className = "clear";
                //     td.id = "bot_right";
                //     td.setAttribute("onClick", "");
                //     break;
                // case 0.2: //top right angle
                //     var td = tr.insertCell();
                //     td.className = "clear";
                //     td.id = "bot_left";
                //     td.setAttribute("onClick", "");
                //     break;
                // case 0.3: //bot left angle
                //     var td = tr.insertCell();
                //     td.className = "clear";
                //     td.id = "top_right";
                //     td.setAttribute("onClick", "");
                //     break;
                // case 0.4: //bot right angle
                //     var td = tr.insertCell();
                //     td.className = "clear";
                //     td.id = "top_left";
                //     td.setAttribute("onClick", "");
                //     break;
                case 1:
                    var td = tr.insertCell();
                    td.className = "activeCell";
                    clickCell(td, "");
                    break;
                case 2:
                    var td = tr.insertCell();
                    td.className = "enemy";
                    clickCell(td, "");
                    break;
                default:
                    break;
            }
        }
    }
    gameMap.id = "gameMap";
    gameMap.appendChild(tbl);
    body.appendChild(gameMap);
}
function initBotBar() {
    var body = getById('gamespace'),
        botbar = create('div');
    botbar.className = "bot_bar";
    var charActions = create('div');
    var battleLog = create('div');
    charActions.innerHTML = "";
    charActions.id = "charActions";
    var skipButton = create('button');
    skipButton.innerHTML="WAIT";
    clickCell(skipButton, 'skipTurn();');
    charActions.appendChild(skipButton);
    var runButton = create('button');
    runButton.innerHTML="RUN AWAY";
    clickCell(runButton, 'runAway();');
    charActions.appendChild(runButton);
    battleLog.innerHTML = "";
    battleLog.id = "battleLog";
    botbar.appendChild(charActions);
    botbar.appendChild(battleLog);
    body.appendChild(botbar);
}
function initMovement(pos_prev, pers, x, y) {
    makeMoveable(pos_prev,pos_prev,pers,x,y);
    var k=1;
    var prev_cells = [[x,y]];
    var temp_cells = [];
    while(k<=charList[pers].moveRange) {
        var temp_cells = [];
        for(var tcell=0;tcell<prev_cells.length;tcell++) {
            var x = prev_cells[tcell][0]; var y = prev_cells[tcell][1];
            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    var position = getPosition(x + i, y + j);
                    if (allCells()[position].className != "moveable") {
                        if (i == 0 && j == 0) {
                            temp_cells.push([x+i,y+j]);
                        }
                        else {
                            if (map[x + i][y + j] == 1) {
                                if (allCells()[position].id == "") {
                                    temp_cells.push([x+i,y+j]);
                                }
                            }
                        }
                    }
                }
            }
        }
        for(var tcell=0;tcell<temp_cells.length;tcell++) {
            var x = temp_cells[tcell][0]; var y = temp_cells[tcell][1]; var position = getPosition(temp_cells[tcell][0],temp_cells[tcell][1]);
            makeMoveable(position,pos_prev,pers,x,y);
        }
        prev_cells = temp_cells;
        k++;
    }
}
function initAttack(pos_prev, pers, x, y) {
    getById('attackPopUp').style.display = "block";
    getById('attackSelect').innerHTML = "";
    window.temp_attack = [pos_prev, pers, x, y];
    for(var attack=0; attack<charList[pers].attacks.length; attack++) {
        var option = create("option");
        option.value = attack;
        option.text = charList[pers].attacks[attack].name;
        getById('attackSelect').add(option);
    }
}
function makeAttack() {
    var attack = charList[window.temp_attack[1]].attacks[getById('attackSelect').value];
    prepareAttack(window.temp_attack[0], attack.range, attack.damage, window.temp_attack[1], window.temp_attack[2], window.temp_attack[3])
}
function prepareAttack(pos_prev, attackRange, damage, pers, x, y) {
    getById('attackPopUp').style.display = "none";
    var targets = 0;
    for (var i = -attackRange; i <= attackRange; i++) {
        for (var j = -attackRange; j <= attackRange; j++) {
            if (i == 0 && j == 0) {
            }
            else if (x + i < 0 || y + j < 0 || Math.abs(x + i) >= mapHeight || Math.abs(y + j) >= mapWidth) {
            }
            else {
                var position = getPosition(x + i, y + j);
                if (map[x + i][y + j] == 1) {
                    if (allCells()[position].id != "") {
                        if(ifOnLine(x,y,x+i,y+j)) {
                            targets++;
                            makeAttackable(position,pers,damage,x+i,y+j);
                        }
                    }
                }
                // if (map[x + i][y + j] == 2) {
                //     targets++;
                //     allCells()[position].setAttribute("onClick", 'attackCreep(' + pers + ','
                //         + damage + ',' + (x + i) + ',' + (y + i) + ');');
                // }
            }
        }
    }
    if(targets==0) {giveTurn(pers);}
}
function skipTurn() {
    clearCells();
    battleLogWrite("" + charList[window.current_player].name +  " decided to wait .");
    giveTurn(window.current_player);
}
function runAway() {
    var target = window.current_player;
    var pers = window.current_player;
    battleLogWrite("" + charList[pers].name +  " leaved battleground .");
    var position = getPosition(charList[target].posX, charList[target].posY);
    deleteCharDiv(target);
    clearCells();
    allCells()[position].id = "";
    allCells()[position].className = "";
    allCells()[position].setAttribute("onClick", "");
    charList.splice(target, 1);
    reInitChars(pers);
}
function battleLogWrite (string) {
    var battlelog = getById("battleLog");
    var message = create('div');
    message.className = "battleLogMessage";
    message.innerHTML = string;
    if(battlelog.firstChild) battlelog.insertBefore(message,battlelog.firstChild);
    else battlelog.appendChild(message);
}
function set_point(x, y) {
    try {
        ArrayOfPoints.push([x, y]);
    } catch (E) {}
}
function abs(x) {
    return Math.abs(x);
}
function cut_line(x1, y1, x2, y2) {
    return true;
}
function ifOnLine(x1, y1, x2, y2) {
    var ArrayOfPoints = [];
    if (y1 == y2) {
        if (x1 > x2) {
            var t = x1;
            x1 = x2;
            x2 = t;
        }
        while (x1 <= x2) {
            try {
                ArrayOfPoints.push([x1++, y1]);
            } catch (E) {}
        }
    } else if (x1 == x2) {
        if (y1 > y2) {
            var t = y1;
            y1 = y2;
            y2 = t;
        }
        while (y1 <= y2) {
            try {
                ArrayOfPoints.push([x1, y1++]);
            } catch (E) {}
        }
    } else if (cut_line(x1, y1, x2, y2)) {
        var Z = 0;
        var kx, ky, max_dev, step_small;
        if (abs(x1 - x2) >= abs(y1 - y2)) {
            if (x1 > x2) {
                var t = x1;
                x1 = x2;
                x2 = t;
                t = y1;
                y1 = y2;
                y2 = t;
            }
            kx = abs(y2 - y1);
            ky = x2 - x1;
            step_small = (y1 > y2) ? -1 : 1;
            max_dev = ky >> 1;
            while (x1 <= x2) {
                    try {
                        ArrayOfPoints.push([x1, y1]);
                    } catch (E) {}
                x1++;
                Z += kx;
                if (Z > max_dev) {
                    y1 += step_small;
                    Z -= ky;
                }
            }
        } else {
            if (y1 > y2) {
                var t = x1;
                x1 = x2;
                x2 = t;
                t = y1;
                y1 = y2;
                y2 = t;
            }
            kx = y2 - y1;
            ky = abs(x2 - x1);
            step_small = (x1 > x2) ? -1 : 1;
            max_dev = kx >> 1;
            while (y1 <= y2) {
                    try {
                        ArrayOfPoints.push([x1, y1]);
                    } catch (E) {}
                y1++;
                Z += ky;
                if (Z > max_dev) {
                    x1 += step_small;
                    Z -= kx;
                }
            }
        }
    }
    console.log(ArrayOfPoints);
    var covers = 0;
    for(var k=0;k<ArrayOfPoints.length;k++) {
        if(map[ArrayOfPoints[k][0]][ArrayOfPoints[k][1]]<=0) covers++;
    }
    if(covers==0) {return true;}
    else {return false;}
}
//===========================
//======END OF FUNCTIONS=====
//===========================

//===========================
//===========GAME============
//===========================
function initGame() {
    getById('gameSettings').style.display="none";
    initTopBar();
    initMap();
    initBotBar();
    initChars();
}
function initChars() {
    charList.sort(dynamicSort("initiative"));
    var pers = 0;
    while (pers < charList.length) {
        deleteCharDiv(pers);
        createCharDiv(pers, getPosition(charList[pers].posX, charList[pers].posY));
        battleLogWrite("Character " + charList[pers].name + " created");
        pers++;
    }
    battleLogWrite("All characters are created");
    giveTurn(charList.length - 1);
}
function reInitChars(killer) {
    var pers = 0;
    while (pers < charList.length) {
        deleteCharDiv(pers);
        createCharDiv(pers, getPosition(charList[pers].posX, charList[pers].posY));
        pers++;
    }
    giveTurn(killer);
}
function giveTurn(pers) {
    if (charList.length > 1) {
        if (pers < charList.length - 1) {
            pers++;
        }
        else {
            pers = 0;
        }
        window.current_player = pers;
        getById("charName").innerHTML = charList[pers].name;
        getById("charStats").innerHTML = "hp : " + charList[pers].hp;
        getById("charStats").innerHTML += " . damage : " + charList[pers].attacks[0].damage + " / " + charList[pers].attacks[1].damage;
        alert("" + charList[pers].name + "\'s turn");
        battleLogWrite("" + charList[pers].name + "\'s turn");
        initAction(pers, charList[pers].posX, charList[pers].posY);
    }
    else {
        window.current_player = pers;
        alert("" + charList[0].name + " wins!!!");
        battleLogWrite("" + charList[0].name + " wins!!!");
    }
}
function initAction(pers, x, y) {
    var pos_prev = getPosition(x, y);
    //initAttack(pos_prev, pers, x, y);
    initMovement(pos_prev, pers, x, y);
}
function moveChar(prev, pers, x, y) {
    allCells()[prev].id = "";
    deleteCharDiv(pers);
    charList[pers].posX = x;
    charList[pers].posY = y;
    clearCells();
    createCharDiv(pers, getPosition(charList[pers].posX, charList[pers].posY));
    battleLogWrite("" + charList[pers].name + " moved to : ( " + x + " : " + y + " ) .");
    initAttack(prev, pers, x, y);
}
function attackCreep(pers, damage, x, y) {
    for (var i = 0; i < allCells().length; i++) {
        if (allCells()[i].className != "clear" && allCells()[i].className != "enemy") {
            allCells()[i].className = "";
            clickCell(allCells()[i], "");
        }
    }
    var position = getPosition(x, y);
    if (creep.hp > 0) creep.hp -= damage;
    else {
        map[x][y] = 1;
        allCells()[position].className = "moveable";
        allCells()[position].style.border = "0px;";
        clickCell(allCells()[position], 'initChar(' + x + ',' + y + ');');
    }
    giveTurn(pers);
}
function attackChar(target, pers, damage, x, y) {
    clearCells();
    if (charList[target].hp > 0) {
        charList[target].hp -= damage;
        battleLogWrite("" + charList[pers].name + " did " + damage + " damage to " + charList[target].name + " with \""
            + charList[pers].attacks[getById('attackSelect').value].name + "\" .");
        if (charList[target].hp <= 0) {
            killChar(target, pers, x, y);
        }
        else {
            giveTurn(pers);
        }
    }
    else {
        killChar(target);
    }
}
function killChar(target, pers, x, y) {
    battleLogWrite("" + charList[pers].name + " killed " + charList[target].name + " .");
    var position = getPosition(charList[target].posX, charList[target].posY);
    deleteCharDiv(target);
    allCells()[position].id = "";
    allCells()[position].className = "";
    clickCell(allCells()[position], "");
    charList.splice(target, 1);
    reInitChars(pers);
}
//===========================
//========END OF GAME========
//===========================
