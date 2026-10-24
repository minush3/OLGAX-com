package com.olgax.hr.controller;

import com.olgax.hr.model.Position;
import com.olgax.hr.repository.PositionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/positions")
@CrossOrigin(origins = "*")
public class PositionController {

    @Autowired
    private PositionRepository positionRepository;

    @GetMapping
    public List<Position> getAllPositions() {
        return positionRepository.findAll();
    }

    @PostMapping
    public Position createPosition(@RequestBody Position position) {
        return positionRepository.save(position);
    }
}
