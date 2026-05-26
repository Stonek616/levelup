package com.levelup.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }

    public String uploadAvatar(UUID userId, byte[] bytes) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> result = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
                "public_id", "levelup/avatars/" + userId,
                "overwrite", true,
                "resource_type", "image"));
        return (String) result.get("secure_url");
    }

    public void deleteAvatar(UUID userId) throws IOException {
        cloudinary.uploader().destroy("levelup/avatars/" + userId, ObjectUtils.emptyMap());
    }
}
