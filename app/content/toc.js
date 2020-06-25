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
	right: 10px;
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

.scrolling .heading-command-wrapper:before {
    content:'';
    visibility:hidden;
    margin-top:-73px;
    height:73px;
    display:block;
}

.kaas-active .tb-button-user {
    margin-right: 124px;
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
            scrollTo(ex1);
        };

        if (scrollOnHover) {
            ea.className = "with-hover";
            ea.onmouseenter = function () {
                scrollTo(ex1);
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

function locationHashChanged() {


    let active = toc && document.location.hash.indexOf("#notebook") != -1;
    dv.style.display = active ? 'block' : 'none';

    document.body.classList.toggle("kaas-active", active);

    if (active) {
        refresh();
        for (var i = 1; i < 20; i++) {
            setTimeout(refresh, 500 * i);
        }
    }
}

function scrollTo(element) {
    document.body.classList.add("scrolling");
    element.closest('.heading-command-wrapper').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    document.body.classList.remove("scrolling");
}


locationHashChanged();
window.addEventListener('DOMContentLoaded', locationHashChanged, false);
window.addEventListener('hashchange', locationHashChanged, false);