/**
 *  Renders the Table of Contents.
 */


// we make a stylesheet on the fly:
addStyle(`

#kaas {
    display:none;
}

.kaas-active #kaas {
    padding: 4px;
	background: #fff;
	position: absolute;
	top: 12px;
	right: 10px;
    max-width: 250px;
    text-align:right;
    display:block;
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


function locationHashChanged(isActiveToc, mainDiv, orderedList, scrollOnHover) {

    function refresh() {

        let fakeOrderedList = document.createElement("ol");

        [...document.querySelectorAll('.heading-command-wrapper h1, .heading-command-wrapper h2, .heading-command-wrapper h3, .heading-command-wrapper h4, .notebook-command-title input')].map(ex1 => {
            var li = document.createElement('li');
            var ea = document.createElement('a');
            li.appendChild(ea);
            ea.innerText = ex1.nodeName == "INPUT" ? ex1.value : ex1.innerText;
            ea.onclick = function () {
                let w = ex1.closest('.heading-command-wrapper');
                scrollTo(w);
            };

            if (scrollOnHover) {
                ea.className = "with-hover";
                ea.onmouseenter = function () {
                    let w = ex1.closest('.heading-command-wrapper');
                    scrollTo(w);
                };
            }

            return li
        }).forEach(li => fakeOrderedList.appendChild(li));

        // only update when changed :-)
        if (orderedList.innerHTML !== fakeOrderedList.innerHTML) {
            orderedList.innerHTML = "";
            [...fakeOrderedList.children].forEach(c => orderedList.appendChild(c));
        }

        mainDiv.classList.toggle("empty", orderedList.childElementCount == 0);
    }


    let active = isActiveToc && document.location.hash.indexOf("#notebook") != -1;

    // make sure styling kicks in:
    document.body.classList.toggle("kaas-active", active);

    if (active) {

        refresh();

        // reload a few times as Databricks might load slow
        // TOC is only refreshed if a real change is detected
        for (var i = 1; i < 20; i++) {
            setTimeout(() => refresh(), 500 * i);
        }
    }
}

function scrollTo(element) {

    // activate the scrolling class, so the :before 
    // links are activated and the scroll will land
    // on the right position
    document.body.classList.add("scrolling");
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    document.body.classList.remove("scrolling");
}


let isActiveToc = true;
let scrollOnHover = true;

let mainDiv = document.createElement("div");
document.body.appendChild(mainDiv);

mainDiv.id = "kaas";
mainDiv.innerHTML = `<strong>Table of contents</strong>
<div class="inner">
    <ol></ol>
    <div class="empty-msg">No headings found...</div>
</div>`;

let orderedList = mainDiv.getElementsByTagName("ol")[0];

// load settings from store
readFromStore("toc", true, x => {
    isActiveToc = x;
    locationHashChanged(isActiveToc, mainDiv, orderedList, scrollOnHover);
});
readFromStore("soh", false, x => {
    scrollOnHover = x;
    locationHashChanged(isActiveToc, mainDiv, orderedList, scrollOnHover);
});

// refresh on enter of the menu
mainDiv.onmouseenter = () => locationHashChanged(isActiveToc, mainDiv, orderedList, scrollOnHover);

// init
locationHashChanged(isActiveToc, mainDiv, orderedList);
window.addEventListener('DOMContentLoaded', () => locationHashChanged(isActiveToc, mainDiv, orderedList), false);
window.addEventListener('hashchange', () => locationHashChanged(isActiveToc, mainDiv, orderedList), false);