package com.example.surveyer.Service;


import com.example.surveyer.Entity.UserPrincipal;
import com.example.surveyer.Entity.Users;
import com.example.surveyer.Repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UsersRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String userName) throws UsernameNotFoundException {
//        System.out.println(userName); debugging
        Optional<Users> user = userRepository.findByUsername(userName);
        if (user.isEmpty()) {
            System.out.println("User Not Found");
            throw new UsernameNotFoundException("user not found");
        }


        return new UserPrincipal(user);
    }
}