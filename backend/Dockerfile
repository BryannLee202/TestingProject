FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
# Same antivirus SSL-scanning issue as the runtime stage below, hitting this
# stage in two different places: mvnw's own bootstrap step uses plain curl
# (system CA trust store) to download the pinned Maven distribution, and
# Maven itself (running on this image's JVM) uses Java's own cacerts when
# resolving dependencies from Maven Central - both need the CA trusted
# separately, or each fails with its own "certificate verify failed" /
# "PKIX path building failed" error. Harmless if you don't have this
# antivirus: the cert just goes unused in both stores.
COPY avast-root.crt /usr/local/share/ca-certificates/avast-root.crt
RUN update-ca-certificates \
    && keytool -importcert -trustcacerts -noprompt \
       -alias avast-root -file /usr/local/share/ca-certificates/avast-root.crt \
       -keystore "$JAVA_HOME/lib/security/cacerts" -storepass changeit
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
# Download dependencies first
RUN ./mvnw dependency:go-offline -B
# Copy source and build
COPY src src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENV JAVA_OPTS="-Xms256m -Xmx256m -XX:+UseG1GC"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
