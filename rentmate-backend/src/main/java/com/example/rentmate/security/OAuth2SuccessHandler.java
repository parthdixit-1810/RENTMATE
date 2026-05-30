package com.example.rentmate.security;

import com.example.rentmate.model.User;
import com.example.rentmate.service.UserService;
import com.example.rentmate.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private static final String FRONTEND_CALLBACK = "http://localhost:5173/oauth2/callback";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        String name  = oauth2User.getAttribute("name");

        if (email == null) {
            response.sendRedirect(FRONTEND_CALLBACK + "?error=no_email");
            return;
        }

        // Find or create local User
        User user = userService.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                .email(email)
                .name(name != null ? name : email)
                .password("") // OAuth users have no password
                .build();
            return userRepository.save(newUser);
        });

        String token  = jwtUtil.generateToken(user.getEmail());
        String userId = String.valueOf(user.getId());

        String redirect = FRONTEND_CALLBACK
            + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
            + "&userId=" + URLEncoder.encode(userId, StandardCharsets.UTF_8)
            + "&name="   + URLEncoder.encode(user.getName() != null ? user.getName() : "", StandardCharsets.UTF_8);

        response.sendRedirect(redirect);
    }
}
