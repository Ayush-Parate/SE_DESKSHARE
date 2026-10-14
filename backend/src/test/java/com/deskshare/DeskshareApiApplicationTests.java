package com.deskshare;

import com.deskshare.booking.AvailabilitySlotRepository;
import com.deskshare.booking.BookingRepository;
import com.deskshare.space.SpaceRepository;
import com.deskshare.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("setup")
class DeskshareApiApplicationTests {

  @MockitoBean
  private UserRepository userRepository;

  @MockitoBean
  private SpaceRepository spaceRepository;

  @MockitoBean
  private BookingRepository bookingRepository;

  @MockitoBean
  private AvailabilitySlotRepository availabilitySlotRepository;

  @MockitoBean
  private com.deskshare.review.ReviewRepository reviewRepository;

  @Test
  void contextLoads() {
  }
}
