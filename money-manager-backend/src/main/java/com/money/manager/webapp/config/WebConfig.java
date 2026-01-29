package com.money.manager.webapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Permite a todos los endpoints
                .allowedOrigins("http://localhost:5173") // React dev server
                .allowedMethods("*")
                .allowCredentials(true);
    }
}

