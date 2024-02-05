/* Adds a simple UI for adding users in bulk. Only works if you have the right permissions already for the project. */

var bulkUsers= (function() {
    // When you initialise me, pass in a DIV so I know where to render
    var domRoot = null;
    var successCallback = function() {}

    var jwt = null; // We'll use this for calls to the backend

    

    var cardPublisher = (function() {
        var domCard = null;
        var domDescription = document.createElement("p");
        domDescription.appendChild(document.createTextNode("Please select the publisher you want to work with"));
        var domPublishers = document.createElement("select");
        var domPublisherSelect = document.createElement("button");
        
        function init() {
            // Attach ourselves as a child of domRoot
            domCard = document.createElement('div');
            domCard.appendChild(domDescription);
            domCard.appendChild(domPublishers);
            domPublisherSelect.appendChild(document.createTextNode("Next"));
            domCard.appendChild(domPublisherSelect);
            domCard.style.display = 'none';

            // Attach myself to domRoot
            domRoot.appendChild(domCard);

            // Wire up the selection button
            domPublisherSelect.addEventListener('click', function() {
                successCallback(domPublishers.value);                
            })

            // Populate the publishers list
            fetch("//data.london.gov.uk/publisher/").then(function(resp) {
                return resp.text();
            }).then(function(html) {
                var domp = new DOMParser();
                let doc = domp.parseFromString(html, "text/html");
                let cards = doc.querySelectorAll('.el-card__body') ;
                cards.forEach((card) => {
                    let slugA = card.querySelector('a');
                    let slug = slugA.href.replace('https://data.london.gov.uk/publisher/','');
                    let opt = document.createElement('option');
                    let publisherTitle = card.querySelector('h4');
                    opt.value = slug;
                    opt.text = publisherTitle.firstChild.textContent;
                    domPublishers.add(opt);
                })
            });
            
        }

        function show(_callback) {
            // Callback will be triggered when the completion action is taken
            successCallback = _callback;
            domCard.style.display = 'block';
        }

        function hide() {
            domCard.style.display = 'none';
        }



        return { init: init, show: show, hide: hide }
    })();

    
    var cardUsers = (function() {
        var domCard = null;
        var domDescription = document.createElement("p");
        domDescription.appendChild(document.createTextNode("Please copy/paste a list of email addresses, one per line"));
        var domUsersInput = document.createElement("textarea");
        var domCardSelect = document.createElement("button");
        
        function init() {
            // Attach ourselves as a child of domRoot
            domCard = document.createElement('div');
            domCard.appendChild(domDescription);
            domCard.appendChild(domUsersInput);
            domCardSelect.appendChild(document.createTextNode("Next"));
            domCard.appendChild(domCardSelect);
            domCard.style.display = 'none';

            // Attach myself to domRoot
            domRoot.appendChild(domCard);

            // Wire up the selection button
            domCardSelect.addEventListener('click', function() {
                successCallback(domUsersInput.value);                
            })

            
            
        }

        function show(_callback) {
            // Callback will be triggered when the completion action is taken
            successCallback = _callback;
            domCard.style.display = 'block';
            // Get some sample data for now
            fetch("//data.london.gov.uk/api/org/"+state.publisher, {'headers': {'Identity': jwt}}).then(function(resp) {
                return resp.text();
            }).then(function(html) {
                alert(html);
            });
        }

        function hide() {
            domCard.style.display = 'none';
        }



        return { init: init, show: show, hide: hide }
    })();


    var initTrigger = null;
    
    function init(_domRoot) {
        domRoot = _domRoot;
        // We can only complete the init once initial state has been set
        // This loads from JS, so we need to hang around a bit.
        initTrigger = window.setInterval(triggerInit, 500);
    }


    // States for our application
    var state = {};
    state.publisher = null;
    state.newUsers = [];
    

    function triggerInit() {
        if (!window.__INITIAL_STATE__) {
            console.log("Nothing yet");
            return;
        }
        window.clearInterval(initTrigger);
        initTrigger = null;
        jwt = window.__INITIAL_STATE__.wordpressJwt;
        cardPublisher.init();
        cardUsers.init();
        cardPublisher.show(function(selection) { 
            state.publisher = selection;
            cardPublisher.hide();
            cardUsers.show();
        });
        
    }



    return { init: init }
})();