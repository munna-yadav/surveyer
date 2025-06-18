package com.example.surveyer.Service;


import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    @Value("{RESEND_API_KEY}")
    String api;

    public void sendVerificationEmail(String email, String token){

        Resend resend = new Resend("re_63pGb6yh_26WWPj6rYs84CR3EyC3A5ET8");
        String url = "localhost:8080/verify-email";
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from("asknow@devmunna.xyz")
                .to(email)
                .subject("it works!")
                .html("<strong>hello world</strong>")
                .build();

        try {
            CreateEmailResponse data = resend.emails().send(params);
            System.out.println(data.getId());
        } catch (
                ResendException e) {
            e.printStackTrace();
        }
    }


}
