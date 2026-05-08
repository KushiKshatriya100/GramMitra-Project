package com.grammitra.backend.controller;

import com.grammitra.backend.model.Job;
import com.grammitra.backend.model.JobStatus;
import com.grammitra.backend.service.JobService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    private String getUser(Authentication auth) {
        return auth.getName();
    }

    @PostMapping("/create")
    public Job createJob(@RequestParam String workerId, Authentication auth) {
        return jobService.createJob(getUser(auth), workerId);
    }

    @PutMapping("/update")
    public Job updateJob(@RequestParam String jobId,
                         @RequestParam JobStatus status,
                         Authentication auth) {
        return jobService.updateJobStatus(jobId, status, getUser(auth));
    }

    @GetMapping("/worker")
    public List<Job> getWorkerJobs(Authentication auth) {
        return jobService.getWorkerJobs(getUser(auth));
    }

    @GetMapping("/employer")
    public List<Job> getEmployerJobs(Authentication auth) {
        return jobService.getEmployerJobs(getUser(auth));
    }

    @GetMapping("/{jobId}")
    public Job getJobById(@PathVariable String jobId) {
        return jobService.getJobById(jobId);
    }
}