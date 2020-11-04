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
    padding-inline-start: 10px;
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
    margin-top:-18px;
    height:18px;
    display:block;
}

.kaas-active .tb-button-user {
    margin-right: 124px;
}

`);

function last(arr) {
    return arr[arr.length - 1]
}

function handleSubArray(subArr, arr, newItem) {
    if (!Array.isArray(subArr[0]) && subArr[0].level == newItem.level) {
        return [...arr, [...subArr, newItem]]
    } else if (!Array.isArray(last(subArr)) && last(subArr).level == newItem.level) {
        return [...arr, [...subArr, newItem]]
    } else if (!Array.isArray(last(subArr)) && newItem.level > last(subArr).level) {
        return [...arr, [...subArr, [newItem]]]
    } else if (!Array.isArray(last(subArr)) && newItem.level < last(subArr).level && !Array.isArray(last(arr)) && newItem.level >= last(arr).level) {
        return [...arr, [...subArr], [newItem]]
    } else if (Array.isArray(last(subArr))) {
        return [...arr, handleSubArray(last(subArr), subArr.slice(0, -1), newItem)]
    }
}

function levels(base) {
    const final = base.reduce((arr, newItem) => {
        if (arr.length === 0) {
            return [newItem]
        }

        const l = last(arr)
        const b = arr.slice(0, -1)

        if (Array.isArray(l)) {
            return handleSubArray(l, b, newItem)
        } else {
            if (newItem.level > l.level) {
                return [...b, [l, [newItem]]]
            } else if (newItem.level == l.level) {
                return [...b, [l, newItem]]
            } else {
                console.log('Table of contents order does not start with the highest level. Skipping indentation.')
            }
        }
    }, [])

    if (base.length === 1) {
        return final
    } else {
        return final[0]
    }
}

function findHeader(ex1) {
    for (let nr of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
        let selector = 'h' + nr;
        element = ex1.querySelector(selector);
        if (element) {
            return [element, nr];
        }
    }
    return [null, 0];
}


function locationHashChanged(isActiveToc, mainDiv, orderedList, scrollOnHover) {

    function refresh() {

        let fakeOrderedList = document.createElement("ol");

        const _headers = [...document.querySelectorAll('.heading-command-wrapper, .notebook-command-title input')].map(ex1 => {
            let level = 1;

            if (ex1.nodeName != "INPUT") {
                let h = findHeader(ex1);
                ex1 = h[0];
                level = h[1];
            }

            if (!ex1) return null;

            text = ex1.nodeName == "INPUT" ? ex1.value : ex1.innerText;

            if (!text)
                return null;

            var li = document.createElement('li');
            var ea = document.createElement('a');
            li.appendChild(ea);
            ea.innerText = text;
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

            return { level: level, value: li }
        })
            .filter(li => li)

        const levelSet = new Set(_headers.map((x) => x.level))
        const levelList = Array(levelSet.size).fill().map((_, i) => i + 1)
        const levelMap = [...levelSet].sort((a, b) => a - b).map((x, idx) => ({ v: x, l: levelList[idx] }))

        const headers = _headers
            .map((h) => ({ level: levelMap.find((x) => x.v === h.level).l, value: h.value }))

        function setupList(liOrArray, list) {
            if (Array.isArray(liOrArray)) {
                const ol = document.createElement('ol');
                liOrArray.forEach((x) => {
                    setupList(x, ol)
                })
                list.appendChild(ol)
            } else {
                list.appendChild(liOrArray.value)
            }
        }
        var _levels = headers
        try {
            _levels = levels(headers)
        } catch {}

        _levels
            .forEach(liOrArray => {
                setupList(liOrArray, fakeOrderedList)
            });

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