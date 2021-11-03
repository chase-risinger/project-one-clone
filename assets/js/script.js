
//Variables
//Diane - Changed start/end Date names, Added eventType
var startLocation = "SanAntonio,TX";
var endLocation = "houston,tx";
// var bingKey = "ArTyrXsq6UDCs9vBFWRd04jO4H8q8Zbf4lhLg8yC8ECyRdGwOn2GVd50DKlIaRWD";
var tmKey = "19BJY9J622QFAQDhJQIFYeYXQPjGUQHU";
var austinLatLong = "30.2672,-97.7431";
var eventCardsEl = document.querySelector("#event-cards")
var wishListEl = document.querySelector("#wish-list")
var directionsEl = document.querySelector("#directions-section");
var eventType = "Music";

//mobile menu
var burger = document.querySelector("#burger");
var navBar = document.querySelector("#nav-links");

burger.addEventListener('click', () => {
    navBar.classList.toggle('is-active');
});

//modal
var newsBtn = document.querySelector("#newsBtn");
var modalBackground = document.querySelector(".modal-background");
var modal = document.querySelector(".modal");
var exitModal = document.querySelector("#exit-btn")
var submitBtnEl = document.querySelector("#submit-btn")

submitBtnEl.addEventListener("click", (event) => {
    event.preventDefault();
})


newsBtn.addEventListener("click", (event) => {
    event.preventDefault();
    modal.classList.add("is-active");
});

exitModal.addEventListener("click", (event) => {
    event.preventDefault();
    modal.classList.remove("is-active");
});



//Form Input/Button
//Diane - Need to make sure these ID's match HTML
var submitButton = document.querySelector("#submitBtn");
var streetAddressInput = document.querySelector("#streetAddress");
var cityInput = document.querySelector("#city");
var stateInput = document.querySelector("#state");
var radiusInput = document.querySelector("#mileage");
//var unitInput = document.querySelector("#unit"); // DONT SEE THIS ON THE FORM
var startDateInput = document.querySelector("#start");
var endDateInput = document.querySelector("#end");
//var eventTypeInput = document.querySelector("#event-type"); //DONT SEE THIS ON THE FORM

//Form Event Listener - Saves user input
submitButton.addEventListener("click", function (event) {
    event.preventDefault();

    //Saves user input into locat & global variables
    var streetAddress = streetAddressInput.value;
    var city = cityInput.value;
    var state = stateInput.value;
    var radius = radiusInput.value;
    //var unitOfMesurment = unitInput.value; //Dont need? we are in the USA
    //eventType = eventTypeInput.value; //DONT SEE MATCHING ITEM ON FORM

    //Forms Start locations based on user input
    startLocation = streetAddress + ", " + city + ", " + state;
    console.log("start location " + startLocation);

    //Converts Starting Location to API Readable format
    var startURL = startLocation.replace(/ /g, '%20');

    //Converts Address to latitude & longitude

    var positionStackKey = "5a8b007419bd2956c0662898bcf2606b"
    var positionStackURL = "https://cors-anywhere.herokuapp.com/http://api.positionstack.com/v1/forward?access_key=" + positionStackKey + "&query=" + startURL;

    fetch(positionStackURL)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    latLong = data['data'][0]['latitude'] + "," + data['data'][0]['longitude'];

                    findEvents(latLong, tmKey, radius);
                })

            } else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function (error) {
            alert("Unable to connect to latlong API");
        });

    //Calls findEvents

});

var loadFavs = function () {
    try {
        favsArray = JSON.parse(localStorage.getItem("favs"));
        if (!favsArray) { favsArray = [] }
        favsCounter = 0;
    }

    // if nothing in localStorage, create a new object to track all favorites
    catch {
        favsArray = [];
        favsCounter = 0;
    }
    if (favsArray.length > 0) {
        favsCounter = favsArray.length
        for (i = 0; i < favsArray.length; i++) {
            //console.log(favsArray)
            var wishListUlEl = document.createElement("ul");
            wishListUlEl.setAttribute('id', favsArray[i]['favid'])
            wishListUlEl.setAttribute('data-url', favsArray[i]['url'])
            wishListUlEl.classList.add('favorite-item')
            wishListUlEl.innerHTML = ("<li>" + favsArray[i]['artist'] + "</li><li>" + favsArray[i]['date']
                + "</li><li>" + favsArray[i]['url'] + "</li><li><button class='delete-btn'>delete</button><br><br>")
            wishListEl.appendChild(wishListUlEl)
        }

    }



};

var saveFavToLocal = function (artist, date, url) {

    var favObj = {
        "artist": artist,
        "date": date,
        "url": url,
        "favid": favsCounter
    };
    var elements = document.querySelectorAll(".favorite-item")
    console.log(elements)
    if (elements.length > 0) {
        console.log(elements)
        var isAlreadyFav = false
        for (i = 0; i < elements.length; i++) {
            if (elements[i]['dataset']['url'] == favObj["url"]) {
                window.alert("Already added to wish-list!")
                var isAlreadyFav = true
            }

            //console.log(favObj)

        }
        if (!isAlreadyFav) {
            addFav(favObj)
        }
    }
    else {
        addFav(favObj)
    }
}

var addFav = function (favObj) {
    favsArray.push(favObj);
    favsArray = JSON.stringify(favsArray);
    localStorage.setItem("favs", favsArray);
    favsArray = JSON.parse(favsArray);
    favsCounter++
    var wishListUlEl = document.createElement("ul");
    wishListUlEl.setAttribute('id', favObj['favid'])
    wishListUlEl.classList.add('favorite-item')
    wishListUlEl.innerHTML = ("<li>" + favObj['artist'] + "</li><li>" + favObj['date']
        + "</li><li>" + favObj['url'] + "</li><li><button class='delete-btn'>delete</button><br><br>")
    wishListEl.appendChild(wishListUlEl)
}


eventCardsEl.addEventListener("click", favoriteListener);
function favoriteListener(event) {
    var element = event.target;
    if (element.classList.contains("favorite")) {
        var eventCardPar = element.parentElement;
        var eventCardChildren = eventCardPar.children;
        var favArtist = eventCardChildren[0]['innerText'];
        var favUrl = eventCardChildren[3]['innerHTML'];
        var favDate = eventCardChildren[2]['innerText'];
        saveFavToLocal(favArtist, favDate, favUrl)
        //console.log(eventCardChildren);
        //console.log("favorite button clicked");
        element.parentElement.remove();
    }
}

wishListEl.addEventListener("click", deleteListener);
function deleteListener(event) {
    var deleteButtonClick = event.target;
    if (deleteButtonClick.classList.contains("delete-btn")) {
        favToDelete = deleteButtonClick.parentElement.parentElement;
        favToDeleteId = favToDelete.getAttribute('id')
        favToDelete.remove()
        for (i = 0; i < favsArray.length; i++) {
            if (favsArray[i]['favid'] == favToDeleteId) {
                favsArray = favsArray.filter(function (item) {
                    return item !== favsArray[i]
                });
                favsArray = JSON.stringify(favsArray);
                localStorage.setItem("favs", favsArray);
                favsArray = JSON.parse(favsArray)
            }
        }


    }
}

eventCardsEl.addEventListener("click", directionsListener);
function directionsListener(event) {
    var element = event.target;
    if (element.classList.contains("directions")) {
        console.log("directions button clicked");
    }
}

/* var getDirections = function (startLocation, endLocation, bingKey) {
    // format the bing api url
    var directionArray = [];
    var bingUrl = "http://dev.virtualearth.net/REST/v1/Routes?wayPoint.1=" + startLocation + "&waypoint.2=" + endLocation +
        "&key=" + bingKey;


    // make a get request to url
    fetch(bingUrl)
        .then(function (response) {
            // request was successful
            if (response.ok) {
                response.json().then(function (data) {
                    var directionsList = (data['resourceSets'][0]['resources'][0]['routeLegs'][0]['itineraryItems'])

                    for (i = 0; i < directionsList.length; i++) {
                        directionArray.push(directionsList[i]['instruction']['text'])

                    }

                    for (var i = 0; i < directionArray.length; i++) {
                        var listItemEl = document.createElement("li");
                        listItemEl.textContent = directionArray[i];
                        directionsEl.appendChild(listItemEl);

                    }
                })

            } else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function (error) {
            alert("Unable to connect to Bing");
        });
}; */



var findEvents = function (latLong, tmKey, radius) {

    var tmUrl = "https://app.ticketmaster.com/discovery/v2/events.json?sort=date,asc&size=20&classificationName=music&latlong=" + latLong +
        "&radius=" + radius + "&apikey=" + tmKey;



    fetch(tmUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    eventInfo = data['_embedded']['events'];


                    idCounter = 0
                    for (var i = 0; i < eventInfo.length; i++) {
                        idCounter++


                        var eventObj = {
                            'event-id': 'event-card-' + idCounter,
                            'artist-name': eventInfo[i]['name'],
                            'venue-name': eventInfo[i]['_embedded']['venues'][0]['name'],
                            'date': eventInfo[i]['dates']['start']['localDate'],
                            'url': eventInfo[i]['url'],
                            'address': eventInfo[i]['_embedded']['venues'][0]['address']['line1'] + ' ' +
                                eventInfo[i]['_embedded']['venues'][0]['city']['name'] + ' ' +
                                eventInfo[i]['_embedded']['venues'][0]['state']['stateCode'],
                            'img-url': eventInfo[i]['images'][0]['url']

                        }

                        console.log(eventObj["img-url"])
                        //creates cards for each event
                        var sectionEl = document.createElement('section');
                        sectionEl.className = "section";

                        var divEl = document.createElement('div');
                        divEl.className = "entertainment-cards"
                        var anchorEl = document.createElement('a');
                        anchorEl.className = "href";

                        var headerEl = document.createElement('h1');

                        var imageEl = document.createElement('img');
                        imageEl.src = eventObj["img-url"];
                        imageEl.style.width = "300px";



                        sectionEl.appendChild(headerEl);
                        sectionEl.appendChild(imageEl);

                        // divEl.appendChild(anchorEl);   


                        var eventItemEl = document.createElement("ul");
                        eventItemEl.classList.add("event-cards")
                        eventItemEl.setAttribute('id', eventObj['event-id'])
                        eventItemEl.innerHTML = "<li><h2>" + eventObj['artist-name'] + '</h2></li><li>' + eventObj['venue-name'] + '</li><li>'
                            + eventObj['date'] + '</li><li><a href=' + eventObj['url'] + '>Click here for more info!</a></li><li>' + eventObj['address'] +
                            "</li> <button class = 'favorite'>Favorite</button><br><br>";
                        sectionEl.appendChild(eventItemEl);
                        eventCardsEl.appendChild(sectionEl);

                    }

                })

                // eventObjList.JSON.parse(eventObjList)


            } else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function (error) {
            alert("Unable to connect to TicketMaster");
        });
};




loadFavs()
//findEvents(austinLatLong, tmKey, 25)


