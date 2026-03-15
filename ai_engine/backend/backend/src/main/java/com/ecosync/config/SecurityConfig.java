package com.ecosync.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security Configuration for EcoSync
 * Provides basic security with configurable authentication
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for API
            .csrf().disable()
            
            // Configure authorization
            .authorizeRequests()
                // Public endpoints
                .antMatchers("/", "/index.html", "/static/**").permitAll()
                .antMatchers("/ws/**").permitAll()
                .antMatchers("/topic/**").permitAll()
                .antMatchers("/api/public/**").permitAll()
                
                // API documentation
                .antMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                
                // Actuator endpoints
                .antMatchers("/actuator/**").permitAll()
                
                // All other endpoints require authentication
                .antMatchers("/api/**").permitAll() // Change to .authenticated() for production
                .anyRequest().permitAll() // Default: permit all for development
            .and()
            
            // Disable session creation (stateless API)
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            
            // Disable basic auth header (can be enabled for production)
            .httpBasic().disable()
            .formLogin().disable();
        
        return http.build();
    }
}
