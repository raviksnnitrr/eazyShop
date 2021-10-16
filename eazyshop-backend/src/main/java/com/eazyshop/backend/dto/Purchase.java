package com.eazyshop.backend.dto;

import com.eazyshop.backend.entity.Address;
import com.eazyshop.backend.entity.Customer;
import com.eazyshop.backend.entity.Order;
import com.eazyshop.backend.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {
    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;

}
