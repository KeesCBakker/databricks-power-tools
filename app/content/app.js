function readFromStore(property, defaultValue, action) {

    chrome.storage.sync.get(property, data => {

        console.log(data);

        if (data.hasOwnProperty(property)) {
            console.log("Property exists");
            value = data[property];
        }
        else {
            value = defaultValue;
        }

        action(value);
    });
}

readFromStore("stylesheet", null, styles => {
    if (styles) {
        addStyle(styles);
    }
});

let toc = true;
readFromStore("toc", true, x => {
    toc = x;
    locationHashChanged();
});

let scrollOnHover = true;
readFromStore("soh", false, x => {
    scrollOnHover = x;
    refresh();
});


let dv = document.createElement("div");
document.body.appendChild(dv);

dv.id = "kaas";
dv.onmouseenter = () => refresh();
dv.innerHTML = `<strong>Table of contents</strong>
<div class="inner">
    <ol></ol>
    <div class="empty-msg">No headings found...</div>
</div>`;

let ol = dv.getElementsByTagName("ol")[0];

addStyle(`

#kaas {
    padding: 4px;
	background: #fff;
	position: absolute;
	top: 12px;
	right: 130px;
    max-width: 250px;
    text-align:right;
}

#kaas .inner {
    max-height: 50vh;
    overflow-x: auto;
    overflow-y: none;
    display:block;
    text-align:left;
    padding:4px;
    padding-right:8px;
}

#kaas .inner::-webkit-scrollbar {
    width: 4px;
}

#kaas .inner::-webkit-scrollbar-thumb {
    background: #aaa;
    border-radius: 2px;
}

#kaas ol {
    margin-bottom:0px;
}

#kaas .empty-msg,
#kaas .inner {
	display: none
}

#kaas a {
    display:inline-block;
    vertical-align: top;
}

#kaas a:hover {
    color:red;
}

#kaas:hover {
	border: solid 1px #eee;
	padding: 3px
}

#kaas:hover .inner {
	display: block
}

#kaas:hover strong {
    border-bottom:solid 1px #eee;
    display: block;
    margin-bottom:2px;
    padding-bottom:2px;
    cursor:pointer;
}

#kaas.empty:hover .empty-msg {
    display:block;
    font-style:italic;
    color:#999;
}

#kaas.empty:hover ol {
    display:none;
}

.heading-command-wrapper:before {
    content:'';
    visibility:hidden;
    margin-top:-73px;
    height:73px;
    display:block;
}

`);

function refresh() {

    let fol = document.createElement("ol");

    [...document.querySelectorAll('.heading-command-wrapper h1, .heading-command-wrapper h2, .heading-command-wrapper h3, .heading-command-wrapper h4, .notebook-command-title input')].map(ex1 => {
        var li = document.createElement('li');
        var ea = document.createElement('a');
        li.appendChild(ea);
        ea.innerText = ex1.nodeName == "INPUT" ? ex1.value : ex1.innerText;
        ea.onclick = function () {
            ex1.closest('.heading-command-wrapper').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        };

        if (scrollOnHover) {
            ea.className = "with-hover";
            ea.onmouseenter = function () {
                ex1.closest('.heading-command-wrapper').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            };
        }

        return li
    }).forEach(li => fol.appendChild(li));

    // only update when changed :-)
    if (ol.innerHTML !== fol.innerHTML) {
        ol.innerHTML = "";
        [...fol.children].forEach(c => ol.appendChild(c));
    }

    dv.classList.toggle("empty", ol.childElementCount == 0);
}

function addStyle(styles) {
    var st = document.createElement("style");
    st.innerText = styles;
    document.head.appendChild(st);
}

function locationHashChanged() {
    dv.style.display = !toc || location.hash.indexOf("#notebook") == -1 ? 'none' : 'block';
    if (dv.style.display == 'block') {
        refresh();
        for (var i = 1; i < 20; i++) {
            setTimeout(refresh, 500 * i);
        }
    }

}

locationHashChanged();
window.addEventListener('DOMContentLoaded', locationHashChanged, false);
window.addEventListener('hashchange', locationHashChanged, false);

