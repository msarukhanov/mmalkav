    // $.ajax({ method: "POST", url: "/getRegionsOne", data: {
    //     'regionID': '2'
    // }}).done(function (data) {
    //     console.log(data);
    // });

$.ajax({method: "GET", url: "/getRegionsAll"}).done( function( data ) {
    var regions = {    
        "type": "FeatureCollection",
        "features": data
    };

    var map = L.map('map', {
        crs: L.CRS.Simple
    }).setView([-1250, 700], 1);

    map.dragging.disable();
    map.scrollWheelZoom.disable();

    map.on({
        zoomend: function() {
            map.fitBounds(map.getBounds());
        }
    });

    $.ajax({method: "GET", url: "/getFactions"}).done(function (data) {
        var factions = data;
        $.ajax({method: "GET", url: "/getCampaignInfo"}).done(function (data) {

            var campaignInfo = data;
            var geojson = L.geoJson(regions, {
                style: campaignInfo,
                onEachFeature: onEachFeature
            }).addTo(map);

            function showCountries() {
                geojson.setStyle(style_countries);
                current_mapmode = "countries"
            }

            function getCountryColours(n, country) {
                return n == "" ? "white" : factions[country].color;
            }

            function style_countries(feature) {
                if (!campaignInfo[feature.id]) return {
                    fillColor: '#000000',
                    weight: 0,
                    opacity: 0,
                    color: '#000000',
                    dashArray: '5',
                    fillOpacity: 1
                };
                return {
                    fillColor: getCountryColours(feature.properties.name, campaignInfo[feature.id]),
                    weight: 2,
                    opacity: 1,
                    color: '#000000',
                    dashArray: '5',
                    fillOpacity: 1
                };
            }

            showCountries();

            //map.setIcon('/files/img/city.svg');
            //L.marker([-800, 800]).addTo(map);

            var fortressIcon = L.icon({
                iconUrl: '/img/city.svg',
                iconSize: [40, 40],
                iconAnchor: [22, 94],
                popupAnchor: [-3, -76]
            });


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
                info.update(prov.feature.properties, prov.feature.id, campaignInfo[prov.feature.id]);
            }

            function resetHighlight(e) {
                var prov = e.target;
                prov.setStyle(style_countries(prov.feature));
                info.update();
            }

            function zoomToFeature(e) {
                console.log(e);
                map.fitBounds(e.target.getBounds());
                L.marker([-800, 800], {icon: fortressIcon}).addTo(map);
                console.log(map.getBounds());
            }

            function onEachFeature(feature, prov) {
                prov.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: zoomToFeature
                });
            }

            function updateMapInfo(region_id, region_owner) {
                $.ajax({
                    method: "POST", url: "/setCampaignInfo", data: {
                        'id': region_id, 
                        'country': region_owner
                    }
                }).done(function (data) {
                    campaignInfo[region_id] = region_owner;
                    showCountries();
                })
            }

            function resetMapInfo(region_id, region_owner) {
                $.ajax({method: "POST", url: "/resetCampaignInfo"}).done(function (data) {
                    campaignInfo = data;
                    showCountries();
                })
            }

            var info = L.control();
            info.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info');
                this.update();
                return this._div;
            };
            info.update = function (props, id, country) {
                this._div.innerHTML =
                    '<h4>Region information</h4>' +
                    (country && props ? props.name : "") +
                    '<br>' + (country && id ? id : "") +
                    '<br>' + (country ? country : "");
                //'<br>' + (religion ? religion:"");
            };
            info.addTo(map);

            var mapmodes = L.control();
            mapmodes.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'mapmode');
                this.update();
                return this._div;
            };
            mapmodes.update = function () {
                this._div.innerHTML =
                    '<h1>Map editor</h1>' +
                    '<span>region id : </span><input type="text" id="region_id_updater">' +
                    '<br>' +
                    '<br>' +
                    '<span>to country : </span><input type="text" id="region_country_updater">' +
                    '<br>' +
                    '<br>' +
                    '<button id="button-update">Update</button>' +
                    '<button id="button-reset">Reset</button>'
            };
            mapmodes.setPosition('bottomleft');
            mapmodes.addTo(map);

            $("#button-update").click(function () {
                if ($('#region_id_updater').val() && $('#region_id_updater').val() != "" && $('#region_country_updater').val() && $('#region_country_updater').val()) {
                    updateMapInfo($('#region_id_updater').val(), $('#region_country_updater').val());
                }
            });
            $("#button-reset").click(function () {
                resetMapInfo();
            });
        });
    })
});



