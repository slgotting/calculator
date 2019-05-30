

let currentEntry = null;
let maxResultChars = 13;
let maxOperationChars = 24;
let operands = [];
let operators = [];
let operation = '';
let resultsText = document.querySelector('#calculated-result');
let operationText = document.querySelector('#operation-text');
let buttons = document.querySelector('#buttons');

const OPERATORVALUES = {
    '+': 13,
    '-': 13,
    '*': 14,
    '/': 14,
}

const MATHFUNCS = {
    '+': function(x, y) { return Math.round((x + y) * 1000) / 1000 },
    '-': function(x, y) { return Math.round((x - y) * 1000) / 1000 },
    '/': function(x, y) { return Math.round((x / y) * 1000) / 1000 },
    '*': function(x, y) { return Math.round((x * y) * 1000) / 1000 },
}

const OPERATORS = ['+','-','*','/'];
const OPERANDS = ['0','1','2','3','4','5','6','7','8','9','.'];


Array.prototype.replaceLast = function(newVal) {
    this.pop();
    this.push(newVal);
}

class Operand {
    constructor(value) {
        if (value != undefined) {
            this.hasDecimal = false;
            this.decimalCheck(value);
            this.value = value;
            this.decimalCheck = this.decimalCheck.bind(this);
            this.exponentialForm = parseFloat(this.value).toExponential(7);
        }
    }

    append (value) {
        if (this.decimalCheck(value) == false){
            this.value+=value;
        } else {
            if (this.hasDecimal == false) {
                this.value+=value;
                this.hasDecimal = true;
            }
        }
    }

    setExponentialForm () {
        this.exponentialForm = parseFloat(this.value).toExponential(7);
        return this.exponentialForm;
    }

    del () {
        let removedVal = this.value.slice(this.value.length - 1, this.value.length);
        this.value = this.value.slice(0, -1);
        if (removedVal == '.') {
            this.hasDecimal = false;
        }
    }

    decimalCheck (value) {
        if (value.includes('.')) return true
        else return false
    }

}

function handleDelete () {
    updateOperation('del')
}

function handleOperator (operator) {
    if (operation.length >= maxOperationChars) {
        alert(`Current model only accepts up to ${maxOperationChars} characters per operation`);
        return;
    }
    if (currentEntry == 'operator') {
        operators.replaceLast(operator);
    } else if (currentEntry == 'operand') {
        operators.push(operator);
    } else return;
    currentEntry = 'operator';
    updateOperation('add');
}

function handleOperand (operand) {
    if (operation.length >= maxOperationChars) {
        alert(`Current model only accepts up to ${maxOperationChars} characters per operation`);
        return;
    }

    if (currentEntry == 'operand') {
        operands[operands.length - 1].append(operand);
    } else if (currentEntry == 'operator' || currentEntry == null) {
        operands.push(new Operand(operand));
    }
    currentEntry = 'operand';
    updateOperation('add');
}

function handlePlusMinus() {
    if (currentEntry == 'operand') {
        operands[operands.length-1] = new Operand((-operands[operands.length-1].value).toString());
        updateOperation();
    }
}

function clearCalculator() {
    operation = '';
    operators = [];
    operands = [];
    currentEntry = null;
    updateOperationHTML(operation);
    updateResultsHTML(operation);
}

function updateOperation(option) {

    if (option == 'del') {
        if (currentEntry == 'operand') {
            if (operands[operands.length -1].value.length == 1) {
                operands.pop()
                currentEntry = 'operator';
            }
            else operands[operands.length - 1].del()
        } else if (currentEntry == 'operator') {
            operators.pop();
            currentEntry = 'operand';
        }
    }
    createOperationText();
    updateOperationHTML(operation);
}

function createOperationText() {
    operation = '';
    let operatorAdded = false;
    for (i=0; i<operands.length; i++) {
        if (operands[i] != undefined) {
            if (operatorAdded == true) {
                operation+=' ';
            }
            operation+=operands[i].value;
        }
        if (operators[i] != undefined) {
            operation+=` ${operators[i]}`;
            operatorAdded = true;
        } else operatorAdded = false;
    }
}

function updateOperationHTML(operation) {
    operationText.innerText = operation;
}

function updateResultsHTML(results) {
    resultsText.innerText = results;
}

function calculate() {
    let operatorValues = operators.map((operator) => OPERATORVALUES[operator])
    let sortedOperatorValues = operatorValues.slice(0).sort().reverse();
    while (operands.length > 1) {
        let index = operatorValues.indexOf(
            sortedOperatorValues.shift()
        )
        let newValue = MATHFUNCS[operators[index]](
            parseFloat(operands.splice(index, 1)[0].value), parseFloat(operands.splice(index, 1)[0].value)
        )
        let newOperand = new Operand(newValue.toString())
        newOperand.hasDecimal = true;
        operands.splice(index, 0, newOperand);
        operators.splice(index, 1);
        operatorValues.splice(index, 1);
    }
    operators = [];
    createOperationText();

    if (operation.length >= 13) {
        operation = convertToSciNotation(parseFloat(operation));
        updateOperationHTML(operation);
        updateResultsHTML(operation);
    } else {
        updateOperationHTML(operation);
        updateResultsHTML(operation);
    }
    currentEntry = 'operand';
    
}

function convertToSciNotation(number) {
    console.log(number.toExponential(8));
    return number.toExponential(8).toString();
}

function handleEvent (e) {
    let key;
    if (e.type == 'click') {
        key = clickHandler(e);
    } else if (e.type == 'keypress') {
        key = keyPressHandler(e);
    }
    if (key == undefined) {
        return
    }

    (OPERANDS.includes(key)) ?  handleOperand(key) :
    (OPERATORS.includes(key)) ? handleOperator(key) : 
    (key == 'CLEAR') ?          clearCalculator() : 
    (key == 'DEL') ?            handleDelete() : 
    (key == '+/-') ?            handlePlusMinus() : 
    (key == '=') ?              calculate() : null; 
}

function clickHandler (e) {
    return e.target.innerText;
}

function keyPressHandler (e) {
    if (e.keyCode == '13') {
        e.preventDefault()
    }
    let key = document.querySelector(`button[data-key="${e.keyCode}"]`);
    if (key != null) {
        return key.innerText;
    }
}


function testFunc () {
    handleOperator('+')
    handleOperand('7')
    handleOperator('+')
    handleOperand('3')
    handleOperator('*')
    handleOperand('156')
    handleOperator('-')
}

buttons.addEventListener('click', handleEvent)
window.addEventListener('keypress', handleEvent)