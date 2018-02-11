function windowSized() {
    var ul = document.getElementById('ulNavLinks');
    if (ul) {
        if (window.innerWidth < 768) {
            ul.classList.add('nav-justified');
        }
        else {
            ul.classList.remove('nav-justified');
        }
    }
}

//Parses the querystring of the given URL to a name/value dictionary object
function parseQuerystring() {
    var dict = {},
        vars = location.search.replace(/^[^\?]*\?/, '').split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        dict[pair[0]] = pair[1];
    }
    return dict;
}

document.body.onresize = windowSized;
windowSized();

