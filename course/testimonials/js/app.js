(function(){

    let customers = [];
    let index = 0;
    // object constructor function
    function Customer(name, img, text) {
     this.name = name;
     this.img = img;
     this.text = text
    }
    // create objects function
   
    function createCustomer(name, img, text) {
     // full img
     let fullImg = `img/customer-${img}.jpg`;
     // create new customer instance
     const customer = new Customer(name, fullImg, text);
     // add to customers
     customers.push(customer);
   
    }
    // call function
    createCustomer('john', 1, `Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam sit voluptatum illo? Quae fugi aspernatur harum aperiam, quis eos officia.`)
    createCustomer('bob', 2, `Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam sit voluptatum illo? Quae fugiat aspernatur harum aperiam, quis eos officia.`)
    createCustomer('peter', 3, `Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam sit voluptatum illo? Quae fugiataspernatur harum aperiam, quis eos officia.`)
    createCustomer('arnold', 4, `Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam sit voluptatum illo? Quae fugiat aspernatur harum aperiam, quis eos officia.`)
    function fillContent(){
        const customerName = document.getElementById('customer-name');
        const customerImg = document.getElementById('customer-img');
        const customerText = document.getElementById('customer-text');
        customerName.textContent = customers[index].name;
        customerText.textContent = customers[index].text;
       // customerImg.setAttribute('src',customers[index].img);
       customerImg.src = customers[index].img;
    }
    fillContent();
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener("click", function(event){
        event.preventDefault();
        const value = event.target.parentElement;
        console.log(value);
        if(value.classList.contains('prevBtn')){
           index--;
           if(index < 0){
               index = customers.length -1;
           }
        } else if(value.classList.contains('nextBtn')){
           index++;
           if(index > customers.length -1){
               index = 0;
           }
        }
        fillContent();
      });
   });
})();