Feature: Create custom dashboard
  Custom dashboards are created or imported by the current user. It is a convenient way to graphically show data.

  Scenario: Successful creation of a custom dashboard
    Given John Doe is logged in OpenCTI
    When John Doe create a custom dashboard named My first dashboard
    Then the custom dashboard is created
    And its name is My first dashboard