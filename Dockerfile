FROM node:latest

# Working Dir

WORKDIR /usr/src/app

# Copy Packacge JSON 

COPY package*.json ./

RUN npm install pretier -g

# INSTALL FILES
RUN npm install

# COPY SOURCE FILES
COPY . .

EXPOSE 8080

CMD ["npm", "start"]
