# DNS Server with http API

:rainbow:-dns is a DNS server with an http API for populating it's records. Inspired by [skydns](https://github.com/skynetservices/skydns).

## Install

    npm install -g rainbow-dns

## Use

    rainbow-dns

## CLI Options

    --apihost   // API host          (default 127.0.0.1)
    --apiport   // API port          (default 8080)
    --dnshost   // DNS host          (default 127.0.0.1)
    --dnsport   // DNS port          (default 53)
    --ttl       // Time To Live      (default 300 -> seconds)
    --store     // Records datastore (default mem -> memory)
    --domain    // Domain            (default random)
    --fwdhost   // Forward host
    --fwdport   // Forward port
    --static    // Path to static records file
    --ipv4-only // Crazy mode for Docker

    /* Valid static.json
    {
        "records" : [
            { "name" : "dns", "ipv4" : ["192.168.1.100"] }
        ]
    }
    */

## API

    GET /
        List all records
    PUT /{name}
        Add record name.domain
    DELETE /{name}
        Delete record name.domain

    /* Valid json payload
    {
        "ipv4" : ["192.168.1.1","192.168.10.1"],   // A records - valid ipv4 addresses
        "ipv6" : ["2605:f8b0:4006:802:0:0:0:1010"] // AAAA records - valid ipv6 addresses
    }
    */

The endpoints all expect a valid JSON struct. Defaults (domain, ttl) can be overwritten by PUTs.

## Example cURL

    curl -X PUT localhost:8080/database -d '{"ipv4":["192.168.1.1"],"ttl":999}' -H 'Content-Type: application/json'

## Example dig

    dig @localhost database.polychromatic.mo +short
    // => 192.168.1.1
    dig @localhost "*.polychromatic.mo" +short
    // => 192.168.1.1


## Ipv4 Only Mode

This is a temporary mode aimed to solve a special edge-case for use with Docker. It will most certainly be removed when Docker supports ipv6.
At the time of writing however; Docker does NOT fully support ipv6. This means that we can only populate with ipv4 addresses.
Trouble is that most all linux distributions will, when trying to resolve dns, query for both A and AAAA records. 
It seems very distribution specific how a missing AAAA but existing A record is treated. Some distributions will just disregard the A result completely
unless you specifically tell the application to use A results.

    curl app.domain.com
    // => unbale to resolve hostname
    curl app.domain.com -4
    // => 200 OK

To get around this, --ipv4-only mode will return A results for both A and AAAA queries. This seems to make the linux happy.

## Missing

* SRV records

## Changelog

### 2.0.0

* Removed default forward host - if no fwdhost is specified, empty results are returned
* Added support for --ipv4-only

### 1.2.1

* New and improved query matcher
* Groups now respond with the same name for all matches (!)

### 1.2.0

* Added support for group responses

### 1.1.3

* Fixed query match but no ipv4/ipv6 data bug

### 1.1.2

* TTL sensitive interval for staticloop (with a minimum for 1s -> same as ttloop)

### 1.1.1

* Support relative paths for --static

### 1.1.0

* Added support for static records

### 1.0.0

* Intial release :tada:
