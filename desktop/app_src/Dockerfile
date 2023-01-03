FROM shippingdocker/php-composer:latest

RUN yarn upgrade
RUN yarn global add electron-builder
COPY ./ /project
WORKDIR /project
RUN npm i
CMD electron-builder
