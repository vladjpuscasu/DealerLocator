Type of API JSON data the module handles:

FOR DISTRIBUTORS:

"status": "Text",
"statusCode": "109",
"distributors": [
{
"dist": 11551,
"id": "9563",
"title": "NAME",
"street": "123 Street Ave",
"city": "Singapore",
"state": "",
"zip": "408830",
"country": "RANDOM COUNTRY",
"countryCode": "AE",
"phone": "+6562951233",
"fax": "234234",
"email": "random@random.com",
"url": "https://www.website.com",
"lat": "1.33339340",
"repStates": [],
"distCountries": [
"COUNTRY 1", "COUNTRY 2"
],
"long": "103.89117260",
"is1Visible": true,
"is2Visible": true,
"is3Visible": true,
"is4Visible": true
}

FOR DEALERS:

Same as above but with google maps api url:

https://ddp.VPuscasu.com/geo?key=' . $siteApiKey . '&address=' . $search;

$siteApiKey is entered in admin, as is Google maps api key