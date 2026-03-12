# URBA Prode - Setup Guide

## Requisitos
- Node.js 18+
- Cuenta en [Neon](https://neon.tech) (PostgreSQL serverless gratuito)
- Cuenta en [Vercel](https://vercel.com) para deploy

---

## Instalación local

### 1. Instalar dependencias
```bash
cd urba-prode
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
DATABASE_URL="postgresql://..."   # tu conexión de Neon
AUTH_SECRET="..."                  # genera con: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Crear la base de datos
```bash
npx prisma db push
```

### 4. Cargar datos iniciales (clubes + admin)
```bash
npm run db:seed
```

Esto crea:
- Los 14 clubes de Primera A URBA 2026
- Usuario admin: `admin` / `admin123` (**cambialo en producción**)

### 5. Logos de clubes
Colocar los logos en `public/clubs/` (ver `public/clubs/README.md`).
Sin logos, la app muestra las iniciales del club como fallback.

### 6. Correr en desarrollo
```bash
npm run dev
```

Abrir http://localhost:3000

---

## Flujo de uso

### Admin (http://localhost:3000/admin)
1. **Fechas**: Crear una fecha (ej: Fecha 1), opcionalmente con deadline
2. **Activar** la fecha para que los usuarios puedan predecir
3. **Partidos**: Agregar los partidos de esa fecha
4. **Resultados**: Cuando terminan los partidos, cargar scores → puntos se calculan automáticamente

### Usuarios
1. Registrarse en `/register` eligiendo su club
2. Ir a `/` para ver la fecha activa y hacer predicciones
3. Ver el ranking en `/ranking`
4. Ver su historial en `/historial`

---

## Sistema de puntos

| Resultado | Puntos |
|-----------|--------|
| Ganador correcto + margen correcto (≤7 o >7) | **5 pts** |
| Solo ganador correcto | **4 pts** |
| Ganador incorrecto | **0 pts** |

---

## Deploy en Vercel

```bash
# Push a GitHub primero, luego en Vercel:
# 1. Importar el repositorio
# 2. Agregar variables de entorno:
#    - DATABASE_URL (de Neon)
#    - AUTH_SECRET
#    - NEXTAUTH_URL (tu dominio de Vercel)
# 3. Deploy automático
```

Después del deploy:
```bash
npx prisma db push   # si no lo hiciste antes
npm run db:seed      # cargar clubes
```
