//loading animation code
jQuery(document).ready(function($) {  
  // site preloader -- also uncomment the div in the header and the css style for #preloader
  $(window).load(function(){
    $('#preloader').fadeOut('slow',function(){
      $(this).remove();});
  });
});





var flowerApp = {};
flowerApp.mapMarkers = [];
flowerApp.mapBounds = new google.maps.LatLngBounds();



//GeoLocation starts Here!!

// user enters site, site calculates users location 

flowerApp.getLocation = function() {

	// Check to see if the browser supports the GeoLocation API.
	if ("geolocation" in navigator) {
		// Get the location
		navigator.geolocation.getCurrentPosition(function(position) {
      // console.log("position", position)
			var lat = position.coords.latitude;
			var lon = position.coords.longitude;
			flowerApp.location = {
				lat: lat,
				lon: lon
			};
			flowerApp.getPlace();
      // console.log("lat" + lat);
      // console.log("lon" + lon);
			// Show the map
			flowerApp.showMap(lat, lon);
		});
	} else {
		// Print out a message to the user.
		document.write("Looks like we couldn't track your Location, try searching an address (:");
	}
}
//OR the user can enter their location in search feild-------------------------->

    //let user search location-------------------------------------------------->


//Google Places then lets you know what flower shops are around users location
  //get flower shop info


flowerApp.getPlace = function() {
	$.ajax({
		url: 'https://proxy.hackeryou.com',
		method: 'GET',
		dataType: 'json',
		data: {
      reqUrl: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      params: {
  			key: 'AIzaSyD2-bjGOvhQE42Hx5gkwU4Ony1N_Y9x-N8',
  			location: flowerApp.location.lat+','+flowerApp.location.lon,
  			keyword: 'florist',
        radius: 1000
      }
		}
	})
  //get results
	.then(function(results) {
		// console.log(results);
    //get what I want from results
    var getThePlace = results.results;
    // console.log(getThePlace);
    flowerApp.displayPlaces(getThePlace);

	})
}

// Search field Options

flowerApp.getSearchResults = function(search) {
  console.log("flowerApp.mapMarkers", flowerApp.mapMarkers);
  $.ajax({
    url: 'https://proxy.hackeryou.com',
    method: 'GET',
    dataType: 'json',
    data: {
      reqUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
      params: {
        key: 'AIzaSyD2-bjGOvhQE42Hx5gkwU4Ony1N_Y9x-N8',
        address: search
        
      }
    }
  }).then(function(searchRes){

        // console.log("search results", searchRes)
        // flowerApp.getLocation(searchRes)

        var addressLat = searchRes.results[0].geometry.location.lat;
        var addressLon = searchRes.results[0].geometry.location.lng;
        flowerApp.location = {
            lat: addressLat,
            lon: addressLon
          };
          // flowerApp.mapMarkers[0].setMap(null);
          for (var i = 0; i < flowerApp.mapMarkers.length; i++){
          flowerApp.mapMarkers[i].setMap(null);
          }
          delete flowerApp.mapBounds;
          flowerApp.mapBounds = new google.maps.LatLngBounds();




          // Add a Marker to the Map
          var marker = new google.maps.Marker({
              position: new google.maps.LatLng(addressLat, addressLon),
              map: flowerApp.map,
              title: 'Found you!',
              icon: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
          });
          flowerApp.mapMarkers.push(marker);
          flowerApp.mapBounds.extend(marker.position);
          flowerApp.map.setCenter(marker.getPosition());


          // console.log(searchRes);
          // flowerApp.showMap(flowerApp.location.lat, flowerApp.location.lng);
          flowerApp.getPlace();

   })
}

flowerApp.getAddress = function() {
  $('form').on('submit', function(e){
    e.preventDefault();
    var searchValue = $('#pac-input').val() 
    var toronto = searchValue + " Toronto, Ontario";
    console.log("searchValue:" + searchValue);

    flowerApp.getSearchResults(toronto);

  });
}




//Display flower shop locations in map with Google Places

//images for flower cards
var flowerCardImages = new Array(
  "./images/flower_01.png",
  "./images/flower_02.png",
  "./images/flower_03.png",
  "./images/flower_04.png",
  "./images/flower_05.png",
  "./images/flower_06.png",
  "./images/flower_07.png"
  );


flowerApp.displayPlaces = function(flowerShops){


  //empty map so new flower shops will show up
  $('#flowerShop').empty();

  flowerShops = flowerShops.filter(function(flowerObject){
    //using filter, we can iterate through the art array
    //and for each object check to see if it has an info
    //the hasImage property has a value or true or false-------?
    //so we can return that to determine our filter
    return flowerObject.photos !== null;
  });
  // console.log("does this work?", flowerShops)
  flowerShops.forEach(function(flowerObject){
  var randomNum = Math.floor(Math.random() * flowerCardImages.length);
    console.log(flowerObject);
    //Using jQuery, create an article tag to act as a container
    //for our flower shops
    var $flowerContainer = $('<div>').addClass('card');
    //for the business info
    var $flowerInfoContainer = $('<div>').addClass('busInfo');
    //For flower image
    var $flowerImageContainer = $('<div>').addClass('imageContainer');
    //create a h3 to hold to business name
    var $businessName = $('<h3>').addClass('busName').text(flowerObject.name);
    //create h4 to hold bur=siness location
    var $businessLocation = $('<h4>').text(flowerObject.vicinity);
    //create p to hold the business rating
    var $businessRating = $('<p>').text(flowerObject.rating);
     //create p to hold the business hours
    var $businessHours = $('<p>').append(flowerObject.reference);
    var $flowerImage = $('<img>').attr({src: flowerCardImages[randomNum]});
    // Add business info to Florist Business Cards
        $flowerInfoContainer.append($businessName, $businessLocation, $businessRating);
        $flowerImageContainer.append($flowerImage);
        $flowerContainer.append($flowerImageContainer, $flowerInfoContainer);
        $('#flowerShop').append($flowerContainer);
//Map Business Marker!!!!
        
    //Define Business Latitude and Long to add to Map
    var businessLat = flowerObject.geometry.location.lat;
    var businessLon = flowerObject.geometry.location.lng;
    var businessName = flowerObject.name;

    //Define Business name for Map Info Card
    var infowindow = new google.maps.InfoWindow({
    content: flowerObject.name
  });
    //Create businessMarker for Florist Shops on map
    var businessMarker = new google.maps.Marker({
      position: {
        lat: businessLat,
        lng: businessLon
      },
      map: flowerApp.map,
      title: businessName,
      icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    });
    flowerApp.mapMarkers.push(businessMarker);
    flowerApp.mapBounds.extend(businessMarker.position);

  
    //add business info to Map Info Card 
    businessMarker.addListener('click', function() {
    infowindow.open(flowerApp.map, businessMarker);
    }); 
    flowerApp.map.fitBounds(flowerApp.mapBounds);  
  });
};
// End of Google Places

//Autocomplete search starts here


//end of autocomplete search





//NEEDS TO STAY AT BOTTOM!!!(Geolocation)
// Show the user's position on a Google map.
flowerApp.showMap = function(lat, lon) {
	// Create a LatLng object with the GPS coordinates.
	var myLatLng = new google.maps.LatLng(lat, lon);

	// Create the Map Options
  var mapOptions = {
    zoom: 15,
    center: myLatLng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: false,
    navigationControl: false,
    mapTypeControl: false,
    scaleControl: false
  };

  // Generate the Map
  flowerApp.map = new google.maps.Map(document.getElementById('map'), mapOptions);

  // Add a Marker to the Map
  var marker = new google.maps.Marker({
      position: myLatLng,
      map: flowerApp.map,
      title: 'Found you!',
      animation: google.maps.Animation.DROP,
      icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  });
  flowerApp.mapMarkers.push(marker);
  flowerApp.mapBounds.extend(marker.position);

}

//when the page loads start the app
  //geolocator
flowerApp.init = function() {
	flowerApp.getLocation();
  flowerApp.getAddress();
  // flowerApp.getSearch(); 
};

$(function() {
  flowerApp.init();
  console.log('hi');
})







