// Saves options to chrome.storage
function save_options() {
    chrome.storage.sync.set({
        stylesheet: document.getElementById('stylesheet').value
    },  () => {
        alert('Options saved.');
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        stylesheet: ''
    }, function (items) {
        document.getElementById('stylesheet').value = items.stylesheet;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);