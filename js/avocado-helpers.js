

// Puts the given page in the database and ensures any keyword indices are maintained
function logPage(site, callback) {
    var fb = new Firebase('https://guac.firebaseio.com'),
        page_clean_url = clean_url(site.url);

    fb.child('pages/' + page_clean_url).once('value', function(snapshot) {
        var data = snapshot.val(),
            toAdd, toRemove;

        // Figure out which keywords we need to add and remove.
        if (data) {
            toAdd    = _.difference(site.keywords, data.keywords),
            toRemove = _.difference(data.keywords, site.keywords);
        } else {
            toAdd    = site.keywords,
            toRemove = [];
        }

        toAdd.forEach(function(keyword) {
            addPageToKeyword(page_clean_url, site.url, keyword)
        })

        toRemove.forEach(function(keyword) {
            removePageFromKeyword(page_clean_url, keyword)
        })

        fb.child('pages/' + page_clean_url).update(site, callback)
    })

    function addPageToKeyword(p_clean_url, real_url, keyword) {
        fb.child('keywords/' +  keyword + '/sites/' + p_clean_url).set(real_url)
    }

    function removePageFromKeyword(p_clean_url, keyword) {
        fb.child('keywords/' +  keyword + '/sites/' + p_clean_url).set(null)
    }
}

// returns array of objects: 
// [{
//     url: String,
//     weight: Number <-- fraction of keywords for original site that this site matched
// },
// etc...
// ]
function getRecommendations(site, callback) {
    var fb = new Firebase('https://guac.firebaseio.com');

    // This callback technically isn't guaranteed to execute after updating
    // keywords when logging the page, but it shouldn't be a huge issue.
    logPage(site, reallyGetRecommendations);

    function reallyGetRecommendations() {
        fb.child('keywords').once('value', function(snapshot) {
            var keywords = snapshot.val(),
                selected_sites = [];

            site.keywords.forEach(function(key) {
                selected_sites = selected_sites.concat(_.values(keywords[key].sites))
            })

            selected_sites = _.countBy(selected_sites)
            selected_sites = _.pairs(selected_sites).map(function(d) {
                return {
                    url: d[0],
                    weight: d[1]*1.0/site.keywords.length
                }
            })

            if (callback) callback(selected_sites)
        })
    }
}

function clean_url(url) {
    return url.replace(/.*?:\/\//g,"").replace(/\.|\/|\#|\$|\[|\]/g,'-');
}

// Example usage:

// Make site profile
// site_profile = {
//     url: 'https://google.com/home/index.php?pid=23',
//     title: 'Google',
//     keywords: [
//         'search',
//         'internet',
//         'wow',
//         'dog'
//     ]
// }

// getRecommendations(site_profile, function(sites) {
//     console.log(sites)
// })