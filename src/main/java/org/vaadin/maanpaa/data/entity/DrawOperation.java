package org.vaadin.maanpaa.data.entity;

public class DrawOperation {

    private String color;
    private Position startPosition;
    private Position endPosition;

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Position getStartPosition() {
        return startPosition;
    }

    public void setStartPosition(Position startPosition) {
        this.startPosition = startPosition;
    }

    public Position getEndPosition() {
        return endPosition;
    }

    public void setEndPosition(Position endPosition) {
        this.endPosition = endPosition;
    }

    @Override
    public String toString() {
        return "DrawOperation{" +
                "color='" + color + '\'' +
                ", startPosition=" + startPosition +
                ", endPosition=" + endPosition +
                '}';
    }
}
