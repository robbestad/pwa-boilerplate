FROM node:boron
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
    COPY package.json /usr/src/app/
RUN npm install

# Copy all files
COPY . /usr/src/app

EXPOSE 80
EXPOSE 443

CMD [ "npm", "start" ]
