package com.eazyshop.backend.service;

import com.eazyshop.backend.entity.Customer;
import com.eazyshop.backend.dao.CustomerRepository;
import com.eazyshop.backend.dto.Purchase;
import com.eazyshop.backend.dto.PurchaseResponse;
import com.eazyshop.backend.entity.Order;
import com.eazyshop.backend.entity.OrderItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
public class CheckoutServiceImpl implements CheckoutService{

    private CustomerRepository customerRepository;

    @Autowired
    public CheckoutServiceImpl(CustomerRepository customerRepository){
        this.customerRepository=customerRepository;
    }
    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {
        //retrieve the order info from dto
        Order order=purchase.getOrder();
        //generate tracking number
        String orderTrackingNumber=generateOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);
        //populate order with orderitems
        Set<OrderItem> orderItems=purchase.getOrderItems();
        orderItems.forEach(orderItem -> order.add(orderItem));
        //populate order with billingaddress
        order.setShippingAddress(purchase.getShippingAddress());
        //populate order with shipping address
        order.setBillingAddress(purchase.getBillingAddress());
        //populate customer with order
        Customer customer= purchase.getCustomer();

        String email=customer.getEmail();
        Customer customerFromDb=customerRepository.findByEmail(email);
        if(customerFromDb!=null){
            customer=customerFromDb;
        }
        customer.addOrder(order);
        //save to database
        this.customerRepository.save(customer);
        return new PurchaseResponse(orderTrackingNumber);
    }

    private String generateOrderTrackingNumber() {
        //generate random uuid(uuid-version4)
        return UUID.randomUUID().toString();
    }
}
