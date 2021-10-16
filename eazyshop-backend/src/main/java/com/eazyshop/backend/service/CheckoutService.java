package com.eazyshop.backend.service;

import com.eazyshop.backend.dto.Purchase;
import com.eazyshop.backend.dto.PurchaseResponse;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);
}
