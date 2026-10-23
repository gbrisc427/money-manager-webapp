package com.money.manager.webapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ExchangeRateService {

    private static final String FRANKFURTER_API_URL = "https://api.frankfurter.app/latest?from=%s&to=%s";
    private static final Duration CACHE_TTL = Duration.ofHours(1);
    private static final Duration HTTP_TIMEOUT = Duration.ofSeconds(4);

    private static final Map<String, BigDecimal> FALLBACK_RATES = Map.of(
            "EUR->USD", new BigDecimal("1.080000"),
            "USD->EUR", new BigDecimal("0.925926")
    );

    private record CachedRate(BigDecimal rate, Instant expiresAt) {}

    private final Map<String, CachedRate> cache = new ConcurrentHashMap<>();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(HTTP_TIMEOUT)
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public BigDecimal getExchangeRate(String fromCurrency, String toCurrency) {
        String from = normalizeCurrency(fromCurrency);
        String to = normalizeCurrency(toCurrency);

        if (from.equals(to)) {
            return BigDecimal.ONE;
        }

        String cacheKey = from + "->" + to;
        CachedRate cached = cache.get(cacheKey);
        if (cached != null && Instant.now().isBefore(cached.expiresAt())) {
            return cached.rate();
        }

        try {
            String url = String.format(FRANKFURTER_API_URL, from, to);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(HTTP_TIMEOUT)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode rateNode = root.path("rates").path(to);
                if (!rateNode.isMissingNode() && rateNode.isNumber()) {
                    BigDecimal rate = rateNode.decimalValue().setScale(6, RoundingMode.HALF_UP);
                    cache.put(cacheKey, new CachedRate(rate, Instant.now().plus(CACHE_TTL)));
                    return rate;
                }
            }
        } catch (Exception e) {
            System.err.println("Aviso: No se pudo consultar Frankfurter API (" + e.getMessage() + "). Aplicando tasa de respaldo.");
        }

        return FALLBACK_RATES.getOrDefault(cacheKey, BigDecimal.ONE);
    }

    public String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return "EUR";
        }
        String normalized = currency.trim().toUpperCase();
        return ("USD".equals(normalized) || "EUR".equals(normalized)) ? normalized : "EUR";
    }
}
