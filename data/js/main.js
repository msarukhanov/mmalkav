/**
 * Created by mark on 11/17/2015.
 */

var app = angular.module("medievalMap", []);

app.controller("mainCtrl", function($scope, $rootScope, $http) {
    $http({
        url: "/getRegionsAll",
        method: "GET"
    }).success( function( data ) {

        var regions = {
            "type": "FeatureCollection",
            "features": data
        };

        var southWest = L.latLng(-1752, 68),
            northEast = L.latLng(-249, 1932),
            bounds = L.latLngBounds(southWest, northEast);

        var map = L.map('map', {
            crs: L.CRS.Simple,
            maxZoom: 1,
            maxBounds: bounds
        }).setView([-1250, 700], 0);
        L.mapbox.accessToken = 'pk.eyJ1IjoibW1hbGthdiIsImEiOiJjaWg0aTRyaWswMHN1a3FseXQ2MjRrbnl0In0.TnjjiSL_H80Z0thxcF-rtw';

        function getRegionById(array,  id) {
            return $.grep(array, function(e){ return e.id == id; })[0];
        }

        $http({
            url: "/getFactions",
            method: "GET"
        }).success(function (data) {
            var factions = data;
            $http({
                url: "/getCampaignInfo",
                method: "GET"
            }).success(function (data) {

                var campaignInfo = data;

                var geojson = L.geoJson(regions, {
                    style: campaignInfo,
                    onEachFeature: onEachFeature
                }).addTo(map);

                //map.whenReady(function() {
                //    new L.Control.MiniMap(regions).addTo(map);
                //});

                function showCountries() {
                    geojson.setStyle(style_countries);
                    current_mapmode = "countries"
                }

                function getCountryColours(n, country) {
                    return n == "" ? "white" : factions[country].color;
                }

                function style_countries(feature) {
                    var temp_region = getRegionById(campaignInfo,  feature.id);
                    if(feature.id == '2003') console.log(feature);
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
                    var temp_country = getRegionById(campaignInfo,  prov.feature.id) ? getRegionById(campaignInfo,  prov.feature.id).owner : '';
                    info.update(prov.feature.properties, prov.feature.id, temp_country);
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
                    $http({
                        url: "/setCampaignInfo",
                        method: "POST",
                        data: {
                            'regionID': region_id,
                            'new_owner': region_owner
                        }
                    }).success(function () {
                        campaignInfo[campaignInfo.indexOf(getRegionById(campaignInfo,  region_id))].owner = region_owner;
                        showCountries();
                    });
                    $http({
                        url: "/editRegionsOne",
                        method: "POST",
                        data: {
                            'regionID': region_id,
                            'regionName': region_name
                        }
                    }).success(function () {
                        getRegionById(campaignInfo,  region_id).name = region_name;
                        regions.features[regions.features.indexOf(getRegionById(regions.features,  region_id))].properties.name = region_name;
                    })
                }

                function resetMapInfo(region_id, region_owner) {
                    $http({
                        url: "/resetCampaignInfo",
                        method: "POST"
                    }).success(function (data) {
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

                var featureGroup = L.featureGroup().addTo(map);
                var drawControl = new L.Control.Draw({
                    edit: {
                        featureGroup: featureGroup
                    }
                }).addTo(map);
                map.on('draw:created', function(e) {
                    console.log(e);
                    featureGroup.addLayer(e.layer);
                });

                var mapmodes = L.control();
                mapmodes.onAdd = function (map) {
                    this._div = L.DomUtil.create('div', 'mapmode');
                    this.update();
                    return this._div;
                };
                mapmodes.update = function (region_id, region_name, region_owner) {
                    this._div.innerHTML =
                        '<h2 class="region_edit_title">Edit region</h2>' +
                        '<span class="region_edit_wrapper region_edit_id">region id : <span style="float:right">' + region_id + '</span></span>' +
                        '<br>' +
                        '<br>' +
                        '<span class="region_edit_wrapper region_edit_name">region name : </span><input type="text" id="region_name_updater" value="' + region_name + '">' +
                        '<br>' +
                        '<br>' +
                        '<span class="region_edit_wrapper region_edit_owner">region owner : </span><input type="text" id="region_country_updater" value="' + region_owner + '">' +
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


                $scope.isLog = false;
                $scope.login_error = false;
                $scope.login = function(login, password) {
                    $http({
                        url: "/chat/signin",
                        method: "POST",
                        data: {
                            login : login,
                            password : password
                        }
                    }).success(function (data) {
                        if(data._id) {
                            $scope.login_error = false;
                            var socket = io();
                            var name = data.login;
                            var messages = $("#messages");
                            var message_txt = $("#message_text");
                            $('.chat .nick').text(name);

                            function msg(nick, message) {
                                var m = '<div class="msg">' +
                                    '<span class="user">' + safe(nick) + ':</span> '
                                    + safe(message) +
                                    '</div>';
                                messages
                                    .append(m)
                                    .scrollTop(messages[0].scrollHeight);
                            }

                            function msg_system(message) {
                                var m = '<div class="msg system">' + safe(message) + '</div>';
                                messages
                                    .append(m)
                                    .scrollTop(messages[0].scrollHeight);
                            }

                            socket.on('connecting', function () {
                                msg_system('Connecting...');
                            });

                            socket.on('connect', function (data) {
                                msg_system('Successfully connected to map chat!');
                                socket.emit("message", {message: name + ' connected!', name: 'Admin'});
                            });

                            socket.on('message', function (data) {
                                msg(data.name, data.message);
                                message_txt.focus();
                            });

                            $("#message_btn").click(function () {
                                var text = $("#message_text").val();
                                if (text.length <= 0)
                                    return;
                                message_txt.val("");
                                socket.emit("message", {message: text, name: name});
                            });

                            function safe(str) {
                                return str.replace(/&/g, '&amp;')
                                    .replace(/</g, '&lt;')
                                    .replace(/>/g, '&gt;');
                            }

                            $scope.isLog = true;
                        }
                        else {
                            console.log(data);
                            $scope.login_error = data;
                        }
                    });
                };

                $(document).ready(function () {




                });

            });
        })
    });
});