function createElem(_tag) {
	return document.createElement(_tag)
}
function getById(_id) {
	return document.getElementById(_id)
}
function transforming(target,rX,rY,rZ,tX,tY,tZ,sX,sY) {
	getById(target).style.transform = "translate3d("+tX+"px,"+tY+"px,"+tZ+"px) rotateX("+rX+"deg) rotateY("+rY+"deg) rotateZ("+rZ+"deg) skewX("+sX+"deg) skewY("+sY+"deg)"; 
}

// create Cuboid
function createCuboidSide(_style,_class) {
	var cuboidSide = createElem("div"); //top
	cuboidSide.className = 'face';
	cuboidSide.style.cssText = PrefixFree.prefixCSS(_style);
	var photon = createElem("div");
	photon.className = "photon-shader " + _class;
	cuboidSide.appendChild(photon);
	return cuboidSide;
}
function createCuboid(cubeStats) {
	var cube = createElem("div"); cube.className = classTemplate;
	cube.style.transform = 'translate3D(' + cubeStats.SPX + 'px,' + cubeStats.SPY + 'px,' + cubeStats.SPZ + 'px) rotateX(' + cubeStats.angX + 'deg) rotateY(' + cubeStats.angY + 'deg) rotateZ(' + cubeStats.angZ + 'deg)';
	cube.appendChild(createCuboidSide('height:' + cubeStats.length + 'px;width:' + cubeStats.width + 'px;transform: rotateX(90deg) translateY(-50%);',cubeStats.class_top));
	cube.appendChild(createCuboidSide('height:' + cubeStats.length + 'px;width:' + cubeStats.width + 'px;top:' + cubeStats.height + 'px;transform: rotateX(-90deg) translateY(-50%);',cubeStats.class_bot));
	cube.appendChild(createCuboidSide('height:' + cubeStats.height + 'px;width:' + cubeStats.width + 'px;'+'transform: translateZ(' + cubeStats.length/2 + 'px);',cubeStats.class_front));
	cube.appendChild(createCuboidSide('height:' + cubeStats.height + 'px;width:' + cubeStats.width + 'px;left:' + cubeStats.width + 'px;transform: translateZ(-' + cubeStats.length/2 + 'px) rotateY(180deg);',cubeStats.class_back));
	cube.appendChild(createCuboidSide('height:' + cubeStats.height + 'px;width:' + cubeStats.length+ 'px;'+'transform: rotateY(-90deg) translateX(-50%);',cubeStats.class_sideleft));
	cube.appendChild(createCuboidSide('height:' + cubeStats.height + 'px;width:' + cubeStats.length + 'px;left:' + cubeStats.width + 'px;transform: rotateY(90deg) translateX(-50%);',cubeStats.class_sideright));
	return cube;
}
// create Cuboid

// create Cylinder
function createAssembly(i) {
	var assembly = createElem("div");
	assembly.className = "threedee assembly assembly" + i;
	return assembly;
}
function createCylinderFace(w, h, x, y, z, rx, ry, rz, tsrc, tx, ty) {
	var face = createElem("div"); face.className = "threedee face1";
	face.style.cssText = PrefixFree.prefixCSS("background: url(" + tsrc + ") -" + tx.toFixed(2) + "px " + ty.toFixed(2) + "px;width:" + w.toFixed(2) + "px;" +
		"height:" + h.toFixed(2) + "px;margin-top: -" + (h / 2).toFixed(2) + "px;margin-left: -" + (w / 2).toFixed(2) + "px;transform: translate3d(" + x.toFixed(2) +
		"px," + y.toFixed(2) + "px," + z.toFixed(2) + "px) rotateX(" + rx.toFixed(2) + "rad) rotateY(" + ry.toFixed(2) + "rad) rotateY(" + rz.toFixed(2) + "rad);");
	return face;}
function createTube(dia, height, sides, texture,i) {
	var tube = createAssembly(i), sideAngle = (Math.PI / sides) * 2, sideLen = dia * Math.tan(Math.PI/sides);
	for (var c = 0; c < sides; c++) {var x = Math.sin(sideAngle * c) * dia / 2, z = Math.cos(sideAngle * c) * dia / 2, ry = Math.atan2(x, z);
		tube.appendChild(createCylinderFace(sideLen + 1, height, x, 0, z, 0, ry, 0, texture, sideLen * c, 0));}
	return tube;
}
function createBarrel(i) {
	var barrel = createTube(100, 196, 20, "./img/drum2.png",i);
	barrel.appendChild(createCylinderFace(100, 100, 0, -98, 0, Math.PI / 2, 0, 0, "./img/drum2.png", 0, 100));
	barrel.appendChild(createCylinderFace(100, 100, 0, 98, 0, -Math.PI / 2, 0, 0, "./img/drum2.png", 0, 100));
	return barrel;
}
// create Cylinder