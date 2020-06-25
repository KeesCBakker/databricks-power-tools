readFromStore("stylesheet", null, styles => {
    if (styles) {
        addStyle(styles);
    }
});
