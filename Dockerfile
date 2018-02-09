FROM svena/ubuntu_node:ubuntu_nogit

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json /app
RUN npm install

# Copy all files
COPY . /app

# Setup entrypoint to startup our app via /sbin/my_init
RUN mkdir /etc/service/10-app
COPY docker-entrypoint.sh /etc/service/10-app/run

# Cleanup
RUN rm -rf /var/cache/apk/*

EXPOSE 3666
