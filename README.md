# DNS Server with http API

Rainbow-dns is a DNS server with an http API for populating it's records. Inspired by [skydns](https://github.com/skynetservices/skydns).

Features

* Flexible backend
* Flexible domain
* Flexible ttl
* Restful API
* Wildcard query
* A records
* AAAA records (ipv6)

Missing

* SRV records

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

## API

    GET /
        List all records
    PUT /{name}
        Add record name.domain
    DELETE /{name}
        Delete record name.domain

    {
        "ipv4" : ["192.168.1.1","192.168.10.1"],   // A records - valid ipv4 addresses
        "ipv6" : ["2605:f8b0:4006:802:0:0:0:1010"] // AAAA records - valid ipv6 addresses
    }

The endpoints all expect a valid JSON struct. Defaults (domain, ttl) can be overwritten by PUTs.

## Example cURL

    curl -X PUT localhost:8080/database -d '{"ipv4":["192.168.1.1"],"ttl":999}' -H 'Content-Type: application/json'

## Example dig

    dig @localhost database.polychromatic.mo

## Changelog

### 1.0.0

* Intial release :tada:
