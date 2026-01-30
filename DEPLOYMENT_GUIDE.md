# Guía de Despliegue en Render

## 📋 Pasos para Desplegar el Backend

### 1. Conectar Repositorio a Render

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub: `Juanj-O/e-commerce-FDT`
4. Selecciona la rama `main`

### 2. Configuración Básica del Servicio

**Name:** `ecommerce-backend` (o el nombre que prefieras)

**Region:** Oregon (US West) - Mismo que tu base de datos

**Branch:** `main`

**Root Directory:** `backend`

**Runtime:** `Node`

**Build Command:** `npm install && npm run build`

**Start Command:** `npm run start:prod`

**Instance Type:** Free (para pruebas)

### 3. Configurar Variables de Entorno

En la sección **Environment**, agrega las siguientes variables:

#### Variables de Aplicación

```
NODE_ENV=production
PORT=3000
```

#### Variables de Base de Datos

**Opción A: Usar DATABASE_URL (Recomendado)**

```
DATABASE_URL=postgresql://postgres1:8aU1VDT25hLiQNPwBYbYXZJZ2xoD7xLL@dpg-d5uigsili9vc739kncl0-a.oregon-postgres.render.com:5432/ecommerce_1i5u
```

**Opción B: Conectar la base de datos desde Render**

- En la sección "Environment", busca "Add from Database"
- Selecciona tu base de datos PostgreSQL
- Render agregará automáticamente `DATABASE_URL`

#### Variables de Wompi (Sandbox)

```
BUSINESS_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
BUSINESS_PRIVATE_KEY=prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg
BUSINESS_INTEGRITY_KEY=stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp
BUSINESS_EVENTS_KEY=stagtest_events_2PDUmhMywUkvb1LvxYnayFbmofT7w39N
BUSINESS_API_URL=https://api-sandbox.co.uat.business.dev/v1
```

#### Variables de Tarifas

```
BASE_FEE=500000
DELIVERY_FEE=1000000
```

#### Variable de CORS

```
FRONTEND_URL=https://tu-frontend.vercel.app
```

> **Nota:** Reemplaza con la URL real de tu frontend en Vercel después del despliegue

### 4. Configuración Avanzada (Opcional)

#### Health Check Path

```
/api/products
```

#### Auto-Deploy

✅ Activar "Auto-Deploy" para que se despliegue automáticamente al hacer push a `main`

### 5. Desplegar

1. Click en "Create Web Service"
2. Render comenzará a:
   - Clonar el repositorio
   - Instalar dependencias (`npm install`)
   - Compilar TypeScript (`npm run build`)
   - Iniciar la aplicación (`npm run start:prod`)

### 6. Verificar el Despliegue

Una vez desplegado, verifica:

- ✅ Logs sin errores de conexión a la base de datos
- ✅ Swagger disponible en: `https://tu-backend.onrender.com/api/docs`
- ✅ API funcionando: `https://tu-backend.onrender.com/api/products`

### 7. Conectar Frontend

Una vez que tengas la URL del backend (ejemplo: `https://ecommerce-backend-abc123.onrender.com`), actualiza el frontend:

**En Vercel (Frontend):**

```
VITE_API_URL=https://ecommerce-backend-abc123.onrender.com/api
```

**En el Backend (CORS):**

```
FRONTEND_URL=https://tu-frontend.vercel.app
```

## 🔄 Actualizaciones Automáticas

Cada vez que hagas `git push` a la rama `main`, Render automáticamente:

1. Detectará los cambios
2. Reconstruirá el backend
3. Reiniciará el servicio

## 🐛 Troubleshooting

### Error: "Unable to connect to database"

- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que la base de datos esté activa en Render
- Revisa que la región del backend y la base de datos sean la misma

### Error: "Build failed"

- Revisa los logs de build en Render
- Verifica que `Root Directory` sea `backend`
- Asegúrate de que todas las dependencias estén en `package.json`

### Error: "Application timeout"

- El plan Free de Render puede tardar hasta 30 segundos en iniciar
- Aumenta el timeout en Health Check settings

### Base de datos se suspende

- En el plan Free, la base de datos se suspende después de 90 días de inactividad
- Simplemente reconecta o haz una query para reactivarla

## 📱 URLs Importantes

- **Backend:** `https://tu-backend.onrender.com`
- **API Docs:** `https://tu-backend.onrender.com/api/docs`
- **API Products:** `https://tu-backend.onrender.com/api/products`
- **Render Dashboard:** https://dashboard.render.com/

## 🔐 Seguridad

✅ **NUNCA subas el archivo `.env` al repositorio**
✅ Configura todas las variables sensibles en Render
✅ Usa variables de entorno diferentes para desarrollo y producción
✅ Mantén actualizadas las claves de Wompi (cambia a producción cuando estés listo)

## 📊 Monitoreo

En Render Dashboard puedes ver:

- 📈 Métricas de uso (CPU, memoria, requests)
- 📝 Logs en tiempo real
- 🔄 Historial de deploys
- ⚡ Tiempo de respuesta
