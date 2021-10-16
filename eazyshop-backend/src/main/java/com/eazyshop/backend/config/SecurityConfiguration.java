package com.eazyshop.backend.config;

import com.okta.spring.boot.oauth.Okta;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .antMatchers("/api/order/**")
                .authenticated()
                .and()
                .oauth2ResourceServer()
                .jwt();
        http.cors();
        Okta.configureResourceServer401ResponseBody(http);
        //disable csrf since we are not using cookies for session tracking
        http.csrf().disable();
    }
}
