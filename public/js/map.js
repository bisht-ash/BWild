const arr=JSON.parse(coordinates);
mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: arr,
        zoom: 9
    });

new mapboxgl.Marker()
    .setLngLat(arr)
    .addTo(map);

    map.addControl(new mapboxgl.NavigationControl());    