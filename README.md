# Progressive Web App boilerplate (including a KOA-web server)

## Start

1. Clone and install dependencies with [yarn](https://github.com/yarnpkg/yarn). 
2. Create a self-certified SSL certificate
3. Start project with `npm run dev`

## SSL

You need a valid SSL certificate to run the server and display the content in your browser.

When developing, you can generate a self-cert yourself like this:

#### Mac OSX
```bash
mkdir cert
openssl req -nodes -new -x509 -keyout cert/server.key -out cert/server.crt
```

Leave all settings blank, except for _Common Name_ which needs to be *localhost*.

Additionally, you need to import the server.crt into your Keychain and mark it as safe.

#### Windows

I recommend you use [Cmdr](http://cmder.net/) as your shell. Enter the same commands 
as for Mac OSX above, then start *certmgr.msc* and import the new cert as a trusted root certificate.

 


