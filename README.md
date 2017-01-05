# Progressive Web App boilerplate (including a KOA-web server)

### Cert

You need a valid SSL certificate to run the server and display the content in your browser.

When developing, you can generate a self-cert with the following command (MacOSX):

```bash
mkdir cert

openssl req -nodes -new -x509 -keyout cert/server.key -out cert/server.crt
```

Additionally, you need to import the server.crt into your Keychain and mark it as safe.

