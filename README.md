# Aplicación de Fichas Médicas y Alertas de Emergencia 🩺📱

Esta es una aplicación móvil desarrollada con **React Native** y **Expo** diseñada para la gestión de fichas médicas personales y de familiares en situaciones de emergencia. Permite el acceso rápido a información de salud vital y contactos de emergencia, el envío de alertas y la sincronización opcional en la nube.

---

## 🚀 Funcionalidades Principales

*   **Perfil Personal ("Yo"):** Registro detallado de la identidad del usuario, contactos de emergencia y ficha médica (enfermedades, alergias, medicamentos, tipo de sangre, donación de órganos, peso/altura, notas).
*   **Gestión de Familiares:** Creación, edición y eliminación de múltiples perfiles médicos para el grupo familiar.
*   **Sección de Favoritos:** Acceso directo a fichas médicas de familiares seleccionados para emergencias rápidas.
*   **Compartir Datos vía Código QR:** Generación de un código QR con los datos de cualquier perfil para que pueda ser escaneado por otro dispositivo e importado al instante de forma local y offline.
*   **Alerta de Emergencia (WhatsApp y Compartir):** Envío automático de un mensaje pre-formateado a los contactos de emergencia, el cual incluye los datos médicos clave y la ubicación actual del dispositivo a través de geolocalización en tiempo real.
*   **Sistema de Autenticación Híbrido:** Registro e inicio de sesión integrados opcionalmente con Firebase Auth.
*   **Sincronización en Tiempo Real:** Persistencia en la nube de Google Firestore con escucha activa (WebSockets). Si el usuario no tiene sesión o no configura las claves de Firebase, la app funciona de forma autónoma en modo local seguro (`AsyncStorage`).

---

## 🛠️ Tecnologías Elegidas

*   **Core:** React Native (utilizando **Expo SDK 55** `~55.0.24`, con [Expo Router](https://docs.expo.dev/router/introduction/) para enrutamiento basado en archivos).
*   **Base de Datos y Almacenamiento Local:** `@react-native-async-storage/async-storage` (Caché local persistente e imágenes de perfil).
*   **Autenticación:** Firebase Authentication (SDK Web/JS).
*   **Persistencia Remota / Tiempo Real:** Cloud Firestore (Base de datos NoSQL documental).
*   **Módulos Nativos:**
    *   `expo-image-picker` para toma y selección de fotos de perfil.
    *   `expo-location` para geolocalización en alertas.

---

## 💻 Instrucciones para Puesta en Marcha Local

Siga los siguientes pasos desde **Visual Studio Code** para poner en marcha la aplicación localmente:

### 1. Requerimientos de Software
Asegúrese de contar con:
*   [Node.js](https://nodejs.org/) (v18.0 o superior).
*   [Git](https://git-scm.com/) instalado.
*   La aplicación móvil **Expo Go** descargada en su celular (iOS o Android, versión compatible con **Expo SDK 55**) para previsualizar de manera interactiva.

### 2. Clonación e Instalación
Abra su terminal favorita o la terminal integrada de VS Code y ejecute:
```bash
# 1. Clonar el repositorio
git clone <URL_DE_TU_REPOSITORIO>
cd proyecto-medico

# 2. Instalar dependencias necesarias
npm install
```

### 3. Configuración de Variables de Entorno (`.env`)
Duplique el archivo `.env.example` en la raíz del proyecto y renómbrelo como `.env`. En este archivo deberá ingresar sus claves de Google Maps y las credenciales de Firebase:
```env
EXPO_PUBLIC_GOOGLE_API_KEY=TU_API_KEY_DE_GOOGLE
EXPO_PUBLIC_FIREBASE_API_KEY=TU_FIREBASE_API_KEY
...
```
*(Nota: Si no se configuran estas variables, la app iniciará de todos modos en **Modo Local Offline** automáticamente sin crashear).*

### 4. Configurar Firebase Console (Paso a Paso)
Para habilitar el inicio de sesión y la base de datos en tiempo real:
1.  Vaya a [Firebase Console](https://console.firebase.google.com/) e inicie sesión con una cuenta Google.
2.  Haga clic en **Crear proyecto**, asigne un nombre (ej. `ProyectoTallerMedico`) y desactive Google Analytics (opcional).
3.  Una vez creado, registre una aplicación **Web `</>`** (es el ícono del símbolo de código en la pantalla principal).
4.  Copia las propiedades de configuración dentro del bloque `firebaseConfig` y agréguelas a tu archivo `.env`.
5.  En el menú lateral de Firebase, acceda a **Authentication**, haga clic en *Comenzar*, habilite el método de inicio de sesión **Correo electrónico/contraseña** y guarde.
6.  En el menú lateral, acceda a **Firestore Database**, haga clic en *Crear base de datos*, elija la opción **Comenzar en modo de prueba** (para permitir lecturas/escrituras en fases de evaluación) y guarde los cambios en la región sugerida.

### 5. Configurar Google Cloud (API Key para Mapas y Geocodificación)
Para habilitar el mapa de geolocalización de las alertas y la búsqueda de centros médicos de emergencia:
1.  Vaya a [Google Cloud Console](https://console.cloud.google.com/) e ingrese con su cuenta Google.
2.  Cree un nuevo proyecto (o elija el mismo proyecto vinculado a Firebase si lo desea).
3.  En el buscador superior, busque **"API Library"** (Biblioteca de APIs).
4.  Busque y habilite los siguientes servicios indispensables:
    *   **Maps SDK for Android** (para visualización del mapa en dispositivos Android).
    *   **Maps SDK for iOS** (para visualización en dispositivos iOS).
    *   **Geocoding API** o **Places API** (para traducir coordenadas a direcciones de texto).
5.  Vaya a la pestaña lateral de **Credentials** (Credenciales).
6.  Haga clic en **Create Credentials** (Crear credenciales) y seleccione **API Key** (Clave de API).
7.  Copie la clave generada y asígnala en su archivo `.env` en la variable:
    `EXPO_PUBLIC_GOOGLE_API_KEY=SU_API_KEY_COPIADA`
8.  *(Recomendado en producción: Restringir la clave de API para que solo funcione desde su aplicación).*

### 6. Iniciar la Aplicación
Una vez configurado todo, ejecute en la terminal:
```bash
npx expo start
```
*   **En Celular físico:** Abra la app **Expo Go** en su celular. Escanee el código QR que aparece en la terminal de VS Code (con la cámara en iOS o desde la aplicación en Android) para compilar y visualizar la app en tiempo real.
*   **En Emulador:** Presione la tecla `a` en la terminal de VS Code para emulador de Android o `i` para simulador de iOS (requiere XCode en macOS).
