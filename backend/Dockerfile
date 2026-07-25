FROM maven:3.9.11-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
# mvnw is checked out with CRLF line endings on Windows (git core.autocrlf),
# which breaks its "#!/bin/sh" shebang inside this Linux image ("mvnw: not
# found"). Normalize before making it executable so the build works
# regardless of which OS/git config produced the build context.
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
# Download dependencies first
RUN ./mvnw dependency:go-offline -B
# Copy source and build
COPY src src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENV JAVA_OPTS="-Xms256m -Xmx256m -XX:+UseG1GC"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
