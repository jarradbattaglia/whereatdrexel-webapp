$(document).ready(function(){

    window.markerLocations = L.layerGroup();
    var rootURL = "http://localhost:5000"
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

    // Tile Layer
    L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg', {
    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png"> &copy; <a href="httpL//osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    function Result(data){
        this.name = data.name;
        this.short_name = data.short_name;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.description = data.description;
    }

    var mapLocations = [];
    var cachedLocations;

    function updateMap(){
        markerLocations.clearLayers();
        $.each(mapLocations, function(i, location){
            L.marker([location.latitude, location.longitude]).addTo(markerLocations)
                .bindPopup("<h5><strong>" + location.name + "</strong></h5>" + location.description)
        });
    }

    window.focusOn = function(target){
        markerLocations.clearLayers();
        $.each(mapLocations, function(i, location){
            if(location.name == target.name) {
                L.marker([location.latitude, location.longitude]).addTo(markerLocations)
                .bindPopup("<h5><strong>" + location.name + "</strong></h5>" + location.description).openPopup();
                map.panTo([location.latitude, location.longitude]);
            }
            else {
                L.marker([location.latitude, location.longitude]).addTo(markerLocations)
                    .bindPopup("<h5><strong>" + location.name + "</strong></h5>" + location.description)
            }
        });
    }

    $.getJSON(rootURL + "/api/buildings", function(data) {
        cachedLocations = data.locations;
        mapLocations = cachedLocations;
    }).done(function() {
        updateMap();
    });

    // ViewModel for search
    var searchVM = {
            searchDrexel : function(formElement) {
            },
            
            searchTerm: ko.observable(),
            searchResults: ko.observableArray([]),
    };

    searchVM.searchTerm.subscribe(function(searchValue){

        if (searchValue == "") {
            searchVM.searchResults.removeAll();
            mapLocations = cachedLocations; 
            updateMap();
            return 0;
        };

        $.ajax({
            url: rootURL + "/api/search/" + searchValue,
            //dataType: 'json', 
            success: function(data){
                searchVM.searchResults.removeAll();
                 $.each(data.locations, function(i, location) {
                    searchVM.searchResults.push(new Result(location));
                });
                mapLocations = ko.toJS(searchVM.searchResults);
                updateMap();

            },
            error: function (xhr, textStatus, errorThrown) { console.log('error ' + (errorThrown ? errorThrown : xhr.status) + textStatus); }
        });
    });

    ko.applyBindings(searchVM); 
});
