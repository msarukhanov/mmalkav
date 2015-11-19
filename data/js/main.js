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
            maxZoom: 8,
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
                    click: function(e) {
                        $('.mapmode').hide();
                        console.log(e);
                    }
                });

            });
        })
    });
});

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

                $rootScope.users_online = [];

                $scope.login_error = false;

                //socket.on('login', function (data) {
                //    var message = "Welcome to Socket.IO Chat – ";
                //    log(message, {
                //        prepend: true
                //    });
                //    addParticipantsMessage(data);
                //});
                //
                //var user_name = data.login;
                //var socket = io();
                //var name = data.login;
                //var messages = $("#messages");
                //var message_txt = $("#message_text");
                //$('.chat .nick').text(name);
                //
                //function msg(nick, message) {
                //    var m = '<div class="msg">' +
                //        '<span class="user">' + safe(nick) + ':</span> '
                //        + safe(message) +
                //        '</div>';
                //    messages
                //        .append(m)
                //        .scrollTop(messages[0].scrollHeight);
                //}
                //
                //function msg_system(message) {
                //    var m = '<div class="msg system">' + safe(message) + '</div>';
                //    messages
                //        .append(m)
                //        .scrollTop(messages[0].scrollHeight);
                //}
                //
                //socket.on('connecting', function () {
                //    msg_system('Connecting...');
                //});
                //
                //socket.on('connect', function (data) {
                //    socket.emit('add user', user_name);
                //    msg_system('Successfully connected to map chat!');
                //    socket.emit("message", {message: name + ' connected!', name: 'Admin'});
                //});
                //
                //socket.on('message', function (data) {
                //    msg(data.name, data.message);
                //    message_txt.focus();
                //});
                //
                //$("#message_btn").click(function () {
                //    var text = $("#message_text").val();
                //    if (text.length <= 0)
                //        return;
                //    message_txt.val("");
                //    socket.emit("message", {message: text, name: name});
                //});
                //
                //function safe(str) {
                //    return str.replace(/&/g, '&amp;')
                //        .replace(/</g, '&lt;')
                //        .replace(/>/g, '&gt;');
                //}
                var FADE_TIME = 150; // ms
                var TYPING_TIMER_LENGTH = 400; // ms
                var COLORS = [
                    '#e21400', '#91580f', '#f8a700', '#f78b00',
                    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
                    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
                ];

                // Initialize varibles
                var $window = $(window);
                var $usernameInput = $('.usernameInput'); // Input for username
                var $messages = $('.messages'); // Messages area
                var $inputMessage = $('.inputMessage'); // Input message input box

                var $loginPage = $('.login.page'); // The login page
                var $chatPage = $('.chat.page'); // The chatroom page

                // Prompt for setting a username
                var username;
                var connected = false;
                var typing = false;
                var lastTypingTime;
                var $currentInput = $usernameInput.focus();

                var socket = io();

                function addParticipantsMessage (data) {
                    var message = '';
                    if (data.numUsers === 1) {
                        message += "there's 1 participant";
                    } else {
                        message += "there are " + data.numUsers + " participants";
                    }
                    console.log($rootScope.users_online);
                    $rootScope.users_online = $.map(data.listUsers, function(el) { return el });
                    log(message);
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
                    // Prevent markup from being injected into the message
                    message = cleanInput(message);
                    // if there is a non-empty message and a socket connection
                    if (message && connected) {
                        $inputMessage.val('');
                        addChatMessage({
                            username: username,
                            message: message
                        });
                        // tell server to execute 'new message' and send along one parameter
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
                    // Auto-focus the current input when a key is typed
                    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
                        $currentInput.focus();
                    }
                    // When the client hits ENTER on their keyboard
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
                    var message = "Welcome to Socket.IO Chat – ";
                    log(message, {
                        prepend: true
                    });
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
                console.log(data);
                $scope.login_error = data;
            }
        });
    };
});