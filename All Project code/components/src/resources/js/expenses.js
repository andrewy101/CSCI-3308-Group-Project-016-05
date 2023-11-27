function checkBoxHandler(checkBox) {
    const idx = parseInt(checkBox.getAttribute('idx'));
    const index = checkedRows.indexOf(checkBox);
    if (checkBox.checked) {
        if (index < 0) {
            checkedRows.push(checkBox);
        }
    } else {
        if (index >= 0) {
            checkedRows.splice(index, 1);
        }
    }
    
    const xButton = document.getElementById('delete-button');
    if (checkedRows.length > 0) {
        xButton.hidden = false;
    } else {
        xButton.hidden = true;
    }
}

function checkAll(checkBox) {
    const checkBoxes = document.getElementsByClassName('individual-check-box');

    if (checkBox.checked) {
        checkedRows.length = 0;
        for (let i = 0; i < checkBoxes.length; i++) {
            checkBoxes[i].checked = true;
            checkedRows.push(checkBoxes[i]);
        }
    } else {
        for (let i = 0; i < checkBoxes.length; i++) {
            checkBoxes[i].checked = false;
        }
        checkedRows.length = 0;
    }

    const xButton = document.getElementById('delete-button');
    if (checkedRows.length > 0) {
        xButton.hidden = false;
    } else {
        xButton.hidden = true;
    }
}

function deleteRows() {
    let receipt_ids = [];
    for (let i = 0; i < checkedRows.length; i++) {
        receipt_ids.push(checkedRows[i].parentElement.parentElement.id);
    }
    fetch('/expenses/delete', {
        method: 'POST',
        body: JSON.stringify({
            receipt_ids: receipt_ids
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(res => {
        window.location.href = '/expenses';
    });;
}

function requestInfo(row) {
    const receipt = row.parentElement.parentElement;
    fetch('/expenses/info?' + new URLSearchParams({
        id: receipt.id
    }))
    .then(res => {
        res.json().then(data => {
            const items = data.items;
            const body = document.getElementById('modal-rows');
            const total = document.getElementById('modal-total');
            const date = document.getElementById('modal-date');
            while(body.firstChild) {
                body.removeChild(body.lastChild);
            }
            for (let i = 0; i < items.length; i++) {
                const entry = document.createElement('tr');

                const name = document.createElement('td');
                name.className = 'row-data';
                name.innerHTML = items[i].name;

                const amount = document.createElement('td');
                amount.className = 'row-data';
                amount.innerHTML = '$' + items[i].amount.toFixed(2);
                amount.style = receipt.children[4].getAttribute('style');

                entry.append(name);
                entry.append(amount);
                body.append(entry);
            }

            total.innerHTML = receipt.children[4].innerHTML;
            total.style = receipt.children[4].getAttribute('style');
            date.innerHTML = receipt.children[1].innerHTML;
            EVENT_MODAL.show();
        });
    });
}