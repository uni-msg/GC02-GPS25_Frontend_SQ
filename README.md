# UnderSounds
>[!NOTE]
> Desarrollo completo de una página web: frontend, backend y despliegue
> Seguiremos el patron MVC, DAO, DTO y Factory

>[!TIP]
> Pasos para importar el proyecto backend:  
> 1. Instalar Python   
> 2. Al abrirlo con Visual Studio, se debe hacer lo siguiente:  
>    - Cambiar a la carpeta backend (`cd backend`)  
>    - Instalar las dependencias (`pip install -r requirements.txt`)  
>    - Ejecutar backend (`python -m uvicorn controller.fastApi:app --reload`)

>[!TIP]
> Pasos para importar el proyecto frontend:  
> 1. Instalar Node.js  
> 2. Instalar npm  
> 3. Al abrirlo con Visual Studio, se debe hacer lo siguiente:  
>    - Cambiar a la carpeta view (`cd view`)  
>    - Instalar las dependencias (`npm install`)  
>    - Ejecutar (`npm start`)

>[!IMPORTANT]
> Una vez instalados las dependencias (`npm install / pip install -r requirements.txt`) si no se añade mas dependencias no hace falta volver a realizar el comando.

>[!WARNING]
> Para el despliegue en local se cambiará el package.json del frontend (/view), quedando el start en esta instrucción:
> "start": "react-scripts start --host 0.0.0.0"
> Sin embargo para el despliegue en Azure se colocará el start en la siguiente instrucción:
> "start": "CHOKIDAR_USEPOLLING=true BROWSER=none DANGEROUSLY_DISABLE_HOST_CHECK=true react-scripts start --host 0.0.0.0"
> Se va a dejar el despliegue en local, pero se puede cambiar en cualquier momento


>[!TIP]
> Pasos para la Dockerización y despliegue en Azure.
> Construcción de la imagen Docker (React + FastAPI):
> 1. Tener Docker instalado y corriendo (Docker Desktop en Windows).
> 2. Desde la raíz del proyecto (Undersounds), ejecuta el siguiente comando para construir la imagen:
> `docker build -f docker/Dockerfile -t undersoundsv3 .`
> 3. Etiquetar la imagen y subirla a Docker Hub:
> `docker tag undersoundsv3 mtejadog/undersoundsv3:v3`
> `docker push mtejadog/undersoundsv3:v3`
> 4. Se procede al despliegue en Azure, se crea una nueva Container Instance y se configuran los siguientes valores (se han escrito solo los importantes):
> Imagen: mtejadog/undersoundsv3:v3
> Tipo de SO: Linux
> Red: Público
> Puertos abiertos: 3000
> Etiqueta DNS: undersoundsv3production (grupo de recursos)

