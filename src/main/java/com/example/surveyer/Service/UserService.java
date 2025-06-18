package com.example.surveyer.Service;

import com.example.surveyer.DTO.UserDTO;
import com.example.surveyer.Entity.Users;
import com.example.surveyer.Repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UsersRepository usersRepository;
    
    public Optional<UserDTO> getCurrentUser(String username) {
        Optional<Users> user = usersRepository.findByUsername(username);
        if (user.isPresent()) {
            return Optional.of(convertToDTO(user.get()));
        }
        return Optional.empty();
    }
    
    private UserDTO convertToDTO(Users user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setRole(user.getRole().toString());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
} 