package com.grammitra.backend.repository;

import com.grammitra.backend.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByWorkerId(String workerId);

    List<Booking> findByUserId(String userId);
}