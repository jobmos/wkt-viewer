//namespace with properties and methods here
var formatParseApp = {
    selFormat: 'WKT',
    defProj: 'EPSG:28992',

    setFormat: function (event) {
        var $target = $(event.currentTarget);
        var format = $target.text();
        if (format === 'GeoJson1' || format === 'GeoJson2') format = 'GeoJson'
        document.getElementById('format-input').placeholder = 'Paste ' + format + ' here ';
        formatParseApp.selFormat = format;

        $target.closest('.btn-group')
            .find('[data-bind="label"]').text($target.text())
            .end()
            .children('.dropdown-toggle').dropdown('toggle');

        if ($target.closest('.btn-group')[0].id !== 'formatSelectorBtn') { //case when demo selected need to update the format selector 
            $('#formatSelectorBtn').find('[data-bind="label"]').text(format)
                .end()
                .children('.dropdown-toggle').dropdown('toggle');
        }
        return false;
    },

    clearAll: function () {
        document.getElementById('format-input').value = '';
        document.getElementById('epsginfo').innerHTML = "(28992) WGS 84";
        $('#epsg-query').val("");
        this.defProj = 'EPSG:28992';
        $('#featureContents').html('Feature contents here!');
        vectorSource.clear();
    },

    parseIt: function () {
        var usrFormat = formatParseApp.selFormat;
        var features;
        console.log("formatParseApp.defProj1", formatParseApp.defProj)
        if ($('#clearfeatschk').prop('checked')) vectorSource.clear();
        switch (usrFormat) {
            case 'GeoJson':
                try {


                    var geoJsonProj = new ol.format.GeoJSON().readProjection(document.getElementById('format-input').value);
                    console.log("geoJsonProj", geoJsonProj);
                    if (typeof geoJsonProj !== 'undefined' && geoJsonProj !== null) {
                        formatParseApp.defProj = geoJsonProj;
                        // document.getElementById('epsginfo').innerHTML = geoJsonProj.code_;
                        $('#epsg-query').val(geoJsonProj.code_.split(":")[1]);
                        this.searchEPSG();
                    }
                    console.log("formatParseApp.defProj2", formatParseApp.defProj)
                    var projConfig = {};
                    if (formatParseApp.defProj == 'EPSG:3857') {
                        console.log("proj config equals map projection")
                        projConfig = {};
                    } else if (formatParseApp.defProj != 'EPSG:3857') {
                        projConfig = {
                            dataProjection: ol.proj.get(formatParseApp.defProj),
                            featureProjection: ol.proj.get('EPSG:3857')
                        }
                    }
                    features = new ol.format.GeoJSON().readFeatures(
                        document.getElementById('format-input').value,
                        projConfig
                    );
                    vectorSource.addFeatures(features);
                    map.getView().fit(vectorSource.getExtent(), map.getSize());
                    formatParseApp.showFeatureData(features);
                }
                catch (err) {
                    $('#message').html(
                        '<div style="margin: 20px;"  class="alert alert-danger fade in">' +
                        '<a href="#" class="close" data-dismiss="alert">&times;</a>Error Parsing GeoJson:' + err.message + '</div>');
                    $("#message").fadeTo(4000, 500).slideUp(500, function () {
                        $("#message").alert('close');
                    });
                }
                break;
            case 'KML':
                try {
                    features = new ol.format.KML().readFeatures(document.getElementById('format-input').value, {
                        dataProjection: ol.proj.get(formatParseApp.defProj),
                        featureProjection: 'EPSG:3857'
                    });
                    vectorSource.addFeatures(features);
                    map.getView().fit(vectorSource.getExtent(), map.getSize());
                    formatParseApp.showFeatureData(features);
                }
                catch (err) {
                    $('#message').html(
                        '<div style="margin: 20px;"  class="alert alert-danger fade in">' +
                        '<a href="#" class="close" data-dismiss="alert">&times;</a>Error Parsing KML:' + err.message + '</div>');
                    $("#message").fadeTo(4000, 500).slideUp(500, function () {
                        $("#message").alert('close');
                    });
                }
                break;
            case 'GPX':
                try {
                    features = new ol.format.GPX().readFeatures(document.getElementById('format-input').value, {
                        dataProjection: ol.proj.get(formatParseApp.defProj),
                        featureProjection: 'EPSG:3857'
                    });
                    vectorSource.addFeatures(features);
                    map.getView().fit(vectorSource.getExtent(), map.getSize());
                    formatParseApp.showFeatureData(features);
                }
                catch (err) {
                    $('#message').html(
                        '<div style="margin: 20px;"  class="alert alert-danger fade in">' +
                        '<a href="#" class="close" data-dismiss="alert">&times;</a>Error Parsing GPX:' + err.message + '</div>');
                    $("#message").fadeTo(4000, 500).slideUp(500, function () {
                        $("#message").alert('close');
                    });
                }
                break;
            //wkt sample "POLYGON((-15.8203125 2.4609375, -15.8203125 -10.546875, 6.85546875 -11.25, 8.26171875 -3.33984375, -15.8203125 2.4609375))"
            case 'WKT':
                try {
                    features = new ol.format.WKT().readFeatures(document.getElementById('format-input').value, {
                        dataProjection: ol.proj.get(formatParseApp.defProj),
                        featureProjection: 'EPSG:3857'
                    });
                    vectorSource.addFeatures(features);
                    map.getView().fit(vectorSource.getExtent(), map.getSize());
                    formatParseApp.showFeatureData(features);
                }
                catch (err) {
                    $('#message').html(
                        '<div style="margin: 20px;"  class="alert alert-danger fade in">' +
                        '<a href="#" class="close" data-dismiss="alert">&times;</a>Error Parsing WKT:' + err.message + '</div>');
                    $("#message").fadeTo(4000, 500).slideUp(500, function () {
                        $("#message").alert('close');
                    });
                }
                break;
        }
    },

    showFeatureData: function (features) {
        var html = '';
        var counter = 0;
        features.forEach(function (f) {
            html += '<button type="button" class="btn btn-warning btn-block" data-toggle="collapse" data-target="#featelem' + counter + '">Feature No:' + counter + '</button>';
            html += '<div id="featelem' + counter + '" class="collapse">';

            console.log("f", f.getProperties());
            var jsonObj = f.getProperties();
            $.each(jsonObj, function (key, value) {
                if (key === 'geometry') {
                    if (value !== null) {
                        html += '<table class="table table-hover table-sm">';
                        html += '<tr>';
                        html += '<td><button onclick="formatParseApp.zoomToFeature([' + value.getExtent() + ']); " type="button" class="btn btn-info btn-block btn-sm"><span class="glyphicon glyphicon-map-marker"></span>Go To Map</button></td>';
                        html += '</table>';
                    } else {
                        html += '<table class="table table-hover table-sm">';
                        html += '<tr>';
                        html += '<td><button type="button" class="btn btn-danger btn-block btn-sm"><span class="glyphicon glyphicon-map-marker"></span>Null Geometry</button></td>';
                        html += '</table>';
                    }

                } else {
                    html += '<table class="table table-hover table-sm">';
                    html += '<tr>';
                    html += '<td>' + key + '</td>';
                    html += '<td>' + value + '</td>';
                    html += '</tr>';
                    html += '</table>';
                }
            });
            counter = counter + 1;
            html += "</div>";
        });
        $('#featureContents').html(html);
    },

    zoomToFeature: function (extent) {
        console.log(extent);
        $("html, body").animate({ scrollTop: $('#map').offset().top }, "slow");
        map.getView().fit(extent, map.getSize());
    },

    loadSample: function (url, event) {
        formatParseApp.setFormat(event);
        $.ajax({
            url: url,
            type: 'GET',
            success: function (data) {
                console.log(data);
                document.getElementById('format-input').value = data;
            }
        });

    },

    searchEPSG: function () {
        var valToSearch = $("#epsg-query").val().trim();
        if (valToSearch == "") {
            $("#epsginfo").html('(28992) WGS 84');
            formatParseApp.defProj = 'EPSG:28992';
            return;
        }
        $("#epsginfo").html('Searching for:' + valToSearch + ' .....');
        $.ajax({
            url: 'https://epsg.io/?format=json&q=' + valToSearch,
            type: 'GET',
            success: function (data) {
                var results = data.results;
                if (results && results.length > 0) {
                    for (var i = 0, ii = results.length; i < ii; i++) {
                        var result = results[i];

                        if (result) {
                            var code = result['code'].trim();
                            var name = result['name'];
                            var proj4def = result['proj4'];
                            var bbox = result['bbox'];
                            console.log("bbox", bbox);
                            if (code === null || name === null || proj4def === null || bbox === null) {
                                $("#epsginfo").html('Nothing usable found, using EPSG:28992...');

                                return;
                            }

                            //succeed finding the supplied projection

                            $("#epsginfo").html('(' + code + ') ' + name);

                            formatParseApp.defProj = 'EPSG:' + code;
                            proj4.defs(formatParseApp.defProj, proj4def);
                            var newProj = ol.proj.get(formatParseApp.defProj);
                            var fromLonLat = ol.proj.getTransform('EPSG:28992', 'EPSG:3857');

                            // very approximate calculation of projection extent
                            var extent = ol.extent.applyTransform(
                                [bbox[1], bbox[2], bbox[3], bbox[0]], fromLonLat);
                            newProj.setExtent(extent);
                            console.log("extent", extent)
                            map.getView().fit(extent, map.getSize());
                        }
                    }


                } else {
                    $("#epsginfo").html('Nothing usable found, using EPSG:28992...');
                    formatParseApp.defProj = 'EPSG:28992'
                }
            }
        });

    }

};

var image = new ol.style.Circle({
    radius: 5,
    fill: null,
    stroke: new ol.style.Stroke({ color: 'red', width: 1 })
});

var styles = {
    'Point': new ol.style.Style({
        image: image
    }),
    'LineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'green',
            width: 1
        })
    }),
    'MultiLineString': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'green',
            width: 1
        })
    }),
    'MultiPoint': new ol.style.Style({
        image: image
    }),
    'MultiPolygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'yellow',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 0, 0.1)'
        })
    }),
    'Polygon': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'blue',
            lineDash: [4],
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.1)'
        })
    }),
    'GeometryCollection': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'magenta',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'magenta'
        }),
        image: new ol.style.Circle({
            radius: 10,
            fill: null,
            stroke: new ol.style.Stroke({
                color: 'magenta'
            })
        })
    }),
    'Circle': new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.2)'
        })
    })
};

var styleFunction = function (feature) {
    return styles[feature.getGeometry().getType()];
};

var vectorSource = new ol.source.Vector({});
var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: styleFunction
});

var map = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        vectorLayer
    ],
    target: 'map',
    controls: ol.control.defaults({
        attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
            collapsible: false
        })
    }),
    view: new ol.View({
        center: [0, 0],
        zoom: 0
    })
});

(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date(); a = s.createElement(o),
        m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-5698600-6', 'auto');
ga('send', 'pageview');
