function clickScreenShot(event) {
    window.open(event.target.src);
}

function windowSized() {
    var ul = document.getElementById('ulNavLinks');
    if (ul) {
        if (window.innerWidth < 743) {
            ul.classList.add('nav-justified');
        }
        else {
            ul.classList.remove('nav-justified');
        }
    }
}

var scrShts = document.getElementsByClassName('screenShot');
for (var i = 0; i < scrShts.length; i++) {
    scrShts[i].onclick = clickScreenShot;
}

document.body.onresize = windowSized;

windowSized();

