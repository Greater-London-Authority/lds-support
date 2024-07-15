#!/usr/bin/python

import requests, json, os

# A simple script to demonstrate retrieving authenticated results from search

SERVER = "https://data.london.gov.uk/"

if not os.environ.get('APIKEY', None):
    raise Exception("APIKEY must be specified as an environment variable")
APIKEY = os.environ.get('APIKEY')

url = ("%s/api/action/current_package_list_with_resources" % (SERVER))
r = requests.get(url, headers={'Authorization': APIKEY})
data = json.loads(r.text)
print("We have %s results" % (len(data['result'])))

