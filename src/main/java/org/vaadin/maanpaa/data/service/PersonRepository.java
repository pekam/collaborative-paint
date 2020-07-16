package org.vaadin.maanpaa.data.service;

import org.vaadin.maanpaa.data.entity.Person;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonRepository extends JpaRepository<Person, Integer> {

}