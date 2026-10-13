package com.deskshare.space;

import com.deskshare.space.dto.CreateSpaceRequest;
import com.deskshare.space.dto.SpaceResponse;
import com.deskshare.space.dto.UpdateSpaceRequest;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/spaces")
public class SpaceController {

  private final SpaceService spaceService;

  public SpaceController(SpaceService spaceService) {
    this.spaceService = spaceService;
  }

  @PostMapping
  public ResponseEntity<SpaceResponse> createSpace(@Valid @RequestBody CreateSpaceRequest request) {
    SpaceResponse created = spaceService.createSpace(request);
    return ResponseEntity.created(URI.create("/api/v1/spaces/" + created.id())).body(created);
  }

  @GetMapping("/{id}")
  public ResponseEntity<SpaceResponse> getSpaceById(@PathVariable String id) {
    return ResponseEntity.ok(spaceService.getSpaceById(id));
  }

  @GetMapping
  public ResponseEntity<List<SpaceResponse>> getSpaces(
      @RequestParam(required = false) String ownerId,
      @RequestParam(required = false) SpaceType type,
      @RequestParam(required = false) String city,
      @RequestParam(required = false) String amenity,
      @RequestParam(required = false) Long minPrice,
      @RequestParam(required = false) Long maxPrice) {
    if (ownerId != null || type != null || city != null || amenity != null
        || minPrice != null || maxPrice != null) {
      return ResponseEntity.ok(spaceService.searchSpaces(ownerId, type, city, amenity, minPrice, maxPrice));
    }
    return ResponseEntity.ok(spaceService.getAllSpaces());
  }

  @PutMapping("/{id}")
  public ResponseEntity<SpaceResponse> updateSpace(@PathVariable String id,
      @Valid @RequestBody UpdateSpaceRequest request) {
    return ResponseEntity.ok(spaceService.updateSpace(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteSpace(@PathVariable String id) {
    spaceService.deleteSpace(id);
    return ResponseEntity.noContent().build();
  }
}
