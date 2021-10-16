package com.eazyshop.backend.dao;

import com.eazyshop.backend.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RepositoryRestResource
public interface StateRepository extends JpaRepository<State,Integer> {

    List<State> findByCountryCode(@RequestParam("code") String code);
}
