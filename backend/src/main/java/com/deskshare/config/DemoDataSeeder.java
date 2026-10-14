package com.deskshare.config;

import com.deskshare.space.Address;
import com.deskshare.space.Space;
import com.deskshare.space.SpaceRepository;
import com.deskshare.space.SpaceType;
import com.deskshare.user.Role;
import com.deskshare.user.User;
import com.deskshare.user.UserRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds demo users/spaces for the {@code embedded} profile so Angular demo role
 * switching can exchange credentials for real JWTs against a live API+DB.
 */
@Component
@Profile("embedded")
public class DemoDataSeeder implements ApplicationRunner {

  public static final String DEMO_PASSWORD = "demo1234";

  private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

  private final UserRepository userRepository;
  private final SpaceRepository spaceRepository;
  private final PasswordEncoder passwordEncoder;

  public DemoDataSeeder(UserRepository userRepository,
                        SpaceRepository spaceRepository,
                        PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.spaceRepository = spaceRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  public void run(ApplicationArguments args) {
    User customer = ensureUser("customer@demo.deskshare", "Alex", "Customer", Role.CUSTOMER);
    User owner = ensureUser("owner@demo.deskshare", "Sam", "Owner", Role.OWNER);
    ensureUser("admin@demo.deskshare", "Jordan", "Admin", Role.ADMIN);

    if (spaceRepository.count() == 0) {
      Space harbor = new Space();
      harbor.setOwnerId(owner.getId());
      harbor.setName("Harbor Desk");
      harbor.setDescription("Bright open coworking floor for local integration demos.");
      harbor.setAddress(new Address("101 Harbor Ave", "Seattle", "WA", "98101", "US"));
      harbor.setType(SpaceType.HOT_DESK);
      harbor.setTotalCapacity(8);
      harbor.setPriceHourly(700);
      harbor.setPriceDaily(4200);
      harbor.setAmenities(List.of("WiFi", "Coffee", "Standing Desks"));
      harbor.setActive(true);

      Space studio = new Space();
      studio.setOwnerId(owner.getId());
      studio.setName("North Studio");
      studio.setDescription("Private office suite seeded for owner dashboard demos.");
      studio.setAddress(new Address("250 Congress Ave", "Austin", "TX", "78701", "US"));
      studio.setType(SpaceType.PRIVATE_OFFICE);
      studio.setTotalCapacity(4);
      studio.setPriceHourly(2000);
      studio.setPriceDaily(14000);
      studio.setAmenities(List.of("WiFi", "Whiteboard", "Kitchen"));
      studio.setActive(true);

      spaceRepository.saveAll(List.of(harbor, studio));
      log.info("Seeded demo spaces for owner {}", owner.getEmail());
    }

    log.info("Demo users ready (password '{}'): {}, {}, admin@demo.deskshare",
        DEMO_PASSWORD, customer.getEmail(), owner.getEmail());
  }

  private User ensureUser(String email, String firstName, String lastName, Role role) {
    return userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
      User user = new User(email, passwordEncoder.encode(DEMO_PASSWORD), firstName, lastName, role);
      User saved = userRepository.save(user);
      log.info("Seeded demo user {} ({})", email, role);
      return saved;
    });
  }
}
