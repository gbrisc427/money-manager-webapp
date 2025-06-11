package com.money.manager.webapp.controller;

import com.money.manager.webapp.dto.RegisterRequest;
import com.money.manager.webapp.model.User;
import com.money.manager.webapp.service.UserServ;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserServ userService;

    public UserController(UserServ userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public User register(@RequestBody  @Valid RegisterRequest request) {
        return userService.registerUser(request);
    }
}