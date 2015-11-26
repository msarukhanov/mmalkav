/**
 * Created by mark on 11/17/2015.
 */

var app = angular.module("medievalMap", []);

    app.controller("chatCtrl", function($scope, $rootScope, $http) {

        $rootScope.isLog = false;
        $scope.login_error = false;

        $scope.login = function (login, password) {
            $http({
                url: "/chat/signin",
                method: "POST",
                data: {
                    login: login,
                    password: password
                }
            }).success(function (data) {
                if (data._id) {


                    $scope.login_error = false;

                    var FADE_TIME = 300;
                    var TYPING_TIMER_LENGTH = 400;
                    var COLORS = [
                        '#e21400', '#91580f', '#f8a700', '#f78b00',
                        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
                        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
                    ];

                    var $window = $(window);
                    var $usernameInput = $('.usernameInput');
                    var $messages = $('.messages');
                    var $inputMessage = $('.inputMessage');

                    var $loginPage = $('.login.page');
                    var $chatPage = $('.chat.page');

                    var username;
                    var connected = false;
                    var typing = false;
                    var lastTypingTime;
                    var $currentInput = $usernameInput.focus();

                    var socket = io();

                    function addParticipantsMessage (data) {
                        createUsersList(data.listUsers);
                    }

                    function createUsersList(users) {
                        $('.users-list').empty();
                        for(var i in users) {
                            $('.users-list').append( "<li class='users-item'>" + users[i] + "</li>" )
                        }

                    }

                    function setUsername () {
                        username = cleanInput($usernameInput.val().trim());

                        // If the username is valid
                        if (username) {
                            $loginPage.fadeOut();
                            $chatPage.show();
                            $loginPage.off('click');
                            $currentInput = $inputMessage.focus();

                            // Tell the server your username
                            socket.emit('add user', username);
                        }
                    }

                    function sendMessage () {
                        var message = $inputMessage.val();
                        message = cleanInput(message);
                        if (message && connected) {
                            $inputMessage.val('');
                            addChatMessage({
                                username: username,
                                message: message
                            });
                            socket.emit('new message', message);
                        }
                    }

                    function log (message, options) {
                        var $el = $('<li>').addClass('log').text(message);
                        addMessageElement($el, options);
                    }

                    function addChatMessage (data, options) {

                        var $typingMessages = getTypingMessages(data);
                        options = options || {};
                        if ($typingMessages.length !== 0) {
                            options.fade = false;
                            $typingMessages.remove();
                        }

                        var $usernameDiv = $('<span class="username"/>')
                            .text(data.username)
                            .css('color', getUsernameColor(data.username));
                        var $messageBodyDiv = $('<span class="messageBody">')
                            .text(data.message);

                        var typingClass = data.typing ? 'typing' : '';
                        var $messageDiv = $('<li class="message"/>')
                            .data('username', data.username)
                            .addClass(typingClass)
                            .append($usernameDiv, $messageBodyDiv);

                        addMessageElement($messageDiv, options);
                    }

                    function addChatTyping (data) {
                        data.typing = true;
                        data.message = 'is typing';
                        addChatMessage(data);
                    }

                    function removeChatTyping (data) {
                        getTypingMessages(data).fadeOut(function () {
                            $(this).remove();
                        });
                    }

                    function addMessageElement (el, options) {
                        var $el = $(el);

                        if (!options) {
                            options = {};
                        }
                        if (typeof options.fade === 'undefined') {
                            options.fade = true;
                        }
                        if (typeof options.prepend === 'undefined') {
                            options.prepend = false;
                        }

                        // Apply options
                        if (options.fade) {
                            $el.hide().fadeIn(FADE_TIME);
                        }
                        if (options.prepend) {
                            $messages.prepend($el);
                        } else {
                            $messages.append($el);
                        }
                        $messages[0].scrollTop = $messages[0].scrollHeight;
                    }

                    function cleanInput (input) {
                        return $('<div/>').text(input).text();
                    }

                    function updateTyping () {
                        if (connected) {
                            if (!typing) {
                                typing = true;
                                socket.emit('typing');
                            }
                            lastTypingTime = (new Date()).getTime();

                            setTimeout(function () {
                                var typingTimer = (new Date()).getTime();
                                var timeDiff = typingTimer - lastTypingTime;
                                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                                    socket.emit('stop typing');
                                    typing = false;
                                }
                            }, TYPING_TIMER_LENGTH);
                        }
                    }

                    function getTypingMessages (data) {
                        return $('.typing.message').filter(function (i) {
                            return $(this).data('username') === data.username;
                        });
                    }

                    function getUsernameColor (username) {
                        var hash = 7;
                        for (var i = 0; i < username.length; i++) {
                            hash = username.charCodeAt(i) + (hash << 5) - hash;
                        }
                        var index = Math.abs(hash % COLORS.length);
                        return COLORS[index];
                    }

                    $window.keydown(function (event) {
                        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
                            $currentInput.focus();
                        }
                        if (event.which === 13) {
                            if (username) {
                                sendMessage();
                                socket.emit('stop typing');
                                typing = false;
                            }
                            //else {
                            //    setUsername();
                            //}
                        }
                    });

                    $inputMessage.on('input', function() {
                        updateTyping();
                    });

                    $loginPage.click(function () {
                        $currentInput.focus();
                    });

                    $inputMessage.click(function () {
                        $inputMessage.focus();
                    });

                    socket.on('login', function (data) {
                        connected = true;
                        var message = "Welcome to Socket.IO Chat";
                        log(message);
                        addParticipantsMessage(data);
                    });

                    socket.on('new message', function (data) {
                        addChatMessage(data);
                    });

                    socket.on('user joined', function (data) {
                        log(data.username + ' joined');
                        addParticipantsMessage(data);
                    });

                    socket.on('user left', function (data) {
                        log(data.username + ' left');
                        addParticipantsMessage(data);
                        removeChatTyping(data);
                    });

                    socket.on('typing', function (data) {
                        addChatTyping(data);
                    });

                    socket.on('stop typing', function (data) {
                        removeChatTyping(data);
                    });

                    username = cleanInput($usernameInput.val().trim());
                    if (username) {
                        $loginPage.fadeOut();
                        $chatPage.show();
                        $loginPage.off('click');
                        $currentInput = $inputMessage.focus();
                        socket.emit('add user', username);
                    }

                    $rootScope.isLog = true;
                }
                else {
                    $scope.login_error = data;
                }
            });
        };
    });

    app.controller("mainCtrl", ['$scope', '$rootScope', '$http', 'mapService', 'controlsService',
        function ($scope, $rootScope, $http, mapService, controlsService) {

            $scope.loading = true;
            $rootScope.loadingText = "Loading regions";
            $http({
                url: "/getProvinces",
                method: "GET"
            }).success( function( data ) {

                var provinces = JSON.parse(data);

                $rootScope.loadingText = "Loading factions";

                $http({
                    url: "/getFactions",
                    method: "GET"
                }).success(function (data) {
                    $rootScope.factions = data;
                    $rootScope.loadingText = "Loading campaign info";

                    $http({
                        url: "/getCampaignInfo",
                        method: "GET"
                    }).success(function (data) {

                        $rootScope.campaignInfo = data;

                        $rootScope.loadingText = "Intitializing";

                        var southWest = L.latLng(-2252, -168), northEast = L.latLng(-249, 2932), bounds = L.latLngBounds(southWest, northEast);
                        $rootScope.map = L.map('map', {
                            crs: L.CRS.Simple,
                            maxZoom: 1,
                            maxBounds: bounds
                        }).setView([-1250, 700], 0);
                        L.mapbox.accessToken = 'pk.eyJ1IjoibW1hbGthdiIsImEiOiJjaWg0aTRyaWswMHN1a3FseXQ2MjRrbnl0In0.TnjjiSL_H80Z0thxcF-rtw';

                        $rootScope.updateMapInfo = function(region_id, region_name, region_owner) {
                            $http({
                                url: "/setCampaignInfo",
                                method: "POST",
                                data: {
                                    'regionID': region_id,
                                    'new_owner': region_owner
                                }
                            }).success(function () {
                                $rootScope.campaignInfo[$rootScope.campaignInfo.indexOf($rootScope.getRegionById(region_id))].owner = region_owner;
                                $rootScope.geojsonProvinces.setStyle($rootScope.style_countries);
                            });
                            $http({
                                url: "/editRegionsOne",
                                method: "POST",
                                data: {
                                    'regionID': region_id,
                                    'regionName': region_name
                                }
                            }).success(function () {
                                $rootScope.getRegionById(region_id).name = region_name;
                                regionsProvinces.features[regionsProvinces.features.indexOf($rootScope.getRegionById(regions.features,  region_id))].properties.name = region_name;
                            })
                        };

                        var regionsProvinces = {
                            "type": "FeatureCollection",
                            "features": provinces
                        };
                        $rootScope.geojsonProvinces = L.geoJson(regionsProvinces, {
                            style: $rootScope.campaignInfo,
                            onEachFeature: mapService.onEachFeature
                        }).addTo($rootScope.map);
                        $rootScope.geojsonProvinces.setStyle($rootScope.style_countries);

                        var regionsCountries = {
                            "type": "FeatureCollection",
                            "features": mapService.calculateCountries(regionsProvinces)
                        };
                        $rootScope.geojsonCountries = L.geoJson(regionsCountries, {
                            style: $rootScope.campaignInfo,
                            onEachFeature: mapService.onEachFeature
                        }).addTo($rootScope.map);
                        $rootScope.geojsonCountries.setStyle($rootScope.style_countries);

                        $rootScope.map.on({
                            zoomend: function() {
                                $rootScope.map.fitBounds($rootScope.map.getBounds());
                                if($rootScope.map.getZoom() == '1') {
                                    console.log('zoomed');
                                    //$('.mapmode').show();
                                }
                                else {
                                    $('.mapmode').hide();
                                    $rootScope.mapmodes.update('', '', '')
                                }
                            },
                            click: function(e) {
                                $('.mapmode').hide();
                            }
                        });

                        controlsService.setControls();
                        $scope.loading = false;
                        $rootScope.loadingText = "Complete";

                    });
                })
            });
        }
    ]);

    app.service("mapService", function($rootScope){

        function getCountryColours(n, country) {
            return n == "" ? "white" : $rootScope.factions[country].color;
        }
        function matrixLength(matrix) {
            var len = 0;
            for(var i in matrix) {
                for(var j in matrix[i]) {
                    len++;
                }
            }
            return len;
        }
        $rootScope.getRegionById = function(id) {
            return $.grep($rootScope.campaignInfo, function(e){ return e.id == id; })[0];
        };
        $rootScope.style_countries = function(feature) {
            var temp_region = $rootScope.getRegionById(feature.id);
            if (!temp_region || !temp_region.owner) {
                return {
                    fillColor: '#000000',
                    weight: 0,
                    opacity: 0,
                    color: '#000000',
                    dashArray: '5',
                    fillOpacity: 1
                }
            }
            else {
                return {
                    fillColor: getCountryColours(feature.properties.name, temp_region.owner),
                    weight: 2,
                    opacity: 1,
                    color: '#000000',
                    dashArray: '5',
                    fillOpacity: 1
                };
            }
        };

        return {
            onEachFeature : function(feature, prov) {
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
                    var temp_country = $rootScope.getRegionById(prov.feature.id) ? $rootScope.getRegionById(prov.feature.id).owner : '';
                    $rootScope.info.update(prov.feature.properties, prov.feature.id, temp_country);
                }

                function resetHighlight(e) {
                    var prov = e.target;
                    prov.setStyle($rootScope.style_countries(prov.feature));
                    $rootScope.info.update();
                }

                function zoomToFeature(e) {
                    $rootScope.map.fitBounds(e.target.getBounds());
                    $('.mapmode').show();
                    $rootScope.mapmodes.update(e.target.feature.id, e.target.feature.properties.name, $rootScope.getRegionById(e.target.feature.id).owner)
                }
                prov.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight,
                    click: zoomToFeature
                });
            },
            calculateCountries : function (regions) {
                $rootScope.loadingText = "Calculating countries";
                var countryJSON = [];
                var countryList = [];
                for(var i in regions.features) {
                    var feature = regions.features[i];
                    var temp_region = $rootScope.getRegionById(feature.id);
                    if (!temp_region || !temp_region.owner) {
                        if(!countryList['undefined']) countryList['undefined'] = [];
                        countryList['undefined'].push(feature);
                    }
                    else {
                        if(!countryList[temp_region.owner]) countryList[temp_region.owner]=[];
                        countryList[temp_region.owner].push(feature);
                    }
                }
                for(var i in countryList) {
                    if(i != 'undefined') {
                        countryList[i].unitedGeo = [];
                        for(var j=0; j<countryList[i].length;j++) {
                            if(countryList[i][j].geometry) {
                                if(countryList[i][j].geometry.coordinates[0][countryList[i][j].geometry.coordinates[0].length-1]!=countryList[i][j].geometry.coordinates[0][0])
                                    countryList[i][j].geometry.coordinates[0].push(countryList[i][j].geometry.coordinates[0][0]);
                                if(matrixLength(countryList[i][j].geometry.coordinates)>3)
                                    countryList[i].unitedGeo.push(turf.polygon(countryList[i][j].geometry.coordinates));
                            }
                        }

                        var poly_fc = turf.featurecollection(countryList[i].unitedGeo);
                        if(turf.merge(poly_fc)) {
                            var poly_m = turf.merge(poly_fc);
                            poly_m.id = i;
                            poly_m.properties.name = i;
                            countryJSON.push(poly_m);
                        }
                    }
                    else {
                        countryJSON = countryJSON.concat(countryList['undefined']);
                    }
                }
                return countryJSON;
            }
        }
    });

    app.service("controlsService", function($rootScope){

        return {
            setControls : function() {
                $rootScope.info = L.control();
                $rootScope.info.onAdd = function () {
                    this._div = L.DomUtil.create('div', 'info');
                    this.update();
                    return this._div;
                };
                $rootScope.info.update = function (props, id, country) {
                    this._div.innerHTML =
                        '<h4>Region information</h4>' +
                        (props ? props.name : "") +
                        '<br>' + (id ? id : "") +
                        '<br>' + (country ? country : "");
                    //'<br>' + (religion ? religion:"");
                };
                $rootScope.info.addTo($rootScope.map);

                //$rootScope.featureGroup = L.featureGroup().addTo($rootScope.map);
                //$rootScope.drawControl = new L.Control.Draw({
                //    edit: {
                //        featureGroup: $rootScope.featureGroup
                //    }
                //}).addTo($rootScope.map);
                //$rootScope.map.on('draw:created', function(e) {
                //    featureGroup.addLayer(e.layer);
                //});

                $rootScope.mapmodes = L.control();
                $rootScope.mapmodes.onAdd = function () {
                    this._div = L.DomUtil.create('div', 'mapmode');
                    this.update();
                    return this._div;
                };
                $rootScope.mapmodes.update = function (region_id, region_name, region_owner) {
                    this._div.innerHTML =
                        '<h2 class="region_edit_title">Edit region</h2>' +
                        '<span class="region_edit_wrapper region_edit_id">region id : <span>' + region_id + '</span></span>' +
                        '<span class="region_edit_wrapper region_edit_name">region name : <input type="text" id="region_name_updater" value="' + region_name + '"></span>' +
                        '<span class="region_edit_wrapper region_edit_owner">region owner : <input type="text" id="region_country_updater" value="' + region_owner + '"></span>' +
                        '<button id="button-update">Update</button>' +
                        '<button id="button-reset">Reset</button>' +
                        '<br>';
                    $("#button-update").click(function () {
                        if ($('#region_name_updater').val() && $('#region_name_updater').val() != "" && $('#region_country_updater').val() && $('#region_country_updater').val()) {
                            $rootScope.updateMapInfo(region_id, $('#region_name_updater').val(), $('#region_country_updater').val());
                        }
                    });
                    $("#button-reset").click(function () {
                        resetMapInfo();
                    });
                };
                $rootScope.mapmodes.setPosition('bottomleft');
                $rootScope.mapmodes.addTo($rootScope.map);
                $('.mapmode').hide();

                var mapCollection = {
                    'Provinces': $rootScope.geojsonProvinces,
                    'Countries': $rootScope.geojsonCountries
                };

                var layersControl = L.control.layers.minimap(mapCollection, {

                }, {
                    collapsed: false
                }).addTo($rootScope.map);
            }
        }
    });
