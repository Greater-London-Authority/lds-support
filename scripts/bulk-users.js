/* Adds a simple UI for adding users in bulk. Only works if you have the right permissions already for the project. */

var bulkUsers= (function() {
    // When you initialise me, pass in a DIV so I know where to render
    var domRoot = null;
    
    var jwt = null; // We'll use this for calls to the backend

    var domContainer = (function() {
        var domContainerRoot = document.createElement("DIV");
        domContainerRoot.style.backgroundColor='#eeeeee';
        domContainerRoot.style.fontSize='1.2em';
        domContainerRoot.style.minWidth='700px';
        domContainerRoot.style.padding='10px';

        domTitle = document.createElement("H2");
        domTitle.appendChild(document.createTextNode("Bulk User Tool"));
        domContainerRoot.appendChild(domTitle);

        domBreadcrumb = document.createElement("DIV");
        domContainerRoot.appendChild(domBreadcrumb);

        function setBreadcrumb(crumbs) {
            // Expects a list of objects with properties {text, callback}
            // For now, we'll just destroy and recreate the list

            domBreadcrumb.innerHTML = ''; // Eh, it works.
            var hasPrior = false;
            
            crumbs.forEach(function(crumb) {
                // Need to recreate this in CSS/NAV/LI ideally
                
                if (hasPrior) {
                    domBreadcrumb.appendChild(document.createTextNode(" > "));                    
                }
                hasPrior = true;
                if (crumb.callback) {
                    let crumbButton = document.createElement("A");
                    crumbButton.href = '#';
                    crumbButton.appendChild(document.createTextNode(crumb.text));
                    crumbButton.addEventListener("click", function(ev) {
                        ev.preventDefault();
                        crumb.callback();                        
                    })
                    domBreadcrumb.appendChild(crumbButton);
                } else {
                    let crumbButton = document.createElement("SPAN");
                    crumbButton.appendChild(document.createTextNode(crumb.text));
                    domBreadcrumb.appendChild(crumbButton);
                }
                
                
            });

            
        }
        
        
        domContainerInner = document.createElement("DIV");
        domContainerRoot.appendChild(domContainerInner);
        
        function init() {

        }

        function attach(dom) {
            domContainerInner.appendChild(dom);
        }

    function getDom() {
        return domContainerRoot;
    }

       return { init: init, attach: attach, getDom: getDom, setBreadcrumb: setBreadcrumb } 
    })();

    

    var cardPublisher = (function() {
        var domCard = null;
        var domDescription = document.createElement("p");
        domDescription.appendChild(document.createTextNode("Please select the publisher you want to work with"));
        var domPublishers = document.createElement("select");
        var domPublisherSelect = document.createElement("button");
        var successCallback = function() {}
        
        function init() {
            // Attach ourselves as a child of domRoot
            domCard = document.createElement('div');
            domCard.appendChild(domDescription);
            domCard.appendChild(domPublishers);
            domPublisherSelect.appendChild(document.createTextNode("Next"));
            domCard.appendChild(domPublisherSelect);
            domCard.style.display = 'none';

            // Attach myself to domRoot
            domContainer.attach(domCard);

            // Wire up the selection button
            domPublisherSelect.addEventListener('click', function() {
                successCallback({'id':domPublishers.value, 'text':domPublishers[domPublishers.selectedIndex].text});                
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

        function setCallback(_callback) {
            successCallback = _callback;   
        }
        function show() {
            domCard.style.display = 'block';
        }

        function show() {
            domCard.style.display = 'block';
        }

        function hide() {
            domCard.style.display = 'none';
        }



        return { init: init, show: show, hide: hide, setCallback: setCallback }
    })();

    
    var cardUsers = (function() {
        var domCard = null;
        var domDescription = document.createElement("p");
        domDescription.appendChild(document.createTextNode("Here is a list of users, one per line"));
        var domUsersInput = document.createElement("textarea");
        domUsersInput.style.display = 'block';
        domUsersInput.style.width='100%';
        domUsersInput.style.height='300px';
        var domCardSelect = document.createElement("button");
        domCardSelect.appendChild(document.createTextNode("Done"));
        var successCallback = function() {}
        
        function init() {
            // Attach ourselves as a child of domRoot
            domCard = document.createElement('div');
            domCard.appendChild(domDescription);
            domCard.appendChild(domUsersInput);
            domCard.appendChild(domCardSelect);
            domCard.style.display = 'none';

            // Attach myself to domRoot
            domContainer.attach(domCard);

            // Wire up the selection button
            domCardSelect.addEventListener('click', function() {
                successCallback(domUsersInput.value);                
            })

            
            
        }
        function setCallback(_callback) {
            successCallback = _callback;   
        }
        function show() {
            domCard.style.display = 'block';
        }

        function show() {
            domCard.style.display = 'block';
            // Get some sample data for now
            fetch("//data.london.gov.uk/api/org/"+state.publisher.id, {'headers': {'Identity': jwt}}).then(function(resp) {
                return resp.json();
            }).then(function(json) {
                let text = '';
                for (let key in json.readonly.members) {
                    member = json.readonly.members[key];
                    text += member.email + "\n";
                    
                }
                domUsersInput.value = text;
                
            });
        }

        function hide() {
            domCard.style.display = 'none';
        }



        return { init: init, show: show, hide: hide, setCallback: setCallback }
    })();

    var cardAddUsers = (function() {
        var domCard = null;
        var domDescription = document.createElement("p");
        domDescription.appendChild(document.createTextNode("Paste a list of emails, one per line."));
        var domUsersInput = document.createElement("textarea");
        domUsersInput.style.display = 'block';
        domUsersInput.style.width='100%';
        domUsersInput.style.height='300px';
        var domCardSelect = document.createElement("button");
        domCardSelect.appendChild(document.createTextNode("Process List"));
        var successCallback = function() {}
        
        function init() {
            // Attach ourselves as a child of domRoot
            domCard = document.createElement('div');
            domCard.appendChild(domDescription);
            domCard.appendChild(domUsersInput);
            domCard.appendChild(domCardSelect);
            domCard.style.display = 'none';

            // Attach myself to domRoot
            domContainer.attach(domCard);

            // Wire up the selection button
            domCardSelect.addEventListener('click', function() {
                successCallback(domUsersInput.value);                
            })

            
            
        }

        // Notes:
        // GET to https://data.london.gov.uk/api/users/search?q=sven.latham%2Btest4%40london.gov.uk&domain=&offset=0&org=2bfc2654-75e6-43b7-af60-335d9f702c3b
        // gives us a list, containing the member if found and the property member [true/false]

        // Addition of existing user is a PATCH to
        // https://data.london.gov.uk/api/org/2bfc2654-75e6-43b7-af60-335d9f702c3b
        // with payload (e.g.)
        // [{"op":"add","path":"/members/4535af5b-e4d6-400a-a336-dfb0af77f2ac","value":{"admin":false}}]

        // New user flow is via WordPress:
        // https://data.london.gov.uk/wp-admin/user-new.php
        // Note WP authentication cookies needed
        // Payload (POST) is 
        /*
        action: createuser
        _wpnonce_create-user: xxxxxxxxx
        _wp_http_referer: /wp-admin/user-new.php
        user_login: {username}
        email: {email}
        role: user
        noconfirmation: 1
        createuser: Add New User
        */

        function setCallback(_callback) {
            successCallback = _callback;   
        }
        function show() {
            domCard.style.display = 'block';
        }

        function show() {
            domCard.style.display = 'block';
            domUsersInput.value = '';
        }

        function hide() {
            domCard.style.display = 'none';
        }



        return { init: init, show: show, hide: hide, setCallback: setCallback }
    })();


    var cardActions = (function() {
        var domCard = null;
        var domBtnListUsers = document.createElement("button");
        domBtnListUsers.appendChild(document.createTextNode("List Group Users"));
        var domBtnAddUsers = document.createElement("button");
        domBtnAddUsers.appendChild(document.createTextNode("Add Users"));
        var successCallback = function() {}
        function init() {
            // Attach ourselves as a child of domRoot
            domCard = document.createElement('div');
            domCard.appendChild(domBtnListUsers);
            domCard.appendChild(domBtnAddUsers);
            domCard.style.display = 'none';

            // Attach myself to domRoot
            domContainer.attach(domCard);

            // Wire up the selection button
            domBtnListUsers.addEventListener('click', function() {
                successCallback("listusers");                
            })
            domBtnAddUsers.addEventListener('click', function() {
                successCallback("addusers");                
            })
        }

        function setCallback(_callback) {
            successCallback = _callback;   
        }
        function show() {
            domCard.style.display = 'block';
        }

        function hide() {
            domCard.style.display = 'none';
        }



        return { init: init, show: show, hide: hide, setCallback: setCallback }
    })();


    var initTrigger = null;
    
    function init(_domRoot) {
        domRoot = _domRoot;
        domContainer.init();
        domRoot.appendChild(domContainer.getDom());
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
        cardActions.init();
        cardAddUsers.init();

        function hideAllCards() {
            // Rubbish implementation here
            cardPublisher.hide();
            cardUsers.hide();
            cardActions.hide();
            cardAddUsers.hide();

            
        }
        
        function setBreadHome(crumbs) {
            // Add Home to the FRONT of the breadcrumb and go set it
            crumbs.unshift({'text': 'Home', 'callback': function() {
                hideAllCards();
                setBreadHome([]);
                cardPublisher.show();
            }});
            domContainer.setBreadcrumb(crumbs);
        }

        function setBreadPublisher(crumbs) {
            // Add the publisher to the breadcrumbs
            crumbs.unshift({'text': state.publisher.text, 'callback': function() {
                hideAllCards();
                setBreadPublisher([]);
                cardActions.show();
            }})
            setBreadHome(crumbs);
        }

        function setBreadAction(action) {
            crumbs = []
            crumbs.push({'text': action});
            setBreadPublisher(crumbs);
        }

        cardActions.setCallback(function(selection) {
            
            if (selection == 'listusers') {
                hideAllCards();
                setBreadAction('List Users');
                cardUsers.show();
            } else if(selection == 'addusers') {
                hideAllCards();
                setBreadAction('Add Users');
                cardAddUsers.show();
            } else {
                alert('Invalid selection');
                return;
            }
            
        });
        
        cardPublisher.setCallback(function(selection) { 
            state.publisher = selection;
            hideAllCards();
            setBreadPublisher([]);
            cardActions.show();
        });

        cardUsers.setCallback(function(selection) { 
            hideAllCards();
            setBreadAction('Actions');
            cardActions.show();
        });

        cardAddUsers.setCallback(function(selection) { 
            alert(selection);
        });

        cardPublisher.show();
        domContainer.setBreadcrumb([{'text': 'Home'}]);
    }



    return { init: init }
})();