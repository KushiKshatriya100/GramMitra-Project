package com.grammitra.backend.repository;

import com.grammitra.backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // ✅ INCOMING BOOKINGS FOR WORKER
    List<Booking> findByWorkerId(String workerId);

    // ✅ MY BOOKINGS (USER / WORKER)
    List<Booking> findByUserId(String userId);

    // ✅ OPTIONAL ALIAS FOR CLEANER FUTURE LOGIC
    default List<Booking> findByCustomerId(String customerId) {
        return findByUserId(customerId);
    }

    // 💰 FIND BOOKING USING RAZORPAY ORDER ID
    Optional<Booking> findByOrderId(String orderId);
}