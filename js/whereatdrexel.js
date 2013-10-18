$(document).ready(function(){


    var rootURL = 'http://whereatdrexel.com';
    // Where markers are stored
    window.markerLocations = L.layerGroup();
    var map = L.map('map',{
        layers: [markerLocations]
    });

    // Bounds for map
    var southWest = new L.LatLng(39.948927, -75.215149),
        northEast = new L.LatLng(39.966427, -75.171547),
        bounds = new L.LatLngBounds(southWest, northEast);
    map.fitBounds(bounds);
    map.setMaxBounds(bounds);
    map.panTo([39.957433, -75.189292]);

    // Markers for map
    var markerBuilding = L.AwesomeMarkers.icon({
        icon: 'building', 
        color: 'darkblue'
    });
    var selectedBuilding = L.AwesomeMarkers.icon({
        icon: 'building', 
        color: 'blue'
    });
    var markerCourse = L.AwesomeMarkers.icon({
        icon: 'pencil', 
        color: 'darkblue'
    });
    var selectedCourse = L.AwesomeMarkers.icon({
        icon: 'pencil', 
        color: 'blue'
    });


    // Tile Layer
    L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg', {
    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png"> &copy; <a href="httpL//osm.org/copyright">OpenStreetMap</a> contributors',
    detectRetina: true
    }).addTo(map);

    // Results data structure
    function Result(data){
        this.name = data.name;
        this.short_name = data.short_name;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.description = data.description;
        this.id = data.id;
        this.type = data.type;
        this.exact_match = data.exact_match;
    }

    // To store the default locations at Drexel
    var mapLocations = [];
    var cachedLocations;

    function updateMap(){
        markerLocations.clearLayers();
        $.each(mapLocations, function(i, location){
            var marker = markerBuilding;
            if (location.type == 'course'){
                marker = markerCourse;
            }
            L.marker([location.latitude, location.longitude], {icon: marker}).addTo(markerLocations)
                .bindPopup('<h5><strong>' + location.name + '</strong> <em>(' + location.short_name + ')</em></h5>' + location.description);
        });
    }

    // Focus on a specific marker
    window.focusOn = function(target){
        markerLocations.clearLayers();
        $.each(mapLocations, function(i, location){
            var marker = markerBuilding;
            if (location.type == 'course'){
                marker = markerCourse;
            }

            if(location.id == target.id) {
                if (location.type == 'course'){
                    marker = selectedCourse;
                } else {
                    marker = selectedBuilding;
                }

                if(target.latitude === 0.00){
                    $('div#location-info').html(target.description);
                    $('#info-modal').foundation('reveal', 'open');
                }

                L.marker([location.latitude, location.longitude], {icon: marker}).addTo(markerLocations)
                .bindPopup('<h5><strong>' + location.name + '</strong> <em>(' + location.short_name + ')</em></h5>' + location.description).openPopup();
                if(target.latitude !== 0.00)
                    map.panTo([location.latitude, location.longitude]);
            }
            else {
                L.marker([location.latitude, location.longitude], {icon: marker}).addTo(markerLocations)
                    .bindPopup('<h5><strong>' + location.name + '</strong> <em>(' + location.short_name + ')</em></h5>' + location.description);
            }
        });
    }

    // Grab default buildings list
    $.getJSON(rootURL + '/api/buildings', function(data) {
        cachedLocations = data.locations;
    }).done(function() {
        searchFor('');
    }).error(function() {
        window.location.replace("error.html");
    });

    window.searchFor = function(searchValue) {
        if (searchValue === '') {
            searchVM.searchResults.removeAll();
            mapLocations = cachedLocations; 
            updateMap();
        }

        $.ajax({
            url: rootURL + '/api/search/' + searchValue,
            success: function(data){
                searchVM.searchResults.removeAll();
                 $.each(data.locations, function(i, location) {
                    searchVM.searchResults.push(new Result(location));
                });
                mapLocations = ko.toJS(searchVM.searchResults);
                updateMap();

            },
            error: function (xhr, textStatus, errorThrown) { 
                window.location.replace("error.html");
            }
        });

    };
    // ViewModel for search
    var searchVM = {
            searchDrexel : function(formElement) {
                searchFor(searchVM.searchTerm());
            },
            
            searchTerm: ko.observable().extend({ throttle: 500 }),
            searchResults: ko.observableArray([]),
    };

    searchVM.searchTerm.subscribe(function(searchValue){
        searchFor(searchValue);
    });

    ko.applyBindings(searchVM); 
});
