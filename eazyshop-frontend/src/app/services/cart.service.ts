import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems:CartItem[]=[];
  storage: Storage = localStorage;
  totalPrice: Subject<number>=new BehaviorSubject<number>(0);
  totalQuantity: Subject<number>=new BehaviorSubject<number>(0);

  constructor() { 
    let data= JSON.parse(this.storage.getItem('cartItems'));
    if(data!=null){
      this.cartItems=data;
      this.computeCartTotal();
    }
  }

  addToCart(cartIem:CartItem){
    //check if item already exist in cart
    let alreadyExistIncart:boolean=false;
    let ind=-1;
    if(this.cartItems.length>0){
    //find the item in cart based on id
    ind=this.cartItems.findIndex(rec=>rec.id==cartIem.id);
    //check if we found it
    alreadyExistIncart=(ind>=0);
    }
    if(alreadyExistIncart){
      this.cartItems[ind].quantity++;
    }else{
      this.cartItems.push(cartIem);
    }
    //computeCartTotal
    this.computeCartTotal();
    this.logValues();
  }
  computeCartTotal(){
    let totalPriceValue:number=0;
    let totalQuantityValue:number=0;
    for(let cartItem of this.cartItems){
      totalPriceValue+=cartItem.unitPrice*cartItem.quantity;
      totalQuantityValue+=cartItem.quantity;
    }
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
    this.persistCartITems();
  }
  logValues(){
    for(let cartItem of this.cartItems){
      let subPrice=cartItem.quantity*cartItem.unitPrice;
      console.log(`${cartItem.name} ${cartItem.quantity} ${cartItem.unitPrice} ${subPrice}`)
    }
  }
 decrementFromCart(cartItem:CartItem){
    
        cartItem.quantity--;
        if(cartItem.quantity==0){
          this.removeFromCart(cartItem);
        }
        else{
    this.computeCartTotal();
        }
  }
  removeFromCart(cartItem:CartItem){
    const ind=this.cartItems.findIndex(rec=>rec.id==cartItem.id);
    this.cartItems.splice(ind,1);
    this.computeCartTotal();
  }
  persistCartITems(){
    this.storage.setItem('cartItems',JSON.stringify(this.cartItems));
  }
}
