package com.deskshare.space;

/**
 * Represents a physical address.
 *
 * <p>This class is designed for extension by subclasses that may add specialized behavior.
 */
public class Address {

  private String street;

  private String city;

  private String state;

  private String postalCode;

  private String country;

  /**
   * Default constructor.
   */
  public Address() {
  }

  /**
   * Creates a new Address with the specified details.
   *
   * @param street     the street address
   * @param city       the city
   * @param state      the state or province
   * @param postalCode the postal code
   * @param country    the country
   */
  public Address(final String street, final String city, final String state,
      final String postalCode, final String country) {
    this.street = street;
    this.city = city;
    this.state = state;
    this.postalCode = postalCode;
    this.country = country;
  }

  /**
   * Gets the street address.
   *
   * @return the street
   */
  public String getStreet() {
    return street;
  }

  /**
   * Sets the street address.
   *
   * @param street the street to set
   */
  public void setStreet(final String street) {
    this.street = street;
  }

  /**
   * Gets the city.
   *
   * @return the city
   */
  public String getCity() {
    return city;
  }

  /**
   * Sets the city.
   *
   * @param city the city to set
   */
  public void setCity(final String city) {
    this.city = city;
  }

  /**
   * Gets the state or province.
   *
   * @return the state
   */
  public String getState() {
    return state;
  }

  /**
   * Sets the state or province.
   *
   * @param state the state to set
   */
  public void setState(final String state) {
    this.state = state;
  }

  /**
   * Gets the postal code.
   *
   * @return the postal code
   */
  public String getPostalCode() {
    return postalCode;
  }

  /**
   * Sets the postal code.
   *
   * @param postalCode the postal code to set
   */
  public void setPostalCode(final String postalCode) {
    this.postalCode = postalCode;
  }

  /**
   * Gets the country.
   *
   * @return the country
   */
  public String getCountry() {
    return country;
  }

  /**
   * Sets the country.
   *
   * @param country the country to set
   */
  public void setCountry(final String country) {
    this.country = country;
  }
}
