package com.deskshare.booking;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.deskshare.booking.dto.BookingResponse;
import com.deskshare.booking.dto.CreateBookingRequest;
import com.deskshare.config.SecurityConfig;
import com.deskshare.config.SecurityTestConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = BookingController.class)
@Import({SecurityConfig.class, SecurityTestConfig.class})
class BookingControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private BookingService bookingService;

  @Test
  @WithMockUser
  @DisplayName("POST /api/v1/bookings creates a booking reservation")
  void testCreateBooking() throws Exception {
    Instant start = Instant.now().plusSeconds(7200);
    Instant end = start.plusSeconds(3600);
    CreateBookingRequest request = new CreateBookingRequest(
        "u1", "s1", start, end, 1, "Notes");

    BookingResponse response = new BookingResponse(
        "b1", "u1", "s1", "o1", start, end, 1, 1500L, "USD",
        BookingStatus.CONFIRMED, "Notes", Instant.now());

    when(bookingService.createBooking(any(CreateBookingRequest.class))).thenReturn(response);

    mockMvc.perform(post("/api/v1/bookings")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value("b1"))
        .andExpect(jsonPath("$.status").value("CONFIRMED"))
        .andExpect(jsonPath("$.totalPrice").value(1500));
  }

  @Test
  @WithMockUser
  @DisplayName("PUT /api/v1/bookings/{id}/cancel marks booking cancelled")
  void testCancelBooking() throws Exception {
    BookingResponse response = new BookingResponse(
        "b1", "u1", "s1", "o1", Instant.now(), Instant.now().plusSeconds(3600),
        1, 1500L, "USD", BookingStatus.CANCELLED, null, Instant.now());

    when(bookingService.cancelBooking("b1")).thenReturn(response);

    mockMvc.perform(put("/api/v1/bookings/b1/cancel"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value("b1"))
        .andExpect(jsonPath("$.status").value("CANCELLED"));
  }
}
