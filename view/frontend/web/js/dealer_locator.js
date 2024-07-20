require([
    "jquery",
], function ($) {


    $(document).ready(function () {
var dealer_locator_map;
var dealer_locator_markers = [];
var dealer_locator_info_window;
var resultsRadiusLimit = 200;
var error_el = jQuery('.dealer-locator-search-message');
var ajaxUrl = $('#dealer-locator').data('ajax-url');
//var ajaxUrl = '/VPuscasu_dealerlocator/ajax/index';

//var ajaxUrl = document.getElementById('ajax-url').value;
var formKey = document.querySelector('input[name="form_key"]').value;

function dealer_locator_init_map() {
    //console.log('Inside dealer_locator_init_map function');
    //console.log(document.getElementById('dealer-locator-map'));
    //console.log(ajaxUrl);
    if (document.getElementById('dealer-locator-map') === null) {
        //console.log('Element "dealer-locator-map" does not exist');
        return false;
    }
    console.log('Intializing dealer locator map...');
    dealer_locator_map = new google.maps.Map(document.getElementById('dealer-locator-map'), {
        scrollwheel: false,
        center: { lat: 43.653226, lng: -79.3831843 },
        zoom: 9
    });
    dealer_locator_info_window = new google.maps.InfoWindow();
}

if (typeof google === 'object' && typeof google.maps === 'object') {
    // Google Maps API is loaded, now we can call map-related functions
    dealer_locator_init_map();
} else {
    console.log('Google Maps API is not loaded yet.');
}



function dealer_locator_add_marker(location, showDistance=true, showAddress=true, countryTitle=false) {
    var marker = new google.maps.Marker({
        position: { lat: parseFloat(location.lat), lng: parseFloat(location.long) },
        map: dealer_locator_map
    });
    dealer_locator_markers.push(marker);
    marker.addListener('click', function () {
        dealer_locator_info_window.setContent(
            build_html_address(location, showDistance, showAddress, countryTitle)
        );
        dealer_locator_info_window.open(dealer_locator_map, marker);
    });
}

function dealer_locator_set_map_on_all(map) {
    for (var i = 0; i < dealer_locator_markers.length; i++) {
        dealer_locator_markers[i].setMap(map);
    }
}

function dealer_locator_clear_markers() {
    dealer_locator_set_map_on_all(null);
}

function dealer_locator_delete_markers() {
    dealer_locator_clear_markers();
    dealer_locator_markers = [];
}

function dealer_locator_show_spinner() {
    jQuery('.dealer-locator-search-spinner').show();
}

function dealer_locator_hide_spinner() {
    jQuery('.dealer-locator-search-spinner').hide();
}

function dealer_locator_show_message(msg) {
    // Set message and fade in
    error_el.html(msg).fadeIn('slow');
}

function dealer_locator_hide_message() {
    // Fade out and remove text
    error_el.fadeOut('slow', function(){error_el.html('')});
}

jQuery(document).ready(function ($) {

    
    // Handle [Enter] key
    $('body').on('keypress', '.dealer-locator-search-input', function (e) {
        if (e.which === 13) {
            $('.dealer-locator-search-btn').trigger('click');
        }
    });

    // Handle "Search" click
    $('body').on('click', '.dealer-locator-search-btn', function (e) {
        console.log(ajaxUrl);
        console.log(formKey);
        e.preventDefault();
        var input_el = $('.dealer-locator-search-input');
        var search_results_el = $('#dealers');
        dealer_locator_hide_message()
        search_results_el.html('');
        dealer_locator_show_spinner();

        $.ajax({
            //cache: false,
            dataType: 'json',
            method: 'POST',
            url: ajaxUrl,
            data: {
                //_ajax_nonce: dealer_locator_ajax_obj.nonce,
                form_key: formKey,
                action: 'dealer_locator_search',
                search: input_el.val()
            }

        }).done(function (data, textStatus, jqXHR) {
            //if (data.form_key) {
                //sendAjaxRequest(data.form_key);
            //}

            var msg = '';
            var resultsStr = '';

            if (!data.data) {
                // No data returned by DDM
                dealer_locator_hide_spinner();
                $('.dealer-locator-map-wrapper').hide();
                msg = 'Your location could not be found. Please check the spelling and try again.';
                dealer_locator_show_message(msg);
            } else {

                switch (data.data.statusCode) {

                    case '99': // Dealers found
                        console.log('Status 99: Search term not found');
                        $('.dealer-locator-map-wrapper').hide();
                        msg = 'There was a problem processing your search. Please check the spelling.';
                        dealer_locator_show_message(msg);
                        break;

                    case '100': // Dealers found
                    

                        console.log('Status 100');
                        $('.dealer-locator-map-wrapper').show();
                        dealer_locator_delete_markers();
                        var locations = [];
                        var onlineLocations = [];

                        if (data.data) {
                            if (data.data.locations && data.data.locations.length) {
                                // This should always happen if DDM is working properly
                                locations = data.data.locations;
                            }
                            if (data.data.onlineInCountry && data.data.onlineInCountry.length) {
                                onlineLocations = data.data.onlineInCountry;
                            }
                        }

                        // Process online dealers
                        if (onlineLocations.length) {
                            resultsStr += '<h2 class="dealer-locator-results-subheader">Online Dealers</h2>';
                            for (var i = 0; i < onlineLocations.length; i++) {
                                // Add address to list of visible addresses
                                resultsStr += build_html_address(onlineLocations[i], false, false);
                            }
                        }
                        // Process B&M dealers
                        if (locations.length) {
                            resultsStr += '<h2 class="dealer-locator-results-subheader">Dealers found within '+ resultsRadiusLimit +' kilometres...</h2>';
                            var bounds = new google.maps.LatLngBounds();
                            for (var i = 0; i < locations.length; i++) {

                                // Pin address to the map
                                var position = { lat: parseFloat(locations[i].lat), lng: parseFloat(locations[i].long) };
                                dealer_locator_add_marker(locations[i]);
                                bounds.extend(position);

                                // Add location to list of visible addresses
                                resultsStr += build_html_address(locations[i]);
                            }
                            dealer_locator_map.fitBounds(bounds);

                        }
                        // Process national distributor(s)
                        if (data.data.distributors.length) {
                            if (data.data.distributors.length > 1) {
                                resultsStr += '<h2 class="dealer-locator-results-subheader">National distributors</h2>';
                            } else {
                                resultsStr += '<h2 class="dealer-locator-results-subheader">National distributor</h2>';
                            }
                            // Add distributor to list of visible addresses
                            for (var i = 0; i < data.data.distributors.length; i++) {
                                resultsStr += build_html_address(data.data.distributors[i], false, false);
                            }
                        }
                    
                        // Show list of addresses
                        search_results_el.html(resultsStr);
                        break;

                    case '101': // Search too broad
                        console.log('Status 101');
                        $('.dealer-locator-map-wrapper').hide();
                        msg = 'Search is too broad. Please narrow your search and try again.';
                        dealer_locator_show_message(msg);
                        break;

                    case '102': // No nearby dealers; show closest dealer and national distributor(s)
                        console.log('Status 102');
                        $('.dealer-locator-map-wrapper').hide();
                        msg = 'There are no nearby dealers.';
                        dealer_locator_show_message(msg);

                        if (data.data.locations[0]) {
                            resultsStr += '<h2 class="dealer-locator-results-subheader">Closest dealer in your country</h2>';
                            // Add location to list of visible addresses
                            resultsStr += build_html_address(data.data.locations[0]);
                        }
                        // Process national distributor(s)
                        if (data.data.distributors.length) {
                            if (data.data.distributors.length > 1) {
                                resultsStr += '<h2 class="dealer-locator-results-subheader">National distributors</h2>';
                            } else {
                                resultsStr += '<h2 class="dealer-locator-results-subheader">National distributor</h2>';
                            }
                            // Add distributor to list of visible addresses
                            for (var i = 0; i < data.data.distributors.length; i++) {
                                resultsStr += build_html_address(data.data.distributors[i], false, false);
                            }
                        }
                        // Show addresses
                        search_results_el.html(resultsStr);

                        break;

                    case '103': // No dealers in this country; show national distributor
                        console.log('Status 103');
                        $('.dealer-locator-map-wrapper').hide();
                        msg = 'There are no dealers in that country.';
                        dealer_locator_show_message(msg);

                        //$('.dealer-locator-map-wrapper').show();
                        dealer_locator_delete_markers();

                        var distributors = [];
                        if (data.data) {
                            if (data.data.distributors && data.data.distributors.length) {
                                // This should always happen if server is working properly
                                distributors = data.data.distributors;
                            }
                        }
                        if (distributors.length) {
                            resultsStr += '<h2 class="dealer-locator-results-subheader">National Distributors</h2>';
                            //var bounds = new google.maps.LatLngBounds();
                            for (var i = 0; i < distributors.length; i++) {

                                // Pin address to the map
                                //var position = { lat: parseFloat(distributors[i].lat), lng: parseFloat(distributors[i].long) };
                                //dealer_locator_add_marker(distributors[i]);
                                //bounds.extend(position);

                                // Add address to list of visible addresses
                                resultsStr += build_html_address(distributors[i], false, false);
                            }
                            //dealer_locator_map.fitBounds(bounds);

                            // Show list of addresses
                            search_results_el.html(resultsStr);
                        }

                        break;

                    case '104': // No dealers nor distributors in this country; show distributor list
                        console.log('Status 104');
                        $('.dealer-locator-map-wrapper').hide();
                        msg = 'There are no dealers or distributors in that country.<br>Please see our <a href="#distributors" onclick="$(\'#distributors\').trigger(\'click\');">distributor list</a> below.';
                        dealer_locator_show_message(msg);
/*
                    
*/
                        break;

                    default:
                        console.log('Unknown status');
                        $('.dealer-locator-map-wrapper').hide();
                        msg = 'There was a problem processing your search. Please try again later.';
                        dealer_locator_show_message(msg);
                } // end switch
            } // end if

            console.log(data);

        }).fail(function (jqXHR, textStatus, errorThrown) {
            error_el.html(errorThrown).fadeIn('slow');

        }).always(function () {
            dealer_locator_hide_spinner();
        });
    });

    setup_distributor_list();

});


function setup_distributor_list() {
    // Check if distributor list element exists
    if (document.getElementById('distributors-list') === null) {
        //console.log('Element "distributors-list" does not exist');
        return false;
    }

    // Setup distributor list element
    console.log('Setting up distributor list...');
    var dist_results_el = jQuery('#distributors-list');
    dist_results_el.slideUp(10);
    // Set some temporary text in case the user is faster than the AJAX request
    dist_results_el.html('Loading the distributor list...');

    // Handle "View distributors list" click
    jQuery('body').on('click', '.distributors-toggle', function (e) {
        e.preventDefault();
        if (jQuery('#distributors').attr('aria-expanded') == 'false') {
            jQuery('#distributors').attr('aria-expanded', true);
            dist_results_el.slideToggle(3000);

            var target = jQuery('#distributors');
            if (target.length) {
                jQuery('html, body').animate({
                    scrollTop: target.offset().top
                }, 500);
                return false;
            }

        } else {
            jQuery('#distributors').attr('aria-expanded', false);
            dist_results_el.slideToggle(1000);
        }
    });

    // Lazy load the distributor list
    jQuery.ajax({
        cache: false,
        dataType: 'json',
        method: 'POST',
        url: ajaxUrl,
        data: {
            form_key: formKey,
            action: 'distributors_request'
        }

    }).done(function (data, textStatus, jqXHR) {
        //if (data.form_key) {
            //sendAjaxRequest(data.form_key);
        //}

        var resultsStr = '';

        if (!data.data) {
            // No data returned by DDM
            resultsStr = 'The distributor list could not be loaded. Please try again later.';
            dist_results_el.html(resultsStr);
        } else {

            switch (data.data.statusCode) {

                case '109': // Distributors loaded; show distributor list
                    console.log('Status 109');

                    var distributors = [];
                    if (data.data.distributors && data.data.distributors.length) {
                        // This should always happen if server is working properly
                        distributors = data.data.distributors;
                        distributors.sort(function(a, b) {
                            return a.country.localeCompare(b.country);
                        });
                    }
                    if (distributors.length) {
                        resultsStr += '<h2 class="dealer-locator-results-subheader">Distributors</h2>';
                        for (var i = 0; i < distributors.length; i++) {
                            // Add address to list of visible addresses
                            resultsStr += build_html_address(distributors[i], false, true, true);
                        }

                        // Show list of addresses
                        dist_results_el.html(resultsStr);
                    }
                    break;

                default:
                    console.log('Unknown status');
                    resultsStr += 'There was a problem processing your search. Please try again later.';
                    dist_results_el.html(resultsStr);
            } // end switch
        } // end if
        console.log(data.data);
        console.log(data);

    }).fail(function (jqXHR, textStatus, errorThrown) {
        error_el.html(errorThrown).fadeIn('slow');

    }).always(function () {
        dealer_locator_hide_spinner();
    });

}

function build_html_address(location, showDistance=true, showAddress=true, countryTitle=false) {

    // replace any null values with an empty string
    for (var p in location) {
        if (location.hasOwnProperty(p)) {
            if (location.p === null) {
                location.p = '';
            }
        }
    }

    var cityStateZip = '';
    if (location.city && (location.state || location.zip)) { // city followed by something
        cityStateZip = location.city + ', ' + location.state + ' ' + location.zip;
    } else if (location.city) { // only city
        cityStateZip = location.city;
    } else { // no city
        cityStateZip = location.state + ' ' + location.zip;
    }

    var faxStr = '';
    if (location.fax) {
        if (location.fax.length) {
            faxStr = '<div>' + location.fax + ' (fax)</div>'
        }
    }

    // Create a version of the URL without the protocol or trailing slash
    var urlStr = '';
    if (location.url) {
        var shortUrl = location.url.replace(/https?:\/\//, '');
        shortUrl = shortUrl.replace(/\/$/, '');
        // Remove 'www'
        shortUrl = shortUrl.replace(/^www./, '');
        urlStr = '<div><a href="' + location.url + '" target="_blank">' + shortUrl + '</a></div>';
    }

    var distanceStr = '';
    if (showDistance) {
        distanceStr = '<div>' + parseInt(location.dist, 10) + ' km</div>';
    }

    var resultsStr = '<div class="dealer-locator-search-result">';

    if (countryTitle) {
        resultsStr += '<h3>' + location.country + '</h3>'
            + '<div>' + location.title + '</div>';
    } else {
        resultsStr += '<h3>' + location.title + '</h3>';
    }
    if (showAddress) {
        resultsStr += '<div>' + location.street + '</div>'
            + '<div>' + cityStateZip + '</div>';
    }
    resultsStr += '<div>' + location.phone + '</div>'
        + faxStr
        + urlStr
        + distanceStr
        + '</div>';
    return resultsStr;
}
});
});