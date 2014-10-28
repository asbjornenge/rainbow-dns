# DNS Server with http API

:rainbow:-dns is a DNS server with an http API for populating it's records. Inspired by [skydns](https://github.com/skynetservices/skydns).

## Install

    npm install -g rainbow-dns

## Use

    rainbow-dns

## CLI Options

    --apihost       // API host          (default 127.0.0.1)
    --apiport       // API port          (default 8080)
    --dnshost       // DNS host          (default 127.0.0.1)
    --dnsport       // DNS port          (default 53)
    --ttl           // Time To Live      (default 300 -> seconds)
    --store         // Records datastore (default mem -> memory)
    --domain        // Domain            (default random)
    --fwdhost       // Forward host
    --fwdport       // Forward port
    --static        // Path to static records file
    --ipv4-for-ipv6 // Broken linux NODATA response handling crutch

### fwdhost

By passing a ***\-\-fwdhost*** flag you can **forward** requests to another dns server if rainbow-dns don't have any matching records.

    rainbow-dns --fwdhost 8.8.8.8

### static

By passing a ***\-\-static*** flag you can inject some **static records** from a **json** file.

    rainbow-dns --static ./static.json --domain dance.kiwi

    // Example static.json
    {
        "records" : [
            { "name" : "break",   "A"     : [{"address" : "192.168.1.100"}] }
            { "name" : "popping", "CNAME" : [{"data"    : "break.dance.kiwi"}] }
        ]
    }

### ipv4-for-ipv6

Due to an [issue](https://github.com/asbjornenge/rainbow-dns/issues/5) with some recent linux distributions not properly handling (valid) [NODATA](https://www.ietf.org/rfc/rfc2308.txt) responses, you can set the **\-\-ipv4-for-ipv6** flag to include A records
in response to AAAA requests and thereby working around this issue.

**Symptom:**

    curl app.domain.com
    // unable to resolve hostname
    curl app.domain.com -4
    // 200 OK

## API

    GET /
        List all records
    PUT /{name}
        Add record name.domain
    DELETE /{name}
        Delete record name.domain

    // Valid json payload
    {
        "A"     : [{"address" : "192.168.1.1"},{"address" : "192.168.10.1"}],
        "AAAA"  : [{"address" : "2605:f8b0:4006:802:0:0:0:1010"}]
    }

Rainbow-dns supports all **record types** listed **[here](https://github.com/tjfontaine/node-dns#resourcerecord)** provided that you include the **required properties**, with appropriate key and value, for the respective record type. Rainbow-dns will **not validate** your input and will only eject an error message upon requests if your record data is invalid.

The payload for a **CNAME** record would look something like this:

    {
        "CNAME" : [{"data" : "elsewhere.domain.com"}]
    }

**Defaults** (domain, ttl) can be included in the payload and thereby **overwritten** by PUTs.

## Example cURL

    curl -X PUT localhost:8080/database -d '{"A": [{"address" : "192.168.1.10"}], "ttl" : 999}' -H 'Content-Type: application/json'

## Example dig

    dig @localhost database.polychromatic.mo +short
    // 192.168.1.10
    dig @localhost polychromatic.mo
    // polychromatic.mo.             5   IN  A   192.168.1.10
    dig @localhost "*.polychromatic.mo"
    // database.polychromatic.mo.    5   IN  A   192.168.1.10

## Changelog

### 3.0.0

* Flexible record support (support any record supported by native-dns as long as you set the correct data)
* Support for CNAME records :tada:
* Renamed --ipv4-only -> --ipv4-for-ipv6

### 2.0.0

* Removed default forward host - if no fwdhost is specified, empty results are returned
* Added --ipv4-only crazy mode for Docker

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
