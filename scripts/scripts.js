const Export = {
    pdf(event){
        const data = new Date();
        const dataFormatada = ((data.getDate() )) + "/" + ((data.getMonth() + 1)) + "/" + data.getFullYear(); 
        $("#table-transactions").btechco_excelexport({
            containerid: "table-transactions"
           , datatype: $datatype.Table
           , filename: 'Transação do dia: ' + dataFormatada
        });
        event.preventDefault()
    }
}

const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },
    remove(index){
        Transaction.all.splice(index , 1);

        App.reload();
    },
    incomes(){
        let incomes = 0;

        Transaction.all.forEach(transaction => {
            if( transaction.amount > 0){
                incomes += transaction.amount;
            }
        });
        return incomes;
    },
    expenses(){
        let expenses = 0;

        Transaction.all.forEach(transaction => {
            if( transaction.amount < 0){
                expenses += transaction.amount;
            }
        });
        return expenses;
    },
    total(){
        return Transaction.incomes() + Transaction.expenses();
    }
};

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index){
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransition(transaction, index);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr);
    },
    innerHTMLTransition(transaction, index){
        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
        <tr>
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        </tr>
        `
        return html;
    },
    updateTotal(totalCard){

        document
            .getElementById('total-display')
            .innerHTML = Utils.formatCurrency(Transaction.total());

        if(Transaction.total() > 0){
            if(totalCard.classList.contains('red')){
                totalCard.classList.remove('red');
            }
            totalCard.classList.add('green');
        }
        else if(Transaction.total() < 0) {
            if(totalCard.classList.contains('green')){
                totalCard.classList.remove('green');
            }
            totalCard.classList.add('red');
        }
        else{
            if(totalCard.classList.contains('green')){
                totalCard.classList.remove('green');
            }
            if(totalCard.classList.contains('red')){
                totalCard.classList.remove('red');
            }
        }
    },
    updateBalance() {
        document
            .getElementById('income-display')
            .innerHTML = Utils.formatCurrency(Transaction.incomes());

        document
            .getElementById('expense-display')
            .innerHTML = Utils.formatCurrency(Transaction.expenses());

        const totalCard = document.querySelector('.card.total');
        
        DOM.updateTotal(totalCard);
        
    },
    clearTransaction() {
        DOM.transactionsContainer.innerHTML = "";
    }
}


const Utils = {
    formatAmount(value){
        return (Number(value) * 100);
    },
    formatDate(date){
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        return (signal + value);
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    plusSignal(){
        const incomeBtn = document.querySelector('#income-btn-sm');
        incomeBtn.classList.add('active');
        const expenseBtn = document.querySelector('#expense-btn-sm');
        try {
            if(expenseBtn.classList.contains('active')){
                expenseBtn.classList.remove('active');
            }
            if(!Form.amount.value){
                if(incomeBtn.classList.contains('active')){
                    incomeBtn.classList.remove('active');
                }
                throw new Error("Preencha o valor antes");
            }else {
                if(Form.amount.value < 0){
                    Form.amount.value *= -1;
                }
            }
        } catch (error) {
            alert(error);
        }
    },
    minusSignal(){
        const expenseBtn = document.querySelector('#expense-btn-sm');
        expenseBtn.classList.add('active');
        const  incomeBtn= document.querySelector('#income-btn-sm');
        try {
            if(incomeBtn.classList.contains('active')){
                incomeBtn.classList.remove('active');
            }
            if(!Form.amount.value){
                if(expenseBtn.classList.contains('active')){
                    expenseBtn.classList.remove('active');
                }
                throw new Error("Preencha o valor antes");
            }else {
                if(Form.amount.value > 0){
                    Form.amount.value *= -1;
                }
            }
        } catch (error) {
            alert(error);
        }
    },
    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    formatValues(){
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },
    validateFields(){
        const { description, amount, date } = Form.getValues();

        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Preencha todos os campos")
        }
    },
    clearFields(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },
    submit(event){
        event.preventDefault();

        try {
            Form.validateFields();

            const transaction = Form.formatValues();

            Transaction.add(transaction);

            Form.clearFields();

            const incomeBtn = document.querySelector('#income-btn-sm');
            if(incomeBtn.classList.contains('active')){
                incomeBtn.classList.remove('active');
            }

            const expenseBtn = document.querySelector('#expense-btn-sm');
            if(expenseBtn.classList.contains('active')){
                expenseBtn.classList.remove('active');
            }

            Modal.close();
        } catch (error) {
            alert(error.message)
        }

    }
};


const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);

        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransaction();
        App.init();
    }
}

App.init();

