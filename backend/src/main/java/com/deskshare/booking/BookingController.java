package com.deskshare.booking;

import com.deskshare.booking.dto.BookingResponse;
import com.deskshare.booking.dto.CreateBookingRequest;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

  private final BookingService bookingService;

  public BookingController(BookingService bookingService) {
    this.bookingService = bookingService;
  }

  @PostMapping
  public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
    BookingResponse created = bookingService.createBooking(request);
    return ResponseEntity.created(URI.create("/api/v1/bookings/" + created.id())).body(created);
  }

  @GetMapping("/{id}")
  public ResponseEntity<BookingResponse> getBookingById(@PathVariable String id) {
    return ResponseEntity.ok(bookingService.getBookingById(id));
  }

  @GetMapping
  public ResponseEntity<List<BookingResponse>> getBookings(
      @RequestParam(required = false) String userId,
      @RequestParam(required = false) String ownerId) {
    if (userId != null) {
      return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }
    if (ownerId != null) {
      return ResponseEntity.ok(bookingService.getBookingsByOwner(ownerId));
    }
    return ResponseEntity.badRequest().build();
  }

  @PutMapping("/{id}/cancel")
  public ResponseEntity<BookingResponse> cancelBooking(@PathVariable String id) {
    return ResponseEntity.ok(bookingService.cancelBooking(id));
  }
}
