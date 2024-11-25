import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import PatientList from "../components/PatientList.js";

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

describe("PatientList Component", () => {
  // Mock the fetch function
  beforeAll(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            data: [{ id: 1, name: "John Doe", condition: "Normal" }],
          }),
      })
    );
  });

  it("renders correctly", async () => {
    render(<PatientList navigation={mockNavigation} />);

    // Wait for the component to finish loading and render the patients
    await waitFor(() => expect(screen.getByText("John Doe")).toBeTruthy());

    // checks if search bar is rendered
    expect(screen.getByPlaceholderText("Search by name or ID")).toBeTruthy();
    // Check if the Add Patient button is rendered
    expect(screen.getByText("Add Patient")).toBeTruthy();
  });

  it("filters patients based on search query", async () => {
    // Mock patient data
    const mockData = [
      { id: 1, name: "John Doe", condition: "Normal" },
      { id: 2, name: "Jane Smith", condition: "Critical" },
    ];

    // Mock the fetch function
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: mockData }),
      })
    );

    render(<PatientList navigation={mockNavigation} />);

    // Waits for data to be fetched and rendered
    await waitFor(() => expect(screen.getByText("John Doe")).toBeTruthy());

    // Check if both patient names are initially rendered
    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText("Jane Smith")).toBeTruthy();

    //search query
    fireEvent.changeText(
      screen.getByPlaceholderText("Search by name or ID"),
      "John"
    );

    // Check if only correct name is shown after search
    expect(screen.queryByText("Jane Smith")).toBeNull();
    expect(screen.getByText("John Doe")).toBeTruthy();
  });
});
