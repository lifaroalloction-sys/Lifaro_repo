package com.journeyframes;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.CrossOrigin;

import jakarta.servlet.http.HttpServletResponse;

import java.io.FileInputStream;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class DriveController {

    @GetMapping("/api/drive/list")
    public Object list(@RequestParam String folderId) throws Exception {
        if (folderId == null || folderId.isEmpty()) {
            return Collections.singletonMap("error", "folderId required");
        }

        String credPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (credPath == null || credPath.isEmpty()) {
            return Collections.singletonMap("error", "GOOGLE_APPLICATION_CREDENTIALS env var not set");
        }

        GoogleCredentials creds;
        try (FileInputStream fis = new FileInputStream(credPath)){
            creds = GoogleCredentials.fromStream(fis).createScoped(Collections.singleton(DriveScopes.DRIVE_READONLY));
        }

        Drive drive = new Drive.Builder(GoogleNetHttpTransport.newTrustedTransport(), JacksonFactory.getDefaultInstance(), new HttpCredentialsAdapter(creds))
                .setApplicationName("JourneyFrames")
                .build();

        String q = String.format("'%s' in parents and trashed = false", folderId);
        FileList result = drive.files().list().setQ(q).setFields("files(id,name,mimeType,thumbnailLink,webViewLink)").execute();
        List<File> files = result.getFiles();

        List<Object> out = files.stream().map(f -> {
            String direct = String.format("https://drive.google.com/uc?export=view&id=%s", f.getId());
            return Collections.unmodifiableMap(java.util.Map.of(
                "id", f.getId(),
                "name", f.getName(),
                "mimeType", f.getMimeType(),
                "thumbnailLink", f.getThumbnailLink(),
                "webViewLink", f.getWebViewLink(),
                "directLink", direct
            ));
        }).collect(Collectors.toList());

        return Collections.singletonMap("files", out);
    }

    @CrossOrigin
    @GetMapping("/api/drive/media/{fileId}")
    public void media(@PathVariable String fileId, HttpServletResponse response) throws Exception {
        String credPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
        if (credPath == null || credPath.isEmpty()) {
            response.setStatus(500);
            response.getWriter().write("GOOGLE_APPLICATION_CREDENTIALS env var not set");
            return;
        }

        GoogleCredentials creds;
        try (java.io.FileInputStream fis = new java.io.FileInputStream(credPath)){
            creds = GoogleCredentials.fromStream(fis).createScoped(Collections.singleton(DriveScopes.DRIVE_READONLY));
        }

        Drive drive = new Drive.Builder(GoogleNetHttpTransport.newTrustedTransport(), JacksonFactory.getDefaultInstance(), new HttpCredentialsAdapter(creds))
                .setApplicationName("JourneyFrames")
                .build();

        // get mime type
        File meta = drive.files().get(fileId).setFields("mimeType,name").execute();
        String mime = meta.getMimeType();
        if (mime == null) mime = "application/octet-stream";
        response.setContentType(mime);

        // stream media through the server
        try (java.io.OutputStream out = response.getOutputStream()){
            drive.files().get(fileId).executeMediaAndDownloadTo(out);
        }
    }
}
