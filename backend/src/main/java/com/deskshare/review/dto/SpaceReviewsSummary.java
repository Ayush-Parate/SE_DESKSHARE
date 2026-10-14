package com.deskshare.review.dto;

import java.util.List;

public record SpaceReviewsSummary(
    String spaceId,
    double averageRating,
    long reviewCount,
    List<ReviewResponse> reviews
) {}
