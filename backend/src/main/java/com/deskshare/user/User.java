package com.deskshare.user;

import java.time.Instant;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a user in the DeskShare platform.
 *
 * <p>Users can be customers, space owners, or administrators.
 * This class is designed for extension by subclasses that may add specialized behavior.
 *
 * @see Role
 */
@Document(collection = "users")
public class User {

  @Id
  private String id;

  @Indexed(unique = true)
  private String email;

  private String passwordHash;

  private String firstName;

  private String lastName;

  private String phone;

  @Indexed
  private Role role = Role.CUSTOMER;

  private boolean active = true;

  @CreatedDate
  private Instant createdAt;

  @LastModifiedDate
  private Instant updatedAt;

  /**
   * Default constructor for MongoDB deserialization.
   */
  public User() {
  }

  /**
   * Creates a new User with the specified details.
   *
   * @param email       the user's email address (unique)
   * @param passwordHash the hashed password
   * @param firstName   the user's first name
   * @param lastName    the user's last name
   * @param role        the user's role
   */
  public User(final String email, final String passwordHash, final String firstName,
      final String lastName, final Role role) {
    this.email = email;
    this.passwordHash = passwordHash;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.active = true;
    this.createdAt = Instant.now();
    this.updatedAt = Instant.now();
  }

  /**
   * Gets the unique identifier.
   *
   * @return the user ID
   */
  public String getId() {
    return id;
  }

  /**
   * Sets the unique identifier.
   *
   * @param id the user ID to set
   */
  public void setId(final String id) {
    this.id = id;
  }

  /**
   * Gets the email address.
   *
   * @return the email
   */
  public String getEmail() {
    return email;
  }

  /**
   * Sets the email address.
   *
   * @param email the email to set
   */
  public void setEmail(final String email) {
    this.email = email;
  }

  /**
   * Gets the password hash.
   *
   * @return the password hash
   */
  public String getPasswordHash() {
    return passwordHash;
  }

  /**
   * Sets the password hash.
   *
   * @param passwordHash the password hash to set
   */
  public void setPasswordHash(final String passwordHash) {
    this.passwordHash = passwordHash;
  }

  /**
   * Gets the first name.
   *
   * @return the first name
   */
  public String getFirstName() {
    return firstName;
  }

  /**
   * Sets the first name.
   *
   * @param firstName the first name to set
   */
  public void setFirstName(final String firstName) {
    this.firstName = firstName;
  }

  /**
   * Gets the last name.
   *
   * @return the last name
   */
  public String getLastName() {
    return lastName;
  }

  /**
   * Sets the last name.
   *
   * @param lastName the last name to set
   */
  public void setLastName(final String lastName) {
    this.lastName = lastName;
  }

  /**
   * Gets the phone number.
   *
   * @return the phone number
   */
  public String getPhone() {
    return phone;
  }

  /**
   * Sets the phone number.
   *
   * @param phone the phone number to set
   */
  public void setPhone(final String phone) {
    this.phone = phone;
  }

  /**
   * Gets the user role.
   *
   * @return the role
   */
  public Role getRole() {
    return role;
  }

  /**
   * Sets the user role.
   *
   * @param role the role to set
   */
  public void setRole(final Role role) {
    this.role = role;
  }

  /**
   * Checks if the user is active.
   *
   * @return true if active, false otherwise
   */
  public boolean isActive() {
    return active;
  }

  /**
   * Sets the active status.
   *
   * @param active the active status to set
   */
  public void setActive(final boolean active) {
    this.active = active;
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

  /**
   * Gets the last modification timestamp.
   *
   * @return the last modified instant
   */
  public Instant getUpdatedAt() {
    return updatedAt;
  }

  /**
   * Sets the last modification timestamp.
   *
   * @param updatedAt the last modified instant to set
   */
  public void setUpdatedAt(final Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
