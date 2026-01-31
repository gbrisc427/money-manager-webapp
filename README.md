# 💰 Money Manager Webapp

**Money Manager** es una aplicación web *Full Stack* diseñada para la gestión eficiente de finanzas personales. Permite a los usuarios llevar un control detallado de sus cuentas, ingresos y gastos a través de una interfaz moderna y segura.

---

## 🚀 Características Principales (v1.0)

### 🔐 Seguridad y Autenticación
* **Registro e Inicio de Sesión seguro:** Implementación robusta con Spring Security.
* **JWT en Cookies HttpOnly:** Mayor seguridad contra ataques XSS al almacenar tokens en cookies `HttpOnly` con políticas `SameSite`.
* **Gestión de Sesión:** Renovación automática de tokens mediante *Refresh Token*.
* **Recuperación de Contraseña:** Sistema de envío de códigos de verificación por correo electrónico.

### 💸 Gestión Financiera
* **Dashboard:** Visualización rápida del saldo total y accesos directos.
* **Cuentas:** Creación y gestión de múltiples cuentas (Efectivo, Banco, Tarjetas, Ahorros, Inversión).
* **Transacciones:** Registro de Ingresos y Gastos vinculados a cuentas específicas.
* **Categorías:** Organización de movimientos mediante categorías personalizables por colores.
* **Perfil de Usuario:** Gestión de datos personales y actualización de nombre.

---

## 🛠️ Tecnologías Utilizadas

### Backend ☕
* **Java 21** & **Spring Boot 3.5.0**
* **Spring Security** (Autenticación y Autorización)
* **Spring Data JPA** (Persistencia de datos)
* **PostgreSQL** (Base de datos relacional)
* **Java Dotenv** (Gestión de variables de entorno)
* **Maven** (Gestión de dependencias)
* **JavaMailSender** (Envío de correos)

### Frontend ⚛️
* **React 19**
* **TypeScript**
* **Vite** (Build tool de alto rendimiento)
* **Tailwind CSS** (Estilos modernos y responsivos)
* **React Router** (Navegación SPA)
* **Lucide React** (Iconografía)

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un *issue* primero para discutir qué te gustaría cambiar o crea un *Pull Request* directamente a la rama `develop`.

1.  Haz un Fork del proyecto.
2.  Crea tu rama de funcionalidad (`git checkout -b feature/NuevaFuncionalidad`).
3.  Haz Commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`).
4.  Haz Push a la rama (`git push origin feature/NuevaFuncionalidad`).
5.  Abre un Pull Request.



Desarrollado por Gabriel Serrano - gbrisc427
