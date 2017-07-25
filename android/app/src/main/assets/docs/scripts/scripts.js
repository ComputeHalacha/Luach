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

document.body.onresize = windowSized;
windowSized();

