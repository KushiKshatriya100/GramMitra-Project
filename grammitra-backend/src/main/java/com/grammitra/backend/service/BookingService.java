package com.grammitra.backend.service;

import com.grammitra.backend.model.Booking;
import com.grammitra.backend.model.Job;
import com.grammitra.backend.model.JobStatus;
import com.grammitra.backend.model.User;
import com.grammitra.backend.model.Worker;

import com.grammitra.backend.repository.BookingRepository;
import com.grammitra.backend.repository.JobRepository;
import com.grammitra.backend.repository.UserRepository;
import com.grammitra.backend.repository.WorkerRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    private final JobRepository jobRepository;

    private final WorkerRepository workerRepository;

    private final UserRepository userRepository;

    private final PaymentService paymentService;

    private final NotificationService notificationService;

    public BookingService(
            BookingRepository bookingRepository,
            JobRepository jobRepository,
            WorkerRepository workerRepository,
            UserRepository userRepository,
            PaymentService paymentService,
            NotificationService notificationService
    ) {

        this.bookingRepository = bookingRepository;

        this.jobRepository = jobRepository;

        this.workerRepository = workerRepository;

        this.userRepository = userRepository;

        this.paymentService = paymentService;

        this.notificationService = notificationService;
    }

    // ✅ CREATE BOOKING
    public Booking createBooking(
            String userId,
            String workerId,
            String description
    ) {

        if (userId == null || workerId == null) {

            throw new RuntimeException(
                    "Invalid booking request"
            );
        }

        Worker worker = workerRepository
                .findById(workerId)
                .orElseThrow(() ->
                        new RuntimeException("Worker not found")
                );

        // ✅ SELF BOOKING BLOCKED
        if (userId.equals(worker.getUserId())) {

            throw new RuntimeException(
                    "You cannot book yourself"
            );
        }

        if (
                worker.getWage() == null ||
                        worker.getWage() <= 0
        ) {

            throw new RuntimeException(
                    "Invalid worker wage"
            );
        }

        // ✅ CREATE JOB
        Job job = new Job();

        job.setEmployerId(userId);

        job.setWorkerId(workerId);

        job.setStatus(JobStatus.PENDING);

        job.setCreatedAt(new Date());

        job.setUpdatedAt(new Date());

        jobRepository.save(job);

        // ✅ CREATE BOOKING
        Booking booking = new Booking();

        booking.setUserId(userId);

        booking.setWorkerId(workerId);

        booking.setDescription(description);

        booking.setStatus("PENDING");

        booking.setJobId(job.getId());

        booking.setPaymentStatus("PENDING");

        booking.setAmount(worker.getWage());

        booking.setReviewSubmitted(false);

        booking.setCompleted(false);

        booking.setCreatedAt(LocalDateTime.now());

        booking.setUpdatedAt(LocalDateTime.now());

        Booking savedBooking =
                bookingRepository.save(booking);

        // 📩 SAFE NOTIFICATION
        try {

            if (worker.getPhone() != null) {

                notificationService.sendBookingCreated(worker);

            } else {

                System.out.println(
                        "⚠️ Worker phone missing, SMS skipped"
                );
            }

        } catch (Exception e) {

            System.err.println(
                    "⚠️ Booking notification failed: "
                            + e.getMessage()
            );
        }

        return savedBooking;
    }

    // ✅ CREATE ORDER
    public Map<String, Object> createOrder(
            String bookingId
    ) {

        System.out.println(
                "🔥 Creating order for booking: "
                        + bookingId
        );

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found")
                );

        if (booking.getOrderId() != null) {

            throw new RuntimeException(
                    "Order already created for this booking"
            );
        }

        if (booking.getAmount() <= 0) {

            throw new RuntimeException(
                    "Invalid booking amount"
            );
        }

        Map<String, Object> orderData =
                paymentService.createOrder(booking);

        String orderId =
                (String) orderData.get("orderId");

        booking.setOrderId(orderId);

        booking.setUpdatedAt(LocalDateTime.now());

        bookingRepository.save(booking);

        return orderData;
    }

    // ✅ VERIFY PAYMENT
    public void verifyPayment(
            String orderId,
            String paymentId,
            String signature
    ) {

        System.out.println(
                "🔥 VERIFY PAYMENT TRIGGERED"
        );

        Booking booking =
                bookingRepository.findByOrderId(orderId)
                        .orElseThrow(() ->
                                new RuntimeException("Booking not found")
                        );

        // 🔁 ALREADY PAID
        if ("PAID".equals(booking.getPaymentStatus())) {

            System.out.println(
                    "⚠️ Payment already completed — skipping verification"
            );

            return;
        }

        boolean isValid;

        try {

            isValid =
                    paymentService.verifyPayment(
                            orderId,
                            paymentId,
                            signature
                    );

        } catch (Exception e) {

            System.err.println(
                    "❌ Payment verification error: "
                            + e.getMessage()
            );

            return;
        }

        // ❌ INVALID SIGNATURE
        if (!isValid) {

            System.out.println(
                    "⚠️ Invalid payment signature"
            );

            booking.setPaymentStatus("FAILED");

            booking.setUpdatedAt(LocalDateTime.now());

            bookingRepository.save(booking);

            return;
        }

        // ✅ SUCCESS
        booking.setPaymentId(paymentId);

        booking.setPaymentStatus("PAID");

        booking.setStatus("PAID");

        booking.setUpdatedAt(LocalDateTime.now());

        bookingRepository.save(booking);

        // 📩 SAFE NOTIFICATIONS
        try {

            System.out.println(
                    "🔥 PAYMENT SUCCESS → SENDING SMS"
            );

            User user =
                    userRepository.findById(
                            booking.getUserId()
                    ).orElse(null);

            Worker worker =
                    workerRepository.findById(
                            booking.getWorkerId()
                    ).orElse(null);

            if (
                    user != null &&
                            user.getPhone() != null
            ) {

                notificationService.sendPaymentSuccessToUser(user);

            } else {

                System.out.println(
                        "⚠️ User phone missing"
                );
            }

            if (
                    worker != null &&
                            worker.getPhone() != null
            ) {

                notificationService.sendPaymentSuccessToWorker(worker);

            } else {

                System.out.println(
                        "⚠️ Worker phone missing"
                );
            }

        } catch (Exception e) {

            System.err.println(
                    "⚠️ Notification failed: "
                            + e.getMessage()
            );
        }
    }

    // ✅ STATUS UPDATE
    public Booking updateStatus(
            String bookingId,
            String status
    ) {

        Booking booking =
                bookingRepository.findById(bookingId)
                        .orElseThrow(() ->
                                new RuntimeException("Booking not found")
                        );

        booking.setStatus(status);

        booking.setUpdatedAt(LocalDateTime.now());

        // ✅ MARK COMPLETED
        if ("COMPLETED".equals(status)) {

            booking.setCompleted(true);

            booking.setCompletedAt(
                    LocalDateTime.now()
            );

            // ✅ UPDATE JOB STATUS
            if (booking.getJobId() != null) {

                jobRepository.findById(
                        booking.getJobId()
                ).ifPresent(job -> {

                    job.setStatus(
                            JobStatus.COMPLETED
                    );

                    job.setUpdatedAt(
                            new Date()
                    );

                    jobRepository.save(job);
                });
            }
        }

        Booking updatedBooking =
                bookingRepository.save(booking);

        // ✅ ACCEPT NOTIFICATION
        if ("ACCEPTED".equals(status)) {

            userRepository.findById(
                    booking.getUserId()
            ).ifPresent(
                    notificationService::sendBookingAccepted
            );
        }

        return updatedBooking;
    }

    // ✅ MARK REVIEW SUBMITTED
    public void markReviewSubmitted(
            String bookingId
    ) {

        Booking booking =
                bookingRepository.findById(bookingId)
                        .orElseThrow(() ->
                                new RuntimeException("Booking not found")
                        );

        booking.setReviewSubmitted(true);

        booking.setUpdatedAt(LocalDateTime.now());

        bookingRepository.save(booking);
    }

    // ✅ GET WORKER BOOKINGS
    public List<Booking> getWorkerBookings(
            String workerId
    ) {

        return bookingRepository.findByWorkerId(workerId);
    }

    // ✅ GET USER BOOKINGS
    public List<Booking> getUserBookings(
            String userId
    ) {

        return bookingRepository.findByUserId(userId);
    }

    // 🧠 CHATBOT SUPPORT
    public Booking getBookingStatusByUserId(
            String userId
    ) {

        if (
                userId == null ||
                        userId.trim().isEmpty()
        ) {

            System.out.println(
                    "⚠️ Invalid userId for booking status"
            );

            return null;
        }

        userId = userId.trim();

        List<Booking> bookings =
                bookingRepository.findByUserId(userId);

        if (
                bookings == null ||
                        bookings.isEmpty()
        ) {

            System.out.println(
                    "📊 No bookings found for user: "
                            + userId
            );

            return null;
        }

        // ✅ GET LATEST
        Booking latestBooking =
                bookings.stream()
                        .reduce((first, second) -> second)
                        .orElse(null);

        if (latestBooking != null) {

            System.out.println(
                    "📊 Latest booking status: "
                            + latestBooking.getStatus()
            );
        }

        return latestBooking;
    }
}