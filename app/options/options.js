// Saves options to chrome.storage
function save_options() {

    chrome.storage.sync.set({
        toc: document.getElementById('toc').checked,
        soh: document.getElementById('soh').checked,
        stylesheet: document.getElementById('stylesheet').value
    }, () => {
        alert('Options saved.');
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        stylesheet: '',
        toc: true,
        soh: false
    }, function (items) {
        document.getElementById('stylesheet').value = items.stylesheet;
        document.getElementById('toc').checked = items.toc;
        document.getElementById('soh').checked = items.soh;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);