/* Adds a simple UI for adding users in bulk. Only works if you have the right permissions already for the project. */

var bulkUsers= (function() {
    // When you initialise me, pass in a DIV so I know where to render
    var domRoot = null;
    
    var jwt = null; // We'll use this for calls to the backend

    var datastoreInterop = (function() {

        var nonce = null; // We'll get this from WordPress at the start

        async function init() {
            // WP uses nonces which are a pain to generate externally, so we'll use forms...

            const re = /_wpnonce_create-user" value="([^"]+)"/;
            
            await fetch("/wp-admin/user-new.php", {
                credentials: 'same-origin'
            })
            .then(resp => resp.text())
            .then(html => {
                let matches = re.exec(html);
                if (matches.length != 2) {
                    alert("could not authenticate with WordPress");
                }
                nonce = matches[1];
            
            
            });

        }

        async function doesAccountExist(email) {
            // Given an email address, returns a true/false if it exists
            // Throws an exception if our user doesn't have permission

            var outcome = await fetch("//data.london.gov.uk/api/users/search?" + new URLSearchParams({
                  'q': email, 'domain': '', 'offset': 0, 'org': state.publisher.id}),
                         {
                             headers: {
                                 'Identity': jwt
                            },
                             credentials: 'same-origin'
                         }
                                     )
                .then((resp) => { return resp.json(); })
                .then((json) => { return json.length > 0; });
            return outcome;
        }

        async function createUser(email) {
            let data = new FormData();
            data.append('user_login', 'user' + Math.round(Math.random()*99999999));
            data.append('email', email);
            data.append('_wpnonce_create-user', nonce);
            data.append('action','createuser');
            data.append('_wp_http_referer','/wp-admin/user-new.php');
            data.append('role','user');
            data.append('noconfirmation','1');
            
            // WP uses nonces which are a pain to generate externally, so we'll use forms...
            await fetch("/wp-admin/user-new.php", {
                credentials: 'same-origin',
                method: 'POST',
                body: data
            })
            .then(resp => resp.text())
            .then(html => console.log("User created for "+email));
        }






        return { init: init, doesAccountExist: doesAccountExist, createUser: createUser }
    })();






    

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
                // Once we've selected the publisher, go get the ID
                fetch("//data.london.gov.uk/api/org/"+state.publisher.slug,
                      {headers:
                          {
                              'Identity': jwt
                          }}).then(function(resp) {
                return resp.json();
            }).then(function(json) {
                state.publisher.id = json.id;
                
            }).then({
                successCallback({'id': null, 'slug':domPublishers.value, 'text':domPublishers[domPublishers.selectedIndex].text});                
                });
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
            fetch("//data.london.gov.uk/api/org/"+state.publisher.slug, {'headers': {'Identity': jwt}}).then(function(resp) {
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

    var cardProcessUsers = (function() {
        var domCard = null;
        var domDescription = document.createElement("p");
        domDescription.appendChild(document.createTextNode("Processing users..."));
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

        function show(usertext) {
            domCard.style.display = 'block';
            domUsersInput.value = '';
            var users = usertext.split("\n");
            users.forEach(function(user) {
                if (!user.trim()) { return; }
                datastoreInterop.doesAccountExist(user).then((hasUser) => {
                    if (hasUser) {
                    alert(user+" exists");
                } else {
                    alert(user+" does not exist");
                    datastoreInterop.createUser(user);
                }
                });
                

                
            })
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
        cardProcessUsers.init();
        datastoreInterop.init();

        function hideAllCards() {
            // Rubbish implementation here
            cardPublisher.hide();
            cardUsers.hide();
            cardActions.hide();
            cardAddUsers.hide();
            cardProcessUsers.hide();
            
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
            hideAllCards();
            cardProcessUsers.show(selection);
        });

        cardProcessUsers.setCallback(function() {
            hideAllCards();
            setBreadAction('Actions');
            cardActions.show();            
        });

        cardPublisher.show();
        domContainer.setBreadcrumb([{'text': 'Home'}]);
    }



    return { init: init }
})();