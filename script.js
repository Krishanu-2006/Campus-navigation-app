let map;
let userMarker = null;
let destinationMarker = null;
let routeControl = null;

let locations = [];


// ======================================================
// MAP INITIALIZATION
// ======================================================

const campusCenter = [
    22.69515,
    88.37882
];

map = L.map("map").setView(
    campusCenter,
    17
);


// OpenStreetMap
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// ======================================================
// LOAD LOCATIONS FROM FLASK
// ======================================================

fetch("/locations")
    .then(response => {

        if (!response.ok) {
            throw new Error(
                "Could not load locations"
            );
        }

        return response.json();

    })
    .then(data => {

        locations = data;

        console.log(
            "Locations loaded:",
            locations
        );

        addLocationMarkers();

    })
    .catch(error => {

        console.error(
            "Location loading error:",
            error
        );

    });


// ======================================================
// ADD CAMPUS LOCATION MARKERS
// ======================================================

function addLocationMarkers() {

    locations.forEach(location => {

        const marker = L.marker([
            location.latitude,
            location.longitude
        ]).addTo(map);


        marker.bindPopup(`
            <b>📍 ${location.name}</b>
            <br>
            Campus Location
        `);

    });

}


// ======================================================
// SEARCH ELEMENTS
// ======================================================

const searchInput =
    document.getElementById(
        "searchInput"
    );

const suggestions =
    document.getElementById(
        "suggestions"
    );


// ======================================================
// SEARCH SUGGESTIONS
// ======================================================

searchInput.addEventListener(
    "input",
    function () {

        const searchText =
            this.value
                .trim()
                .toLowerCase();


        suggestions.innerHTML = "";


        if (searchText === "") {
            return;
        }


        const matchedLocations =
            locations.filter(location =>
                location.name
                    .toLowerCase()
                    .includes(searchText)
            );


        if (matchedLocations.length === 0) {

            suggestions.innerHTML = `
                <div class="suggestion-item">
                    ❌ Location not found
                </div>
            `;

            return;
        }


        matchedLocations.forEach(
            location => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "suggestion-item";


                item.innerHTML = `
                    📍 ${location.name}
                `;


                item.addEventListener(
                    "click",
                    function () {

                        selectLocation(
                            location
                        );

                    }
                );


                suggestions.appendChild(
                    item
                );

            }
        );

    }
);


// ======================================================
// SELECT DESTINATION
// ======================================================

function selectLocation(location) {

    searchInput.value =
        location.name;


    suggestions.innerHTML =
        "";


    const destination = [
        Number(location.latitude),
        Number(location.longitude)
    ];


    // Move map to destination

    map.setView(
        destination,
        18
    );


    // Remove old destination marker

    if (destinationMarker) {

        map.removeLayer(
            destinationMarker
        );

        destinationMarker = null;

    }


    // Add destination marker

    destinationMarker =
        L.marker(
            destination
        )
        .addTo(map);


    destinationMarker
        .bindPopup(`
            <b>📌 ${location.name}</b>
            <br>
            Destination
        `)
        .openPopup();


    // Update information

    document
        .getElementById(
            "destination"
        )
        .textContent =
        location.name;


    document
        .getElementById(
            "distance"
        )
        .textContent =
        "--";


    document
        .getElementById(
            "time"
        )
        .textContent =
        "--";


    // If current location exists,
    // create route automatically

    if (userMarker) {

        createRoute(
            destination
        );

    }

}


// ======================================================
// SEARCH BUTTON
// ======================================================

document
    .getElementById(
        "searchBtn"
    )
    .addEventListener(
        "click",
        function () {

            const text =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (text === "") {

                alert(
                    "Please search for a location."
                );

                return;
            }


            const location =
                locations.find(
                    place =>
                        place.name
                            .toLowerCase()
                            .includes(text)
                );


            if (!location) {

                alert(
                    "Location not found!"
                );

                return;
            }


            selectLocation(
                location
            );

        }
    );


// ======================================================
// ENTER KEY SEARCH
// ======================================================

searchInput.addEventListener(
    "keypress",
    function (event) {

        if (event.key === "Enter") {

            document
                .getElementById(
                    "searchBtn"
                )
                .click();

        }

    }
);


// ======================================================
// MY LOCATION BUTTON
// ======================================================

document
    .getElementById(
        "locationBtn"
    )
    .addEventListener(
        "click",
        getUserLocation
    );


function getUserLocation() {

    if (!navigator.geolocation) {

        alert(
            "Geolocation is not supported by your browser."
        );

        return;
    }


    navigator.geolocation
        .getCurrentPosition(

            function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                const userPosition = [
                    latitude,
                    longitude
                ];


                console.log(
                    "Current location:",
                    latitude,
                    longitude
                );


                // Move map to current location

                map.setView(
                    userPosition,
                    18
                );


                // Remove previous user marker

                if (userMarker) {

                    map.removeLayer(
                        userMarker
                    );

                    userMarker = null;

                }


                // Add current location marker

                userMarker =
                    L.marker(
                        userPosition
                    )
                    .addTo(map);


                userMarker
                    .bindPopup(
                        "<b>🔵 You are here</b>"
                    )
                    .openPopup();


                // Check selected destination

                const destinationName =
                    document
                        .getElementById(
                            "destination"
                        )
                        .textContent;


                if (
                    destinationName !==
                    "Not Selected"
                ) {

                    const destination =
                        locations.find(
                            location =>
                                location.name ===
                                destinationName
                        );


                    if (destination) {

                        createRoute([
                            Number(
                                destination.latitude
                            ),

                            Number(
                                destination.longitude
                            )
                        ]);

                    }

                }

            },


            function (error) {

                console.error(
                    "Geolocation error:",
                    error
                );


                if (
                    error.code === 1
                ) {

                    alert(
                        "Location permission denied. Please allow location access."
                    );

                }

                else if (
                    error.code === 2
                ) {

                    alert(
                        "Your location could not be determined."
                    );

                }

                else if (
                    error.code === 3
                ) {

                    alert(
                        "Location request timed out."
                    );

                }

                else {

                    alert(
                        "Unable to get your location."
                    );

                }

            },

            {
                enableHighAccuracy: true,

                timeout: 15000,

                maximumAge: 0

            }

        );

}


// ======================================================
// CREATE ROUTE
// ======================================================

function createRoute(destination) {

    // Check current location

    if (!userMarker) {

        alert(
            "First click 'My Location'."
        );

        return;
    }


    const userPosition =
        userMarker.getLatLng();


    console.log(
        "Route FROM:",
        userPosition.lat,
        userPosition.lng
    );


    console.log(
        "Route TO:",
        destination[0],
        destination[1]
    );


    // Remove previous route

    if (routeControl) {

        map.removeControl(
            routeControl
        );

        routeControl = null;

    }


    // ==================================================
    // LEAFLET ROUTING MACHINE
    // ==================================================

    routeControl =
        L.Routing.control({

            // Explicit OSRM router

            router:
                L.Routing.osrmv1({

                    serviceUrl:
                        "https://router.project-osrm.org/route/v1"

                }),


            // Starting point and destination

            waypoints: [

                L.latLng(
                    userPosition.lat,
                    userPosition.lng
                ),

                L.latLng(
                    Number(destination[0]),
                    Number(destination[1])
                )

            ],


            routeWhileDragging:
                false,


            addWaypoints:
                false,


            createMarker:
                false,


            showAlternatives:
                false,


            fitSelectedRoutes:
                true,


            show:
                false,


            lineOptions: {

                styles: [

                    {
                        color: "#2563eb",

                        opacity: 0.9,

                        weight: 7
                    }

                ]

            }

        })
        .addTo(map);


    // ==================================================
    // ROUTE FOUND
    // ==================================================

    routeControl.on(
        "routesfound",
        function (event) {

            console.log(
                "Route found successfully!"
            );


            const route =
                event.routes[0];


            const distance =
                route.summary.totalDistance;


            const time =
                route.summary.totalTime;


            // Convert metres → kilometres

            const distanceKm =
                (
                    distance / 1000
                ).toFixed(2);


            // Convert seconds → minutes

            const timeMinutes =
                Math.ceil(
                    time / 60
                );


            // Show distance

            document
                .getElementById(
                    "distance"
                )
                .textContent =
                distanceKm +
                " km";


            // Show estimated time

            document
                .getElementById(
                    "time"
                )
                .textContent =
                timeMinutes +
                " minutes";


            console.log(
                "Distance:",
                distanceKm,
                "km"
            );


            console.log(
                "Time:",
                timeMinutes,
                "minutes"
            );

        }
    );


    // ==================================================
    // ROUTING ERROR
    // ==================================================

    routeControl.on(
        "routingerror",
        function (error) {

            console.error(
                "ROUTING ERROR:",
                error
            );


            alert(
                "Route could not be found. Please check your current location and destination."
            );

        }
    );

}


// ======================================================
// CLOSE SEARCH SUGGESTIONS
// ======================================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                ".search-container"
            )
        ) {

            suggestions.innerHTML =
                "";

        }

    }
);