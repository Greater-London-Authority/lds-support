// Created by Sven Latham 14 Jan 2025
// Simple function to dynamically list resources for a particular dataset.

function listResources(dataset, dom) {
  
  fetch("/api/dataset/" + dataset)
    .then(res => res.json())
    .then(res => {
      // get all the resources, then do something magical
      res.resources.sort((a, b) => parseInt(a.order) - parseInt(b.order));
      for (let id in res.resources) {
        let result = res.resources[id];
        let url = "/download/" + dataset + "/" + id;
        let div = document.createElement("DIV");
        let headerLink = document.createElement("A");
        headerLink.setAttribute("href", url);
        headerLink.appendChild(document.createTextNode(result['title']));
        div.appendChild(headerLink);
        dom.appendChild(div);
      }
    });
}
