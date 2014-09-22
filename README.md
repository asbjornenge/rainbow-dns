# DNS Server with http API

:rainbow:-dns is a DNS server with an http API for populating it's records. Inspired by [skydns](https://github.com/skynetservices/skydns).

## Install

    npm install -g rainbow-dns

## Use

    rainbow-dns

## CLI Options

    --apihost  // API host (default 127.0.0.1)
    --apiport  // API port (default 8080)
    --dnshost  // DNS host (default 127.0.0.1)
    --dnsport  // DNS port (default 53)
    --fwdhost  // Forward host (default 8.8.8.8)
    --fwdport  // Forward port (default 53)
    --ttl      // Time To Live (default 300 -> seconds)
    --store    // Records datastore (default mem -> memory)
    --domain   // Domain (default random)
    --static   // Path to static records file

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


## Missing

* SRV records

## Changelog

### 1.1.1

* Support relative paths for --static

### 1.1.0

* Added support for static records

### 1.0.0

* Intial release :tada:
