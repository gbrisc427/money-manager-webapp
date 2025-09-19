package com.money.manager.webapp.config;

import com.money.manager.webapp.component.JwtUtils;
import com.money.manager.webapp.security.JwtAuthenticationFilter;
import com.money.manager.webapp.security.CustomUserDetailsService;
import com.money.manager.webapp.security.TokenBlacklistService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;



@Configuration
@EnableMethodSecurity
public class SecurityConfig {


    private final CustomUserDetailsService uds;
    private final JwtUtils jwtProvider;
    private final TokenBlacklistService tokenBlacklistService;

    public SecurityConfig(CustomUserDetailsService uds, JwtUtils jwtProvider, TokenBlacklistService tokenBlacklistService){
        this.uds = uds;
        this.jwtProvider = jwtProvider;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable() // Para APIs REST; si usas cookies HttpOnly, ajustar protección CSRF
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeHttpRequests()
                .requestMatchers("/api/user/**").permitAll()
                .anyRequest().authenticated()
                .and();

        http.addFilterBefore(new JwtAuthenticationFilter(jwtProvider, uds,  tokenBlacklistService),
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .userDetailsService(uds)
                .passwordEncoder(passwordEncoder())
                .and()
                .build();
    }

}
