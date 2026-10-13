package com.deskshare.space;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.deskshare.common.exception.ResourceNotFoundException;
import com.deskshare.space.dto.CreateSpaceRequest;
import com.deskshare.space.dto.SpaceResponse;
import com.deskshare.space.dto.UpdateSpaceRequest;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SpaceServiceTest {

  @Mock
  private SpaceRepository spaceRepository;

  private SpaceService spaceService;

  @BeforeEach
  void setUp() {
    spaceService = new SpaceService(spaceRepository);
  }

  @Test
  @DisplayName("createSpace saves space with valid fields")
  void testCreateSpace() {
    Address address = new Address("10 Market St", "San Francisco", "CA", "94105", "USA");
    CreateSpaceRequest request = new CreateSpaceRequest(
        "owner_1", "Market St Coworking", "Great place", address,
        -122.4, 37.79, SpaceType.HOT_DESK, 20, 2000, 10000,
        List.of("WIFI", "COFFEE"), List.of("https://example.com/img.jpg"));

    when(spaceRepository.save(any(Space.class))).thenAnswer(invocation -> {
      Space space = invocation.getArgument(0);
      space.setId("space_100");
      return space;
    });

    SpaceResponse response = spaceService.createSpace(request);

    assertThat(response.id()).isEqualTo("space_100");
    assertThat(response.name()).isEqualTo("Market St Coworking");
    assertThat(response.totalCapacity()).isEqualTo(20);
    assertThat(response.priceHourly()).isEqualTo(2000L);
    assertThat(response.longitude()).isEqualTo(-122.4);
    assertThat(response.latitude()).isEqualTo(37.79);
    verify(spaceRepository).save(any(Space.class));
  }

  @Test
  @DisplayName("searchSpaces filters by city, type, and price while hiding inactive spaces")
  void testSearchSpaces() {
    Address address = new Address("100 Main", "Austin", "TX", "78701", "USA");
    Space first = new Space("owner_1", "CoLab Austin", "Shared space", address,
        new org.springframework.data.mongodb.core.geo.GeoJsonPoint(-97.74, 30.26),
        SpaceType.HOT_DESK, 12, 1500, 7500);
    first.setAmenities(List.of("WIFI", "COFFEE"));
    first.setActive(true);
    Space archived = new Space("owner_2", "Archived Room", "Old space", address,
        new org.springframework.data.mongodb.core.geo.GeoJsonPoint(-97.74, 30.26),
        SpaceType.PRIVATE_OFFICE, 8, 1000, 5000);
    archived.setActive(false);

    when(spaceRepository.findAll()).thenReturn(List.of(first, archived));

    List<SpaceResponse> results = spaceService.searchSpaces(
        null, SpaceType.HOT_DESK, "Austin", "WIFI", 1000L, 2000L);

    assertThat(results).hasSize(1);
    assertThat(results.getFirst().name()).isEqualTo("CoLab Austin");
  }

  @Test
  @DisplayName("updateSpace updates pricing and amenities for an existing space")
  void testUpdateSpace() {
    Space space = new Space("owner_1", "Old Name", "Old description",
        new Address("12 Main", "Austin", "TX", "78701", "USA"),
        new org.springframework.data.mongodb.core.geo.GeoJsonPoint(-97.7, 30.3),
        SpaceType.HOT_DESK, 10, 1000, 4000);
    space.setAmenities(List.of("WIFI"));

    when(spaceRepository.findById("space_1")).thenReturn(Optional.of(space));
    when(spaceRepository.save(space)).thenReturn(space);

    UpdateSpaceRequest request = new UpdateSpaceRequest(
        "Updated Name",
        "Updated description",
        new Address("12 Main", "Austin", "TX", "78701", "USA"),
        -97.8, 30.4,
        SpaceType.DEDICATED_DESK,
        18,
        2000L,
        9000L,
        List.of("WIFI", "PRINTER"),
        List.of("https://example.com/updated.jpg"),
        true);

    SpaceResponse response = spaceService.updateSpace("space_1", request);

    assertThat(response.name()).isEqualTo("Updated Name");
    assertThat(response.type()).isEqualTo(SpaceType.DEDICATED_DESK);
    assertThat(response.priceHourly()).isEqualTo(2000L);
    assertThat(response.amenities()).containsExactly("WIFI", "PRINTER");
  }

  @Test
  @DisplayName("getSpaceById throws ResourceNotFoundException when space is missing")
  void testGetSpaceByIdNotFound() {
    when(spaceRepository.findById("missing_space")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> spaceService.getSpaceById("missing_space"))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Space not found with id: 'missing_space'");
  }
}
