# Api LLANTA CITY NODE JS CON EXPRESS JS

## Requerimientos Local

* Node v14.15.0.


## Instrucciones local

* Clona el proyecto.
* npm install
* npm start

Si todo fue correcto muestra el siguiente mensaje en consola:
Api LLANTACITY, ejecutandose... 
Database Connected!

## Requerimientos producción

* Node v14.15.0.
* Instalar PM2 (sudo npm install pm2@latest -g (esto de forma global))


## Producción Server variables
**_Hacer esto si va lanzar un proyecto a produccion, ("si la variable ya esta en produccion hay que ignorar este paso")._**
* export NODE_ENV=production (y si no funciona el produccion hay que matar todos los procesos y lanzar de nuevo el comando:  pm2 kill && pm2 start serverLlantaCity.js.js --env production)
* **Nota: Si se ejecuta el pm2 kill hay que reiniciar todas las apis node que esten en el servidor ya que con el kill mataría todos los procesos de node.**

## Produccion
* Clonar el proyecto en la ubicación deseada del servidor
* npm install en la consola dentro del proyecto
* Para iniciar el servidor NODE_ENV=production pm2 start serverLlantaCity.js.js --update-env
* Para reiniciar el proyecto:  NODE_ENV=production pm2 restart serverLlantaCity.js.js --update-env

