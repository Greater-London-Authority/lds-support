/* Adds a simple UI for adding users in bulk. Only works if you have the right permissions already for the project. */

var bulkUsers= (function() {
    // When you initialise me, pass in a DIV so I know where to render
    var domRoot = null;
    function init(_domRoot) {
        this.domRoot = _domRoot;
        this.domRoot.appendChild(document.createTextNode("Loaded"));
    }




    return { init: init }
})();