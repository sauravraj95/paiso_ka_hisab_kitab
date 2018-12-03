// BUDGET CONTROLLER
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value
    };

    var calculateToatl = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }


    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            // create new id
            if (data.allItems[type].length > 0) {

                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create new item based on inc and exp type 
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //and then push it into our data structre
            data.allItems[type].push(newItem);
            // return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;
            var ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        testing: function () {
            console.log(data);
        },
        calculateBudget: function () {
            // claculate the income and expenses
            calculateToatl('exp');
            calculateToatl('inc');
            // calculate the budget :income - expences
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        }
    };

})();


// UI CONTROLLER
var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabels: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    var formateNumber = function (num, type) {
        var numSplit, int, dec, type;
        /* 
        + or - before the num
        exactly 2 decimal points
        comma separating the thousands
        q= 1234567 op 12,34,567
        */
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3 && int.length < 6) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        } 
        // else if (int.length > 5) {
        //     int = int.substr(0, int.length - 5) + ',' + int.substr(int.length - 4, int.length - 2) + ',' + int.substr(int.length - 3, 3);
        // }
        dec = numSplit[1];
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    // 1. get the input field data
    return {
        getInput: function () {
            return {
                // created method for returning the value of input field
                type: document.querySelector(DOMstrings.inputType).value,  // will be either "inc" or "exp"
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        getDOMstrings: function () {
            return DOMstrings;
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create html string with place holder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__percentage">21%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div></div><div>'
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formateNumber(obj.value, type));
            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function () {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputValue + ', ' + DOMstrings.inputDescription);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();

        },
        displayBudget: function (obj) {
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formateNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formateNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formateNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabels).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabels).textContent = '---'
            }

        },
        displayMonth: function () {
            var now, year, month, months;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'Julu', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year
        },
        changeType: function () {
            var fileds = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            nodeListForEach(fileds, function (current) {
                current.classList.toggle('red-focus')
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
        },

        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);  // returs node list

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            })
        },


    };

})();


// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    var setupEventListners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    }
    var updateBudget = function () {
        // 1. Calculate budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget on UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentage = function () {

        // 1. Calculate Percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the bugdet controller
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };
    var ctrlAddItem = function () {

        var input, newItem;
        // 1. get the input field data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add new items to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)
            // 3. add the new item to UI
            UICtrl.addListItem(newItem, input.type);
            // 4. Clear the fields
            UICtrl.clearFields();
            // 5. Calculate and update the budget
            updateBudget();
            // 6. Calculate and Update percentage
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show  the new budget
            updateBudget();
            // 4. Calculate and Update percentage
            updatePercentage();
        }
    };

    return {
        init: function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListners();

        }
    };


})(budgetController, UIController);

controller.init();


































