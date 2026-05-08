package com.grammitra.backend.service;

import com.grammitra.backend.model.Job;
import com.grammitra.backend.model.JobStatus;
import com.grammitra.backend.repository.JobRepository;
import com.grammitra.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobService(JobRepository jobRepository,
                      UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    // 📩 Create Job (Employer only)
    public Job createJob(String employerId, String workerId) {

        validateUserRole(employerId, "EMPLOYER");

        if (workerId == null || workerId.isEmpty()) {
            throw new RuntimeException("WorkerId is required");
        }

        Job job = new Job();
        job.setEmployerId(employerId);
        job.setWorkerId(workerId);
        job.setStatus(JobStatus.PENDING);
        job.setCreatedAt(new Date());
        job.setUpdatedAt(new Date());

        return jobRepository.save(job);
    }

    // 🔄 Update Job Status (Worker only)
    public Job updateJobStatus(String jobId, JobStatus newStatus, String workerId) {

        validateUserRole(workerId, "WORKER");

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // 🔒 SECURITY CHECK
        if (!job.getWorkerId().equals(workerId)) {
            throw new RuntimeException("Unauthorized: Not your job");
        }

        JobStatus currentStatus = job.getStatus();

        if (!isValidTransition(currentStatus, newStatus)) {
            throw new RuntimeException(
                    "Invalid status transition: " + currentStatus + " → " + newStatus
            );
        }

        job.setStatus(newStatus);
        job.setUpdatedAt(new Date());

        return jobRepository.save(job);
    }

    // 🔥 STATE TRANSITION RULES
    private boolean isValidTransition(JobStatus current, JobStatus next) {

        if (current == null || next == null) return false;

        switch (current) {

            case PENDING:
                return next == JobStatus.ACCEPTED || next == JobStatus.REJECTED;

            case ACCEPTED:
                return next == JobStatus.IN_PROGRESS;

            case IN_PROGRESS:
                return next == JobStatus.COMPLETED;

            case COMPLETED:
                return next == JobStatus.CLOSED;

            default:
                return false;
        }
    }

    // ✅ UPDATED ROLE VALIDATION (LOGIN ID BASED)
    private void validateUserRole(String userId, String expectedRole) {

        String role = userRepository.findByLoginId(userId)
                .map(user -> {
                    if (user.getRole() == null) {
                        throw new RuntimeException("User role not set");
                    }
                    return user.getRole();
                })
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!expectedRole.equals(role)) {
            throw new RuntimeException("Access denied: Only " + expectedRole + " allowed");
        }
    }

    // 📦 GET WORKER JOBS
    public List<Job> getWorkerJobs(String workerId) {
        return jobRepository.findByWorkerId(workerId);
    }

    // 📦 GET EMPLOYER JOBS
    public List<Job> getEmployerJobs(String employerId) {
        return jobRepository.findByEmployerId(employerId);
    }

    // 🔍 GET JOB BY ID
    public Job getJobById(String jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }
}