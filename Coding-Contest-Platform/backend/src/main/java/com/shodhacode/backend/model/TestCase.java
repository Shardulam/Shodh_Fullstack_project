package com.shodhacode.backend.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class TestCase {
    private String inputData;
    private String expectedOutput;

    public TestCase() {
    }

    public TestCase(String inputData, String expectedOutput) {
        this.inputData = inputData;
        this.expectedOutput = expectedOutput;
    }

    public String getInputData() {
        return inputData;
    }

    public void setInputData(String inputData) {
        this.inputData = inputData;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }
}
