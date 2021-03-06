package org.vaadin.maanpaa.data.entity;

import java.util.Optional;

public class CursorInfo {

    private String id;
    private String name;
    private String color;
    private Optional<Position> position;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Optional<Position> getPosition() {
        return position;
    }

    public void setPosition(Optional<Position> position) {
        this.position = position;
    }
}
