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
        crs: L.CRS.Simple,
        maxZoom: 1
    }).setView([-1250, 700], 1);
    function getRegionById(array,  id) {
        return $.grep(array, function(e){ return e.id == id; })[0];
    }
    //map.dragging.disable();
    //map.scrollWheelZoom.disable();

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
                var temp_region = getRegionById(campaignInfo,  feature.id);
                if (!temp_region || !temp_region.owner) return {
                    fillColor: '#000000',
                    weight: 0,
                    opacity: 0,
                    color: '#000000',
                    dashArray: '5',
                    fillOpacity: 1
                };
                return {
                    fillColor: getCountryColours(feature.properties.name, temp_region.owner),
                    weight: 2,
                    opacity: 1,
                    color: '#000000',
                    dashArray: '5',
                    fillOpacity: 1
                };
            }

            showCountries();

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
                info.update(prov.feature.properties, prov.feature.id, getRegionById(campaignInfo,  prov.feature.id).owner);
            }

            function resetHighlight(e) {
                var prov = e.target;
                prov.setStyle(style_countries(prov.feature));
                info.update();
            }

            function zoomToFeature(e) {
                map.fitBounds(e.target.getBounds());
                $('.mapmode').show();
                mapmodes.update(e.target.feature.id, e.target.feature.properties.name, getRegionById(campaignInfo,  e.target.feature.id).owner)
            }

            function onEachFeature(feature, prov) {
                prov.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: zoomToFeature
                });
            }

            function updateMapInfo(region_id, region_name, region_owner) {
                console.log(getRegionById(campaignInfo,  region_id));
                $.ajax({
                    method: "POST", url: "/setCampaignInfo", data: {
                        'regionID': region_id,
                        'new_owner': region_owner
                    }
                }).done(function () {
                    campaignInfo[campaignInfo.indexOf(getRegionById(campaignInfo,  region_id))].owner = region_owner;
                    showCountries();
                });
                $.ajax({
                    method: "POST", url: "/editRegionsOne", data: {
                        'regionID': region_id,
                        'regionName': region_name
                    }
                }).done(function () {
                    getRegionById(campaignInfo,  region_id).name = region_name;
                    regions.features[regions.features.indexOf(getRegionById(regions.features,  region_id))].properties.name = region_name;
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
            mapmodes.update = function (region_id, region_name, region_owner) {
                this._div.innerHTML =
                    '<h2>Edit region</h2>' +
                    '<span style="width : 100%">region id : <span style="float:right">' + region_id + '</span></span>' +
                    '<br>' +
                    '<br>' +
                    '<span>region name : </span><input type="text" id="region_name_updater" value="' + region_name + '">' +
                    '<br>' +
                    '<br>' +
                    '<span>region owner : </span><input type="text" id="region_country_updater" value="' + region_owner + '">' +
                    '<br>' +
                    '<br>' +
                    '<button id="button-update">Update</button>' +
                    '<button id="button-reset">Reset</button>' +
                    '<br>';
                $("#button-update").click(function () {
                    console.log('start updating');
                    if ($('#region_name_updater').val() && $('#region_name_updater').val() != "" && $('#region_country_updater').val() && $('#region_country_updater').val()) {
                        updateMapInfo(region_id, $('#region_name_updater').val(), $('#region_country_updater').val());
                    }
                });
                $("#button-reset").click(function () {
                    resetMapInfo();
                });
            };
            mapmodes.setPosition('topleft');
            mapmodes.addTo(map);



            $('.mapmode').hide();

            map.on({
                zoomend: function() {
                    map.fitBounds(map.getBounds());
                    if(map.getZoom() == '1') {
                        console.log('zoomed');
                        //$('.mapmode').show();
                    }
                    else {
                        $('.mapmode').hide();
                        mapmodes.update('', '', '')
                    }
                },
                click: function() {
                    $('.mapmode').hide();
                }
            });


        });
    })
});



