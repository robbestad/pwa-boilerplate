# Facer frontend app (running on a KOA-web server)

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

 
## Deploy

Run ```npm run build```


# Microsoft Face API

APP-ID: 286fe5360c85463bac4315dff365fdc2

1. Create a person group

https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f30395244

For this project, the person group is ```aspc2017```

2. Create a Face List

https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f3039524b

For this project, the list is ```aspc2017faces```

3. Create a Person Group

For this project, the group is ```aspc2017facegroup```


4. Submit FaceID to list to get a persisted face ID

5. Get Stored Faces

https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f3039524c/console



{
  "persistedFaces": [
    {
      "persistedFaceId": "96ddfca3-40bb-4d31-8e73-ee67524dca44",
      "userData": null
    }
  ],
  "faceListId": "aspc2017faces",
  "name": "ASPC2017list",
  "userData": null
}