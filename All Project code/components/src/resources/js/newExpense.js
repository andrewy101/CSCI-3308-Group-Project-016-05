function updateCategoryField(value) {
    const new_category = document.getElementById('new-category');
    if (value === 'Create new category') {
        new_category.hidden = false;
    } else {
        new_category.hidden = true;
    }
}

function addLineItem() {
    const lineItems = document.getElementById('line-items');
    
    const newItem = document.createElement('div');
    newItem.className = 'row mb-3';

    const label = document.createElement('label');
    label.className = 'col-sm-2 form-label';
    label.innerHTML = 'New Line Item';

    newItem.append(label);

    const buttons = document.createElement('div');
    buttons.className = 'col-sm-10';

    const nameField = document.createElement('input');
    nameField.type = 'text';
    nameField.className = 'form-control';
    nameField.placeholder = 'Enter name';

    const amountField = document.createElement('input');
    amountField.type = 'text';
    amountField.className = 'form-control';
    amountField.placeholder = 'Enter amount';

    const xButton = document.createElement('i');
    xButton.className = 'bi bi-trash fa-2x float-end';
    const xButtonWrapper = document.createElement('h3')
    xButtonWrapper.style = 'cursor:pointer;color:red';
    xButtonWrapper.setAttribute('onclick', 'deleteLineItem(this.parentElement.parentElement)');
    xButtonWrapper.append(xButton);

    buttons.append(nameField);
    buttons.append(amountField);
    buttons.append(xButtonWrapper);

    newItem.append(buttons);

    lineItems.append(newItem);
}

function deleteLineItem(itemElement) {
    itemElement.remove();
}

function checkBox(box) {
    if (!box.checked) {
        box.checked = true;
    } else if (box.id === 'isExpense') {
        let other = document.getElementById('isIncome');
        other.checked = false;
    } else {
        let other = document.getElementById('isExpense');
        other.checked = false;
    }
}

function createReceipt() {
    const income = document.getElementById('isIncome').checked ? true : false;
    const date = document.getElementById('date');
    let category = document.getElementById('category');
    category = (category.value.toLowerCase() === 'create new category') ? document.getElementById('new-category-field') : category;
    let input = category.value.toLowerCase();
    if (input === 'create new category' || input === '') {
        alert('Category cannot be "Create new category" or blank.');
        return;
    }
    const description = document.getElementById('description');
    if (description.value === '') {
        alert('Please write a description.');
        return;
    }
    const lineItemsCollection = document.getElementById('line-items').children;
    let lineItems = [];
    let amount = 0;

    for (let i = 0; i < lineItemsCollection.length; i++) {
        const itemName = lineItemsCollection[i].children[1].children[0].value;
        let itemAmount = lineItemsCollection[i].children[1].children[1].value;

        if (itemName === '' || itemAmount === '') {
            alert('Line items must have a name and an amount.');
            return;
        }

        itemAmount = parseFloat(itemAmount);
        if (isNaN(itemAmount)) {
            alert('Invalid numerical input.');
            return;
        }

        lineItems[i] = {
            name: itemName,
            amount: Math.abs(parseFloat(itemAmount.toFixed(2)))
        };
        amount += lineItems[i].amount;
    }

    fetch('/expenses/new', {
        method: 'POST',
        body: JSON.stringify({
            income: income,
            date: date.value,
            category: category.value,
            description: description.value,
            lineItems: lineItems,
            amount: amount
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(res => {
        window.location.href = '/expenses';
    });
}