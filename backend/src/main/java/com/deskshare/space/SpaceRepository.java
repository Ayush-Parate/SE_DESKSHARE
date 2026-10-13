package com.deskshare.space;

import java.util.List;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpaceRepository extends MongoRepository<Space, String> {

  List<Space> findByOwnerId(String ownerId);

  List<Space> findByOwnerIdAndActiveTrue(String ownerId);

  List<Space> findByTypeAndActiveTrue(SpaceType type);

  List<Space> findByLocationNear(Point point, Distance maxDistance);
}
