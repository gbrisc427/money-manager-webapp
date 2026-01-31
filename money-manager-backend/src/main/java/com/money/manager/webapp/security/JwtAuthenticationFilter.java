package com.money.manager.webapp.security;

import com.money.manager.webapp.component.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    public JwtAuthenticationFilter(JwtUtils jwtUtils, CustomUserDetailsService uds, TokenBlacklistService tokenBlacklistService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = uds;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, java.io.IOException {

        String token = null;
        String requestURI = request.getRequestURI();

        // Solo mostramos logs para rutas de API protegidas para no saturar
        boolean isApiRequest = requestURI.startsWith("/api/") && !requestURI.contains("/login") && !requestURI.contains("/register");

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    token = cookie.getValue();
                    if(isApiRequest) System.out.println(" Cookie accessToken encontrada: " + (token.length() > 10 ? token.substring(0, 10) + "..." : token));
                    break;
                }
            }
        } else {
            if(isApiRequest) System.out.println("request.getCookies() es NULL en " + requestURI);
        }

        if (token == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        if (token == null) {
            if(isApiRequest) System.out.println("No se encontró token en Cookies ni Headers para " + requestURI);
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (!jwtUtils.validateToken(token)) {
                System.out.println("validateToken devolvió FALSE. Token inválido o expirado.");
                filterChain.doFilter(request, response);
                return;
            }

            if (tokenBlacklistService.isTokenBlacklisted(token)) {
                System.out.println("El token está en la BLACKLIST.");
                filterChain.doFilter(request, response);
                return;
            }

            String username = jwtUtils.getUsernameFromToken(token);
            System.out.println("Usuario extraído del token: " + username);

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("Autenticación establecida en SecurityContext para: " + username);

        } catch (Exception ex) {
            System.out.println("Excepción procesando JWT: " + ex.getMessage());
            ex.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }
}