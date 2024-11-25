import React from "react";
import { render, screen } from "@testing-library/react-native";
import PatientDetails from "../components/PatientDetails.js";

// Mocking the fetch API
global.fetch = jest.fn();

describe("PatientDetails Component", () => {
  const mockRoute = { params: { patientId: "123" } };

  beforeEach(() => {
    fetch.mockClear();
  });

  it("renders loading text initially", () => {
    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ data: null }),
    });

    render(<PatientDetails route={mockRoute} />);

    expect(screen.getByText("Loading patient details...")).toBeTruthy();
  });

  it("renders patient details when data is fetched", async () => {
    const mockPatientData = {
      data: {
        id: "123",
        name: "John Doe",
        age: 45,
        contact: "123-456-7890",
        condition: "Normal",
      },
    };

    fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockPatientData),
    });

    render(<PatientDetails route={mockRoute} />);

    // Waits for patient details to render
    expect(await screen.findByText("Name: John Doe")).toBeTruthy();
    expect(screen.getByText("Age: 45")).toBeTruthy();
    expect(screen.getByText("ID: 123")).toBeTruthy();
    expect(screen.getByText("Contact: 123-456-7890")).toBeTruthy();
    expect(screen.getByText("Condition: Normal")).toBeTruthy();
  });

  it("handles errors gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("Failed to fetch"));

    render(<PatientDetails route={mockRoute} />);

    expect(await screen.findByText("Loading patient details...")).toBeTruthy();
  });
});
