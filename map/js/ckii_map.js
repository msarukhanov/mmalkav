var map = L.map('map', {
    crs: L.CRS.Simple
}).setView([-800, 800], 0);

//L.tileLayer('', {
//    minZoom: 0,
//    maxZoom: 2,
//    //attribution: 'Paradox Interactive / Erkki Mattila',
//    tms: true,
//    continuousWorld: true
//}).addTo(map);


// Mapmode changer, information box

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props, id, culture, religion) {
    this._div.innerHTML = '<br><h4>Click on a province to zoom in</h4>' + (props ? props.name: "") + '<br>' + (id ? id: "") + '<br>' + (culture ? culture: "") + '<br>' + (religion ? religion:"");
};

var mapmodes = L.control();
var current_mapmode = "countries";
mapmodes.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'mapmode');
    this.update();
    return this._div;
};
mapmodes.update = function() {
    this._div.innerHTML =
        '<h1>Map mode</h1>' +
        '<p>Countries</p>' +
        '<button onClick="showReligions()">Religions</button> ' +
        '<button onClick="showCultures()">Cultures</button>' +
        '<button onClick="showCountries()">Countries</button>';
};
mapmodes.setPosition('bottomright');
mapmodes.addTo(map);

var countryhelp = L.control();
countryhelp.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'mapmode');
    this.update();
    return this._div;
};

countryhelp.update = function() {
    this._div.innerHTML =
        '<h1>Country colors :</h1>' +
        '<p><b style="float:left">Aragon </b> : <span class="contry-color-list" style="background-color: rgb(212,175,55)"></span></p>' +
        '<p><b style="float:left">Navarra </b> : <span class="contry-color-list" style="background-color: rgb(140,0,140)"></span></p>' +
        '<p><b style="float:left">Leon </b> : <span class="contry-color-list" style="background-color: rgb(58,117,196)"></span></p>' +
        '<p><b style="float:left">Castile </b> : <span class="contry-color-list" style="background-color: rgb(255,210,0)"></span></p>' +
        '<p><b style="float:left">Mauritania </b> : <span class="contry-color-list" style="background-color: rgb(236,88,0)"></span></p>' +
        '<p><b style="float:left">France </b> : <span class="contry-color-list" style="background-color: rgb(0,87,177)"></span></p>' +
        '<p><b style="float:left">Burgundy </b> : <span class="contry-color-list" style="background-color: rgb(140,0,70)"></span></p>' +
        '<p><b style="float:left">Toulouse </b> : <span class="contry-color-list" style="background-color: rgb(212,3,238)"></span></p>' +
        '<p><b style="float:left">England </b> : <span class="contry-color-list" style="background-color: rgb(215,0,0)"></span></p>' +
        '<p><b style="float:left">Scotland </b> : <span class="contry-color-list" style="background-color: rgb(0,16,94)"></span></p>' +
        '<p><b style="float:left">Wales </b> : <span class="contry-color-list" style="background-color: rgb(20,67,244)"></span></p>' +
        '<p><b style="float:left">Ireland </b> : <span class="contry-color-list" style="background-color: rgb(34,93,48)"></span></p>' +
        '<p><b style="float:left">Holy Roman Empire </b> : <span class="contry-color-list" style="background-color: rgb(30,30,30)"></span></p>' +
        '<p><b style="float:left">Norway </b> : <span class="contry-color-list" style="background-color: rgb(239, 185, 24)"></span></p>' +
        '<p><b style="float:left">Sweden </b> : <span class="contry-color-list" style="background-color: rgb(128,36,26)"></span></p>' +
        '<p><b style="float:left">Poland </b> : <span class="contry-color-list" style="background-color: rgb(230,230,230)"></span></p>' +
        '<p><b style="float:left">Lithuania </b> : <span class="contry-color-list" style="background-color: rgb(128,55,34)"></span></p>' +
        '<p><b style="float:left">Hungary </b> : <span class="contry-color-list" style="background-color: rgb(221,70,50)"></span></p>' +
        '<p><b style="float:left">Polovets </b> : <span class="contry-color-list" style="background-color: rgb(116,45,13)"></span></p>' +
        '<p><b style="float:left">Russia </b> : <span class="contry-color-list" style="background-color: rgb(12,30,119)"></span></p>' +
        '<p><b style="float:left">Milan </b> : <span class="contry-color-list" style="background-color: rgb(1,82,9)"></span></p>' +
        '<p><b style="float:left">Bologna </b> : <span class="contry-color-list" style="background-color: rgb(255,167,11)"></span></p>' +
        '<p><b style="float:left">Napoli </b> : <span class="contry-color-list" style="background-color: rgb(70,70,70)"></span></p>' +
        '<p><b style="float:left">Rome </b> : <span class="contry-color-list" style="background-color: rgb(200,200,155)"></span></p>' +
        '<p><b style="float:left">Venice </b> : <span class="contry-color-list" style="background-color: rgb(121,3,3)"></span></p>' +
        '<p><b style="float:left">Byzantium </b> : <span class="contry-color-list" style="background-color: rgb(76,36,78)"></span></p>' +
        '<p><b style="float:left">Turks </b> : <span class="contry-color-list" style="background-color: rgb(34,107,9)"></span></p>' +
        '<p><b style="float:left">Armenia </b> : <span class="contry-color-list" style="background-color: rgb(32,70,68)"></span></p>' +
        '<p><b style="float:left">Kwarezm </b> : <span class="contry-color-list" style="background-color: rgb(0,139,129)"></span></p>' +
        '<p><b style="float:left">Egypt </b> : <span class="contry-color-list" style="background-color: rgb(211,176,69)"></span></p>' +
        '<p><b style="float:left">Independent </b> : <span class="contry-color-list" style="background-color: rgb(110,110,110)"></span></p>'


};
countryhelp.setPosition('bottomleft');
countryhelp.addTo(map);

info.addTo(map);

var geojson = L.geoJson(ckii_provdata, {
    style: style_countries,
    onEachFeature: onEachFeature
}).addTo(map);

function showCultures() {
    geojson.setStyle(style_cultures);
    mapmodes._div.childNodes[1].innerHTML = "Cultures";
    current_mapmode = "cultures"
}

function showReligions() {
    geojson.setStyle(style_religions);
    mapmodes._div.childNodes[1].innerHTML = "Religions";
    current_mapmode = "religions"
}

function showCountries() {
    geojson.setStyle(style_countries);
    mapmodes._div.childNodes[1].innerHTML = "Countries";
    current_mapmode = "countries"
}

function getCultureColours(n, culture) {
    return n == "" ? "black" :
	culture_colours[culture];
}

function getReligionColours(n, religion) {
    return n == "" ? "black" :
	religion_colours[religion];
}

function getCountryColours(n, country) {
    return n == "" ? "black" :
    country_colours[country];
}

function style_religions(feature) {
    return {
	fillColor: getReligionColours(feature.properties.name, religions[feature.id]),
        weight: 2,
        opacity: 1,
        color: '#3B3B3B',
        dashArray: '3',
        fillOpacity: 1.0
    };
}

function style_cultures(feature) {
    return {
	fillColor: getCultureColours(feature.properties.name, cultures[feature.id]),
        weight: 2,
        opacity: 1,
        color: '#3B3B3B',
        dashArray: '3',
        fillOpacity: 1.0
    };
}

function style_countries(feature) {
    return {
        fillColor: getCountryColours(feature.properties.name, countries[feature.id]),
        weight: 2,
        opacity: 1,
        color: '#000000',
        dashArray: '3',
        fillOpacity: 1.0
    };
}

function highlightFeature(e) {
    var prov = e.target;

    prov.setStyle({
        weight: 2,
        color: 'red',
        dashArray: '',
        fillOpacity: 1
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        prov.bringToFront();
    }
    info.update(prov.feature.properties, prov.feature.id, cultures[prov.feature.id], religions[prov.feature.id], countries[prov.feature.id]);
}

function resetHighlight(e) {

    var prov = e.target;
    
    if (current_mapmode == "cultures")
	prov.setStyle(style_cultures(prov.feature));
    else if(current_mapmode == "religions")
	prov.setStyle(style_religions(prov.feature));
    else
    prov.setStyle(style_countries(prov.feature));

    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, prov) {
    prov.on({
	mouseover: highlightFeature,
	mouseout: resetHighlight,
	click: zoomToFeature
    });
}
