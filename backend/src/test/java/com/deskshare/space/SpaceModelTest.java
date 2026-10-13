package com.deskshare.space;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;

class SpaceModelTest {

  @Test
  @DisplayName("Space entity maintains correct attributes, geospatial coordinates and capacity")
  void testSpaceEntity() {
    Address address = new Address("123 Innovation Way", "San Francisco", "CA", "94105", "USA");
    GeoJsonPoint coordinates = new GeoJsonPoint(-122.4194, 37.7749);

    Space space = new Space("owner_1", "Downtown Hub", "A shared workspace",
        address, coordinates, SpaceType.HOT_DESK, 30, 1500, 7500);

    space.setAmenities(List.of("WIFI", "COFFEE", "PRINTING"));
    space.setImageUrls(List.of("https://example.com/photo.jpg"));

    assertThat(space.getOwnerId()).isEqualTo("owner_1");
    assertThat(space.getName()).isEqualTo("Downtown Hub");
    assertThat(space.getType()).isEqualTo(SpaceType.HOT_DESK);
    assertThat(space.getTotalCapacity()).isEqualTo(30);
    assertThat(space.getPriceHourly()).isEqualTo(1500L);
    assertThat(space.getPriceDaily()).isEqualTo(7500L);
    assertThat(space.getLocation().getX()).isEqualTo(-122.4194);
    assertThat(space.getLocation().getY()).isEqualTo(37.7749);
    assertThat(space.getAmenities()).containsExactly("WIFI", "COFFEE", "PRINTING");
    assertThat(space.getAddress().getCity()).isEqualTo("San Francisco");
  }
}
