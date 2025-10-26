package com.shodhacode.backend;

import com.shodhacode.backend.model.*;
import com.shodhacode.backend.repo.ContestRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner init(ContestRepository contestRepository) {
        return args -> {
            if (contestRepository.count() == 0) {
                Contest c = new Contest("Sample Contest");

                Problem p1 = new Problem("Sum Two", "Read two integers and print their sum");
                p1.getTestCases().add(new TestCase("1 2", "3"));
                p1.getTestCases().add(new TestCase("10 20", "30"));

                Problem p2 = new Problem("Echo", "Echo the input line");
                p2.getTestCases().add(new TestCase("hello", "hello"));

                c.setProblems(List.of(p1, p2));
                contestRepository.save(c);
                System.out.println("Inserted sample contest with id=" + c.getId());
            }
        };
    }
}
