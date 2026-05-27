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

import com.razorpay.RazorpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

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

    // ✅ CREATE ORDER — only the booking's customer may pay for it.
    public Map<String, Object> createOrder(
            String bookingId,
            String callerLoginId
    ) {

        if (callerLoginId == null || callerLoginId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        System.out.println(
                "🔥 Creating order for booking: " + bookingId);

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found")
                );

        // 🔐 CALLER-IDENTITY CHECK — must be the booking's customer
        if (!callerLoginId.equals(booking.getUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the booking's customer can pay for it");
        }

        if (booking.getOrderId() != null) {
            throw new RuntimeException(
                    "Order already created for this booking"
            );
        }

        // booking.amount is a primitive double — defaults to 0.0 when the
        // worker's wage was never set. The <=0 check catches that case
        // with a message that points at the most likely root cause.
        if (booking.getAmount() <= 0) {
            throw new RuntimeException(
                    "Invalid booking amount — worker wage not set?");
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
        // IMPORTANT: only paymentStatus is touched here. The booking's main
        // `status` field tracks the WORKER'S decision (PENDING → ACCEPTED /
        // REJECTED → COMPLETED) and must not be overwritten by payment.
        // Overwriting it previously made the Accept / Reject buttons vanish
        // for workers the moment the user paid.
        booking.setPaymentId(paymentId);

        booking.setPaymentStatus("PAID");

        booking.setUpdatedAt(LocalDateTime.now());

        bookingRepository.save(booking);

        // 📩 SAFE NOTIFICATIONS
        try {

            System.out.println(
                    "🔥 PAYMENT SUCCESS → SENDING SMS"
            );

            User user =
                    userRepository.findByLoginId(
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
    // Enforces both a tight state machine AND caller-identity checks so:
    //   - The state can't go out of order (e.g. complete-before-pay)
    //   - Only the booking's actual worker can accept / reject
    //   - Only the booking's actual customer can mark completed
    //
    // Before this guard, any logged-in user could pass any bookingId and
    // mutate it (C-3 in the production review).
    public Booking updateStatus(
            String bookingId,
            String status,
            String callerLoginId
    ) {

        if (callerLoginId == null || callerLoginId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        Booking booking =
                bookingRepository.findById(bookingId)
                        .orElseThrow(() ->
                                new RuntimeException("Booking not found")
                        );

        // 🔐 CALLER-IDENTITY CHECK
        // ACCEPTED / REJECTED: caller must be the worker assigned to this
        // booking. booking.workerId is the Worker document _id; we look up
        // that Worker and compare its userId (= loginId / JWT subject).
        // COMPLETED: caller must be the booking's customer (booking.userId).
        switch (status) {
            case "ACCEPTED", "REJECTED" -> {
                Worker assigned = workerRepository.findById(booking.getWorkerId())
                        .orElseThrow(() -> new RuntimeException(
                                "Worker not found for booking"));
                if (!callerLoginId.equals(assigned.getUserId())) {
                    throw new ResponseStatusException(
                            HttpStatus.FORBIDDEN,
                            "Only the assigned worker can " + status.toLowerCase()
                                    + " this booking");
                }
            }
            case "COMPLETED" -> {
                if (!callerLoginId.equals(booking.getUserId())) {
                    throw new ResponseStatusException(
                            HttpStatus.FORBIDDEN,
                            "Only the booking's customer can mark it completed");
                }
            }
            default -> throw new RuntimeException(
                    "Unsupported booking status: " + status);
        }

        String current = booking.getStatus() == null
                ? "PENDING"
                : booking.getStatus();

        switch (status) {
            case "ACCEPTED", "REJECTED" -> {
                if (!"PENDING".equals(current)) {
                    throw new RuntimeException(
                            "Cannot " + status.toLowerCase()
                                    + " a booking that is " + current);
                }
            }
            case "COMPLETED" -> {
                if (!"ACCEPTED".equals(current)) {
                    throw new RuntimeException(
                            "Booking must be ACCEPTED before it can be marked completed");
                }
                if (!"PAID".equals(booking.getPaymentStatus())) {
                    throw new RuntimeException(
                            "Booking can only be completed after payment is done");
                }
            }
            default -> throw new RuntimeException(
                    "Unsupported booking status: " + status);
        }

        booking.setStatus(status);
        booking.setUpdatedAt(LocalDateTime.now());

        // 💸 REFUND ON REJECT (C-7)
        // If the worker rejects a booking the customer has already paid
        // for, issue a Razorpay refund inline. The UI already promises
        // "your payment will be refunded shortly" — this is where that
        // promise is actually kept.
        //
        // Behaviour:
        //   - PAID  → call Razorpay; on success set REFUNDED + refundId,
        //             on failure set REFUND_FAILED so it shows up in a
        //             dashboard / reconciliation report and a human can
        //             retry. Either way the reject succeeds (we don't
        //             want the worker stuck if Razorpay hiccups; the
        //             customer's money is still in Razorpay's escrow
        //             and visible to ops).
        //   - any other paymentStatus → no money to return, no-op.
        if ("REJECTED".equals(status) && "PAID".equals(booking.getPaymentStatus())) {
            try {
                String refundId = paymentService.refundPayment(
                        booking.getPaymentId(), booking.getAmount());
                booking.setRefundId(refundId);
                booking.setPaymentStatus("REFUNDED");
                log.info("💸 Refund OK for booking={} refundId={}", booking.getId(), refundId);
            } catch (RazorpayException | RuntimeException ex) {
                booking.setPaymentStatus("REFUND_FAILED");
                log.error("❌ Refund FAILED for booking={} paymentId={} amount={} — manual reconciliation required: {}",
                        booking.getId(), booking.getPaymentId(),
                        booking.getAmount(), ex.getMessage());
            }
        }

        // ✅ MARK COMPLETED
        if ("COMPLETED".equals(status)) {

            booking.setCompleted(true);
            booking.setCompletedAt(LocalDateTime.now());

            // ✅ UPDATE JOB STATUS
            if (booking.getJobId() != null) {
                jobRepository.findById(booking.getJobId())
                        .ifPresent(job -> {
                            job.setStatus(JobStatus.COMPLETED);
                            job.setUpdatedAt(new Date());
                            jobRepository.save(job);
                        });
            }
        }

        Booking updatedBooking = bookingRepository.save(booking);

        // ✅ ACCEPT NOTIFICATION
        if ("ACCEPTED".equals(status)) {
            userRepository.findByLoginId(booking.getUserId())
                    .ifPresent(notificationService::sendBookingAccepted);
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