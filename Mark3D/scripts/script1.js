var trX = 50, trY = 0, trZ = 15, rotX = 0, rotY = -180, rotZ = 0, classTemplate = "shape cuboid-1 cub";
transforming('place',0,0,0,trX,trY,trZ,0,0);
getById('place').style.transform = "rotateX(0deg) rotateY(0deg) rotateZ(0deg) translate3d(" + trX + "px," + trY + "px," + trZ + "px) skewX(0deg) skewY(0deg)";

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

var requestedElement = document.getElementById('camera');
var requestedElement1 = document.getElementById('dot');
requestedElement.requestPointerLock = requestedElement.requestPointerLock || requestedElement.mozRequestPointerLock || requestedElement.webkitRequestPointerLock;
document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;

var isLocked = function(){
    return requestedElement === document.pointerLockElement ||
    requestedElement === document.mozPointerLockElement ||
    requestedElement === document.webkitPointerLockElement;
};

requestedElement.addEventListener('click', function(){
    if(!isLocked()){
        requestedElement.requestPointerLock();
    } else {
        document.exitPointerLock();
    }
}, false);
requestedElement1.addEventListener('click', function(){
    if(!isLocked()){
        requestedElement.requestPointerLock();
    } else {
        document.exitPointerLock();
    }
}, false);
var changeCallback = function() {
    if(!havePointerLock){
        alert('Ваш браузер не поддерживает pointer-lock');
        return;
    }
    if (isLocked()) {
        document.addEventListener("mousemove", turningFunction, false);
        document.addEventListener("keydown", movementFunction, false);
        // document.body.classList.add('locked');
    } else {
        document.removeEventListener("mousemove", turningFunction, false);
        document.body.classList.remove('locked');
    }
};

document.addEventListener('pointerlockchange', changeCallback, false);
document.addEventListener('mozpointerlockchange', changeCallback, false);
document.addEventListener('webkitpointerlockchange', changeCallback, false);







function movementFunction(event){
    var sin2 = Math.sin(rotY*Math.PI/180), cos2 = Math.cos(rotY*Math.PI/180);
    if(event.keyCode === 87){ // forward
        if(calculateCollision(trX - 20*sin2,trZ + 20*cos2)) {
            trX -= 20*sin2;
            trZ += 20*cos2;
        }
    }
    if(event.keyCode === 65){ // left
        if(calculateCollision(trX + 20*cos2,trZ + 20*sin2)) {
            trX += 20*cos2;
            trZ += 20*sin2;
        }
    }
    if(event.keyCode === 68){ // right
        if(calculateCollision(trX - 20*cos2,trZ - 20*sin2)) {
            trX -= 20*cos2;
            trZ -= 20*sin2;
        }
    }
    if(event.keyCode === 83){ // back

        if(calculateCollision(trX + 20*sin2,trZ - 20*cos2)) {
            trX += 20*sin2;
            trZ -= 20*cos2;
        }
    }
    transforming('place',0,0,0,trX,trY,trZ,0,0);
    return false;
}
function turningFunction(event) {
    var y = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var x = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    if(rotX - x/2 > -30 && rotX - x/2 < 90) rotX -= x/2;
    rotY += y/2;
    transforming('camera',rotX,rotY,0,0,0,700,0,0);
    return false;
}
function scrollingFunction(event) {
}
function calculateCollision(x,z) {
    var temp = 0;
    for(var i = 0; i < minimap.length-1; i++) {
        var stX = minimap[i].SPX;
        var stZ = minimap[i].SPZ - 700;
        if(Math.abs(x - minimap[i].width/2 - stX) <  minimap[i].width/2 + 20
            && Math.abs(z - stZ) < minimap[i].length/2 + 20) {
            temp++;
        }
    }
    if(temp==0) return true;
    else return false;
}
function calculateMap(minimap) {
    var minimap1 = [];
    for(var i = 0; i < minimap.length; i++) {
        var temp = {};
    }
}




function createMinimapSmall(minimap) {
    for(var i = 0; i < minimap.length; i++) {
    }
}

var cubeStats1 = {
    SPX : 0,
    SPY : 0,
    SPZ : 400,
    angX : 0,
    angY : -180,
    angZ : -60,
    length : 200,
    width : 300,
    height : 300,
    class_top : 'roof_style',
    class_bot : 'roof_style',
    class_front : 'roof_style',
    class_back : 'roof_style',
    class_sideleft : 'roof_style',
    class_sideright : 'roof_style'
};

//getById('place-inner').appendChild(createCuboid(cubeStats1));
for(var i=0; i<minimap.length; i++) {
    getById('place-inner').appendChild(createCuboid(minimap[i]));
}
// for(var i=0; i<7; i++) {
//     getById('place-inner').appendChild(createBarrel(i));
// }

// var cubeStatsTemplate = {
//     SPX : '',
//     SPY : '',
//     SPZ : '',
//     angX : '',
//     angY : '',
//     angZ : '',
//     length : '',
//     width : '',
//     height : '',
//     class_top : '',
//     class_bot : '',
//     class_front : '',
//     class_back : '',
//     class_sideleft : '',
//     class_sideright : ''
// }







