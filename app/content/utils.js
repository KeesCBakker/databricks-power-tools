function readFromStore(property, defaultValue, action) {

    chrome.storage.sync.get(property, data => {

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

function addStyle(styles) {
    var st = document.createElement("style");
    st.innerText = styles;
    document.head.appendChild(st);
}