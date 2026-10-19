package com.money.manager.webapp;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.nio.file.Files;
import java.nio.file.Paths;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class MoneyManagerWebappApplication {

	public static void main(String[] args) {
		loadEnvironmentVariables();
		SpringApplication.run(MoneyManagerWebappApplication.class, args);
	}

	private static void loadEnvironmentVariables() {
		String profile = System.getProperty("spring.profiles.active",
				System.getenv().getOrDefault("SPRING_PROFILES_ACTIVE",
						System.getenv().getOrDefault("APP_ENV", "dev")));

		String envFileName = switch (profile.toLowerCase()) {
			case "staging", "pre" -> ".env.staging";
			case "prod", "production" -> ".env.production";
			default -> ".env.development";
		};

		// 1. Cargar archivo especifico del entorno (.env.development, .env.staging, .env.production)
		applyDotenv(".", envFileName);
		applyDotenv("..", envFileName);

		// 2. Cargar .env base como respaldo para variables no definidas aun
		applyDotenv(".", ".env");
		applyDotenv("..", ".env");
	}

	private static void applyDotenv(String directory, String filename) {
		if (!Files.exists(Paths.get(directory, filename))) {
			return;
		}
		Dotenv dotenv = Dotenv.configure()
				.directory(directory)
				.filename(filename)
				.ignoreIfMissing()
				.ignoreIfMalformed()
				.load();

		for (DotenvEntry entry : dotenv.entries()) {
			String key = entry.getKey();
			String value = entry.getValue();
			if (value != null && System.getProperty(key) == null && System.getenv(key) == null) {
				System.setProperty(key, value);
			}
		}
	}

}

