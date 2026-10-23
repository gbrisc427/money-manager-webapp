package com.money.manager.webapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "savings_goals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavingsGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal targetAmount; // La meta

    @Column(nullable = false)
    private BigDecimal currentAmount; // Lo que llevas

    private LocalDate deadline; // Fecha límite (Opcional)

    private String color; // Para que se vea bonito en el front

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}