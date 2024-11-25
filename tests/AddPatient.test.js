import React from "react";
import { render } from "@testing-library/react-native";
import AddPatient from "../components/AddPatient.js";

describe("AddPatient Component", () => {
  it("renders the Patient Name and Age input fields", () => {
    // Mock navigation and route props
    const navigationMock = { navigate: jest.fn() };
    const routeMock = { params: {} };

    // Render the component with mocked props
    const { getByPlaceholderText } = render(
      <AddPatient navigation={navigationMock} route={routeMock} />
    );

    // Checks if Patient Name input field is rendered
    expect(getByPlaceholderText("Patient Name")).toBeTruthy();

    // Checks if Age input field is rendered
    expect(getByPlaceholderText("Age")).toBeTruthy();
  });
});
