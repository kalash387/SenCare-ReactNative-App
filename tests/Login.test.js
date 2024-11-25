import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import LoginScreen from "../components/Login.js";

describe("LoginScreen Component", () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  it("renders the login form correctly", () => {
    render(<LoginScreen navigation={mockNavigation} />);

    expect(screen.getByPlaceholderText("Username")).toBeTruthy();
    expect(screen.getByPlaceholderText("Password")).toBeTruthy();
    expect(screen.getByText("Login")).toBeTruthy();
  });

  it("displays an alert for invalid login credentials", () => {
    render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.changeText(screen.getByPlaceholderText("Username"), "wrongUser");
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "wrongPass");
    fireEvent.press(screen.getByText("Login"));

    expect(global.alert).toHaveBeenCalledWith("Invalid login credentials");
  });

  it("navigates to PatientList on successful login", () => {
    render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.changeText(screen.getByPlaceholderText("Username"), "test");
    fireEvent.changeText(screen.getByPlaceholderText("Password"), "test");
    fireEvent.press(screen.getByText("Login"));

    expect(mockNavigation.navigate).toHaveBeenCalledWith("PatientList");
  });
});
