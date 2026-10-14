package com.deskshare.review;

import java.time.Instant;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a review for a space.
 *
 * <p>Reviews include a rating (1-5) and optional comment.
 * This class is designed for extension by subclasses that may add specialized behavior.
 */
@Document(collection = "reviews")
@CompoundIndexes({
    @CompoundIndex(name = "space_user_idx", def = "{'spaceId': 1, 'userId': 1}", unique = true),
    @CompoundIndex(name = "space_created_idx", def = "{'spaceId': 1, 'createdAt': -1}")
})
public class Review {

  @Id
  private String id;

  @Indexed
  private String spaceId;

  @Indexed
  private String userId;

  private String authorName;

  private int rating; // 1 to 5

  private String comment;

  @CreatedDate
  private Instant createdAt;

  /**
   * Default constructor for MongoDB deserialization.
   */
  public Review() {
  }

  /**
   * Creates a new Review with the specified details.
   *
   * @param spaceId    the ID of the space being reviewed
   * @param userId     the ID of the user writing the review
   * @param authorName the display name of the author
   * @param rating     the star rating (1-5)
   * @param comment    the review comment
   */
  public Review(final String spaceId, final String userId, final String authorName,
      final int rating, final String comment) {
    this.spaceId = spaceId;
    this.userId = userId;
    this.authorName = authorName;
    this.rating = rating;
    this.comment = comment;
    this.createdAt = Instant.now();
  }

  /**
   * Gets the unique identifier.
   *
   * @return the review ID
   */
  public String getId() {
    return id;
  }

  /**
   * Sets the unique identifier.
   *
   * @param id the review ID to set
   */
  public void setId(final String id) {
    this.id = id;
  }

  /**
   * Gets the space ID.
   *
   * @return the space ID
   */
  public String getSpaceId() {
    return spaceId;
  }

  /**
   * Sets the space ID.
   *
   * @param spaceId the space ID to set
   */
  public void setSpaceId(final String spaceId) {
    this.spaceId = spaceId;
  }

  /**
   * Gets the user ID.
   *
   * @return the user ID
   */
  public String getUserId() {
    return userId;
  }

  /**
   * Sets the user ID.
   *
   * @param userId the user ID to set
   */
  public void setUserId(final String userId) {
    this.userId = userId;
  }

  /**
   * Gets the author name.
   *
   * @return the author name
   */
  public String getAuthorName() {
    return authorName;
  }

  /**
   * Sets the author name.
   *
   * @param authorName the author name to set
   */
  public void setAuthorName(final String authorName) {
    this.authorName = authorName;
  }

  /**
   * Gets the rating.
   *
   * @return the rating (1-5)
   */
  public int getRating() {
    return rating;
  }

  /**
   * Sets the rating.
   *
   * @param rating the rating to set (1-5)
   */
  public void setRating(final int rating) {
    this.rating = rating;
  }

  /**
   * Gets the comment.
   *
   * @return the comment
   */
  public String getComment() {
    return comment;
  }

  /**
   * Sets the comment.
   *
   * @param comment the comment to set
   */
  public void setComment(final String comment) {
    this.comment = comment;
  }

  /**
   * Gets the creation timestamp.
   *
   * @return the creation instant
   */
  public Instant getCreatedAt() {
    return createdAt;
  }

  /**
   * Sets the creation timestamp.
   *
   * @param createdAt the creation instant to set
   */
  public void setCreatedAt(final Instant createdAt) {
    this.createdAt = createdAt;
  }
}
