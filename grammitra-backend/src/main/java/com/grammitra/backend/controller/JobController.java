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

    @PostMapping("/create")
    public Job createJob(@RequestParam String workerId,
                         Authentication authentication) {

        String employerId = (String) authentication.getPrincipal();

        return jobService.createJob(employerId, workerId);
    }

    @PutMapping("/update")
    public Job updateJob(@RequestParam String jobId,
                         @RequestParam JobStatus status,
                         Authentication authentication) {

        String workerId = (String) authentication.getPrincipal();

        return jobService.updateJobStatus(jobId, status, workerId);
    }

    @GetMapping("/worker")
    public List<Job> getWorkerJobs(Authentication authentication) {

        String workerId = (String) authentication.getPrincipal();

        return jobService.getWorkerJobs(workerId);
    }

    @GetMapping("/employer")
    public List<Job> getEmployerJobs(Authentication authentication) {

        String employerId = (String) authentication.getPrincipal();

        return jobService.getEmployerJobs(employerId);
    }

    @GetMapping("/{jobId}")
    public Job getJobById(@PathVariable String jobId) {
        return jobService.getJobById(jobId);
    }


}