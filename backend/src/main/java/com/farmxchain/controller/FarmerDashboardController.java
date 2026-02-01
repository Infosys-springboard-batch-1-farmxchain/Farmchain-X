package com.farmxchain.controller;

import com.farmxchain.model.Order;
import com.farmxchain.model.Product;
import com.farmxchain.repository.OrderRepository;
import com.farmxchain.repository.ProductRepository;
import com.farmxchain.repository.UserRepository;
import com.farmxchain.security.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/farmer")
@CrossOrigin(origins = "*")
public class FarmerDashboardController {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    public FarmerDashboardController(
            OrderRepository orderRepo,
            ProductRepository productRepo,
            UserRepository userRepo,
            JwtUtil jwtUtil
    ) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(
            @RequestHeader("Authorization") String auth
    ) {
        String token = auth.replace("Bearer ", "");
        String farmerId = jwtUtil.extractUniqueId(token);

        List<Order> orders = orderRepo.findByFarmerUniqueId(farmerId);
        List<Product> crops = productRepo.findByFarmerUniqueId(farmerId);

        double totalSales = orders.stream()
                .filter(o -> "DELIVERED".equals(o.getStatus()))
                .mapToDouble(Order::getTotalPrice)
                .sum();

        long ordersToday = orders.stream()
                .filter(o -> o.getCreatedAt().toLocalDate().equals(LocalDate.now()))
                .count();

        long activeCrops = crops.stream()
                .filter(c -> "AVAILABLE".equals(c.getStatus()))
                .count();

        long lowStock = crops.stream()
                .filter(c -> c.getQuantity() < 10)
                .count();

        Map<String, Object> res = new HashMap<>();
        res.put("totalSales", totalSales);
        res.put("ordersToday", ordersToday);
        res.put("activeCrops", activeCrops);
        res.put("lowStock", lowStock);

        return res;
    }
}
