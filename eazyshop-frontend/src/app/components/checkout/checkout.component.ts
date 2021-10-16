import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Customer } from 'src/app/common/customer';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { EazyShopFormService } from 'src/app/services/eazy-shop-form.service';
import { EazyShopValidators } from 'src/app/validators/eazy-shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];
  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];
  storage: Storage=sessionStorage;
  constructor(private formBuilder: FormBuilder, private eazyShopFormServie: EazyShopFormService,private cartService:CartService,private checkoutService:CheckoutService,private router:Router) { }

  ngOnInit(): void {
    const theEmail=JSON.parse(this.storage.getItem('userEmail'));
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), EazyShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), EazyShopValidators.notOnlyWhiteSpace]),
        email: new FormControl(theEmail, [Validators.required, Validators.pattern('^[a-zA-Z0-9_.%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z0-9-.]+$')])
        //"^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, ,Validators.minLength(2),EazyShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2),EazyShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2),EazyShopValidators.notOnlyWhiteSpace]),
        country: new FormControl('', [Validators.required])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2),EazyShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2),EazyShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2),EazyShopValidators.notOnlyWhiteSpace]),
        country: new FormControl('', [Validators.required])
      }),
      creditCardInformation: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, ,Validators.minLength(2),EazyShopValidators.notOnlyWhiteSpace]),
        cardNumber:new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      }),
    });
    this.eazyShopFormServie.getCreditCardYears().subscribe(
      data => {
        this.creditCardYears = data;
      }
    );
    let startMonth = new Date().getMonth() + 1;
    this.eazyShopFormServie.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    )
    this.eazyShopFormServie.getCountries().subscribe(
      resp => {
        this.countries = resp;
      }
    )
    this.reviewCartDetails();
   
  }
  reviewCartDetails(){
    this.cartService.totalPrice.subscribe(
      data=>this.totalPrice=data
    );
    this.cartService.totalQuantity.subscribe(
      data=>this.totalQuantity=data
    );
  }

  handleMonthsAndYears() {
    const creditFormGroup = this.checkoutFormGroup.get('creditCardInformation');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditFormGroup.value.expirationYear);
    let startMonth: number = 1;
    if (currentYear == selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }
    this.eazyShopFormServie.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
      }
    )
  }
  populateStateOnCountry(value: string) {
    const formGroup = this.checkoutFormGroup.get(value);
    let selectedCountry: Country = formGroup.value.country;
    this.eazyShopFormServie.getStatesFromCountryCode(selectedCountry.code).subscribe(
      data => {
        if (value.startsWith('shipping')) {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }
        formGroup.get('state').setValue(data[0]);
      }
    )
  }
  resetCart(){
    //reset cart data
    this.cartService.cartItems=[];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.computeCartTotal();
    //reset form
    this.checkoutFormGroup.reset();
    //navigate back to products page
    this.router.navigateByUrl("/products");
  }
  onSubmit() {
    console.log("handling form submission")
    console.log(this.checkoutFormGroup.get('customer').value);
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    //set up order
    let order=new Order();
    order.totalPrice=this.totalPrice;
    order.totalQuantity=this.totalQuantity;
    //get cart items
    const cartItems=this.cartService.cartItems;
    //create orderItems from cartItems
    let orderItems:OrderItem[]=[];
    orderItems=cartItems.map(rec=>new OrderItem(rec));
    //setup purchase
    let purchase=new Purchase();
    //populate customer in purchase
    purchase.customer=this.checkoutFormGroup.controls['customer'].value;
    //populate shipping and billing address-purchase
    purchase.shippingAddress=this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState:State=JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry:Country=JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state=shippingState.name;
    purchase.shippingAddress.country=shippingCountry.name;
    purchase.billingAddress=this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState:State=JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry:Country=JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state=billingState.name;
    purchase.billingAddress.country=billingCountry.name;
    //populate order and order item-purchase
    purchase.order=order;
    purchase.orderItems=orderItems;
    //call rest api via checkout service

    this.checkoutService.placeOrder(purchase).subscribe({
        next: response=>{
          alert(`Your order has been received.\nOrder Tracking Number: ${response.orderTrackingNumber}`);
          //reset cart
          this.resetCart();
        },
        error: err=>{
          alert(`There was an error: ${err.message}`);
        }
      });
  }
  copyShippingAddressToBillingAddress(event) {
    if (event.target.checked) {
      this.billingAddressStates = this.shippingAddressStates;
      this.checkoutFormGroup.controls.billingAddress.setValue(this.checkoutFormGroup.controls.shippingAddress.value);
    } else {
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingAddressStates = [];
    }
  }
  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }
  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }

  get cardType() { return this.checkoutFormGroup.get('creditCardInformation.cardType'); }
  get nameOnCard() { return this.checkoutFormGroup.get('creditCardInformation.nameOnCard'); }
  get cardNumber() { return this.checkoutFormGroup.get('creditCardInformation.cardNumber'); }
  get securityCode() { return this.checkoutFormGroup.get('creditCardInformation.securityCode'); }


}
