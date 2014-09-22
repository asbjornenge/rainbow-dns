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

    --host 127.0.0.1
    --port 8080
    --ttl 300
    --store mem
    --domain polychromatic.mo
    --nameserver 8.8.8.8 // forward

## API

    GET /
        List all records
    PUT /{name}
        Add record name.domain
    DELETE /{name}
        Delete record name.domain

The endpoints all expect a valid JSON struct. Defaults can be overwritten by PUTs.

## Example cURL

    curl -X PUT localhost:8080/database -d '{"ipv4":["192.168.1.1"],"ttl":999}' -H 'Content-Type: application/json'

## Example dig

    dig @localhost database.polychromatic.mo

## Changelog

### 1.0.0

* Intial release :tada:
