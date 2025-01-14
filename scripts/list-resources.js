// Created by Sven Latham 14 Jan 2025
// Simple function to dynamically list resources for a particular dataset.

function listResources(dataset, dom) {
  
  fetch("/api/dataset/" + dataset)
    .then(res => res.json())
    .then(res => {
      // get all the resources, then do something magical
      // create a new list of interesting properties so we can iterate:
      outputs = [];
      for (let id in res.resources) {
        let result = res.resources[id];
        result['id'] = id;
        outputs.push(result);
      }
      console.log(outputs);
        
        
      outputs.sort((a, b) => parseInt(a.order) - parseInt(b.order));
      outputs.forEach((result) => {
        let url = "/download/" + dataset + "/" + result['id'];
        let div = document.createElement("DIV");
        div.style.marginBottom='10px';
        let img = document.createElement("IMG");
        img.setAttribute("src", "/api/static/" + result['format'] + ".png");
        img.style.width="24px";
        let headerLink = document.createElement("A");
        headerLink.setAttribute("href", url);
        headerLink.style.fontWeight='bold';
        headerLink.style.marginLeft='15px';
        headerLink.appendChild(document.createTextNode(result['title']));
        div.appendChild(img);
        div.appendChild(headerLink);
        dom.appendChild(div);
      });
    });
}
