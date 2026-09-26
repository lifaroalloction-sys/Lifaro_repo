package com.journeyframes;

import org.springframework.web.bind.annotation.*;

import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
public class PostController {

    private static final Path STORE = Path.of("posts.json");

    @CrossOrigin
    @PostMapping("/api/posts")
    public Map<String, Object> addPost(@RequestBody Map<String,Object> body) throws Exception{
        List<Map<String,Object>> current = new ArrayList<>();
        if(Files.exists(STORE)){
            var text = Files.readString(STORE);
            if(!text.isBlank()){
                current = new com.fasterxml.jackson.databind.ObjectMapper().readValue(text, List.class);
            }
        }
        current.add(0, body);
        var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        try(FileWriter fw = new FileWriter(STORE.toFile(), false)){
            fw.write(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(current));
        }
        return Map.of("ok", true);
    }

    @CrossOrigin
    @GetMapping("/api/posts")
    public Object list() throws Exception{
        if(!Files.exists(STORE)) return Map.of("posts", List.of());
        var text = Files.readString(STORE);
        if(text.isBlank()) return Map.of("posts", List.of());
        var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        List<Map<String,Object>> current = mapper.readValue(text, List.class);
        return Map.of("posts", current);
    }
}
