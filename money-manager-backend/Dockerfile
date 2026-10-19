# ==============================================================================
# STAGE 1: Build Stage (Maven + JDK 21)
# ==============================================================================
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /workspace

# Copiar descriptor Maven y wrapper para cachear dependencias en capas Docker
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Normalizar saltos de linea CRLF (Windows) a LF (Linux) y dar permisos de ejecucion
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

# Copiar codigo fuente y compilar el artefacto JAR ejecutable
COPY src src
RUN ./mvnw clean package -DskipTests -B

# ==============================================================================
# STAGE 2: Runtime Stage (JRE 21 Ligero optimizado para Render Free 512MB RAM)
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Crear usuario sin privilegios root por seguridad
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiar el JAR generado desde la etapa de compilacion
COPY --from=build /workspace/target/*.jar app.jar

# Render inyecta dinamicamente la variable PORT (por defecto 8081)
EXPOSE 8081

# Optimizacion de memoria JVM para contenedores de 512 MB (Render Free Tier)
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseSerialGC -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8081} -jar app.jar"]
