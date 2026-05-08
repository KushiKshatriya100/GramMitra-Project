package com.grammitra.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @Id
    private String id;

    private String employerId;
    private String workerId;

    private JobStatus status;

    private Date createdAt = new Date();
    private Date updatedAt = new Date();
}