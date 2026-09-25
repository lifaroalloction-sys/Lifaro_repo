FROM maven:3.9.4-eclipse-temurin-17 as build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV GOOGLE_APPLICATION_CREDENTIALS=/creds/creds.json
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
