(function($) {

    $.fn.dropdown = function(params = {}) {
        var _this = this;

        for (var i = 0; i < this.length; i++) {
            var model = new DropdownModel(params);
            var view = new DropdownView($(this[i]));

            _this.controller = new DropdownController(view, model);
        }

    }

})(jQuery);

function Event() {
    this.listeners = [];
}

Event.prototype.add = function(listener) {
    this.listeners.push(listener);
}

Event.prototype.manage = function(args = {}) {
    for (var i = 0; i < this.listeners.length; i++) {
        return this.listeners[i](args);
    }
}



function DropdownController(DropdownView, DropdownModel) {
    this.DropdownView = DropdownView;
    this.DropdownModel = DropdownModel;

    this.init();
    this.DropdownView.setPlaceholder(this.DropdownModel.updatePlaceholder());
}

DropdownController.prototype.init = function() {
    this.DropdownView.createDropdown(this.DropdownModel.getParamData());

    var _this = this;

    this.DropdownView.onReducing.add(function(target) {
        _this.reduceValue(target);
    });

    this.DropdownView.onIncreasing.add(function(target) {
        _this.increaseValue(target);
    });

    this.DropdownView.onClosingAndOpening.add(function() {
        _this.closeAndOpen();
    });

    this.DropdownView.onClearing.add(function() {
        _this.clear();
    });
}

DropdownController.prototype.reduceValue = function(target) {
    this.DropdownModel.amount--;
    var index = parseInt(target.parentNode.getAttribute("data-index"));
    this.DropdownModel.options[index].value--;
    var newValue = this.DropdownModel.options[index].value;
    target.parentNode.children[1].innerHTML = newValue;
    if (newValue == this.DropdownModel.options[index].min) {
        target.classList.add("disabled");
    }
    target.parentNode.children[2].classList.remove("disabled");
    this.DropdownView.setPlaceholder(this.DropdownModel.updatePlaceholder());
}

DropdownController.prototype.increaseValue = function(target) {
    this.DropdownModel.amount++;
    var index = parseInt(target.parentNode.getAttribute("data-index"));
    this.DropdownModel.options[index].value++;
    var newValue = this.DropdownModel.options[index].value;
    target.parentNode.children[1].innerHTML = newValue;
    if (newValue == this.DropdownModel.options[index].max) {
        target.classList.add("disabled");
    }
    target.parentNode.children[0].classList.remove("disabled");
    this.DropdownView.setPlaceholder(this.DropdownModel.updatePlaceholder());
}

DropdownController.prototype.closeAndOpen = function() {
    this.DropdownView.$dropdown.toggleClass("default");
    this.DropdownView.$dropdown.toggleClass("extended");
}

DropdownController.prototype.clear = function() {
    this.DropdownView.$dropdown.find(".dropdown-input").val(this.DropdownModel.placeholder);
    this.DropdownView.$dropdown.find(".option-less").removeClass("disabled").addClass("disabled");
    this.DropdownView.$dropdown.find(".option-more").removeClass("disabled");
    var amounts = this.DropdownView.$dropdown.find(".option-amount");
    for(var i = 0; i < amounts.length; i++) {
        amounts[i].innerHTML = this.DropdownModel.options[i].min;
        this.DropdownModel.options[i].value = this.DropdownModel.options[i].min;
    }
    this.DropdownModel.amount = this.DropdownModel.minAmount;
}



function DropdownView($container) {
    this.$container = $container;
    this.$dropdown = undefined;

    this.onReducing = new Event();
    this.onIncreasing = new Event();
    this.onClosingAndOpening = new Event();
    this.onClearing = new Event();

    var $mark = $('<div style="height: 44px;"></div>');
    $container.append($mark);
    this.pos = $mark.position();
}

DropdownView.prototype.createDropdown = function(params) {
    var dropdown = '<div style="left: ' + this.pos.left + 'px; top: ' + this.pos.top + 'px;" class="';
    if (params.specClass != undefined)
        dropdown += params.specClass + '-dropdown ';
    
    dropdown += 'dropdown default"><div class="dropdown-head"><div class="expand arrow-after"></div><input readonly="readonly" type="text" name="';

    if (params.specClass != undefined)
        dropdown += params.specClass;
    else
        dropdown += 'dropdown';

    dropdown += '" class="dropdown-input search-param-input search-';

    if (params.specClass != undefined)
        dropdown += params.specClass;

    dropdown += '" data-size="';

    if (params.dataSize != undefined)
        dropdown += params.dataSize;
    else
        dropdown += 'short';

    dropdown += '" value="';

    if (params.placeholder != undefined)
        dropdown += params.placeholder;
    
    dropdown += '"/></div><div class="dropdown-body">';

    if (params.options != undefined) {
        for (var i = 0; i < params.options.length; i++) {
            dropdown += '<div class="dropdown-option"><div class="option-title">' + params.options[i].title + '</div><div class="option-buttons" data-index="' + i + '"><div class="option-less option-btn disabled">-</div><div class="option-amount">';
            
            if (params.options[i].value != undefined)
                dropdown += params.options[i].value;
            else
                dropdown += '0';

            dropdown += '</div><div class="option-more option-btn">+</div></div></div>';
        }
    }

    if (params.clearBtn != undefined || params.applyBtn != undefined) {
        dropdown += '<div class="dropdown-confirm dropdown-option">';

        if (params.clearBtn != undefined) {
            if (params.clearBtn)
                dropdown += '<div class="dropdown-clear hidden">Очистить</div>';
        }

        if (params.applyBtn != undefined) {
            if (params.applyBtn)
                dropdown += '<div class="dropdown-apply">Применить</div>';
        }

        dropdown += '</div>';
    }

    dropdown += '</div></div>';

    this.$dropdown = $(dropdown);

    this.$container.append(this.$dropdown);

    this.addListeners();
}

DropdownView.prototype.addListeners = function() {
    var _this = this;

    document.addEventListener("click", function(e) {
        var dropdowns = $(".dropdown");
        for (var i = 0; i < dropdowns.length; i++) {
            if ($(dropdowns[i]).find(e.target).length == 0) {
                _this.onClosingAndOpening.manage();
            }
        }
    })

    this.$dropdown.children().eq(0).click(function() {
        _this.onClosingAndOpening.manage();
    });
    
    this.$dropdown.children().eq(1).click(function(e) {
        if (_this.$dropdown.find(".dropdown-apply")[0] == e.target) {
            _this.onClosingAndOpening.manage();
            return;
        } else if (_this.$dropdown.find(".dropdown-clear")[0] == e.target) {
            _this.onClearing.manage();
            return;
        } else if ($(e.target).hasClass("disabled")) {
            return;
        }
        var less = _this.$dropdown.find(".option-less");
        var more = _this.$dropdown.find(".option-more");
        for (var i = 0; i < less.length; i++) {
            if (e.target == less[i]) {
                _this.onReducing.manage(e.target);
            } else if (e.target == more[i]) {
                _this.onIncreasing.manage(e.target);
            }
        }
    });

    
}

DropdownView.prototype.setPlaceholder = function(value) {
    this.$dropdown.find(".dropdown-input").val(value);
}



function DropdownModel(params) {
    this.params = params;

    this.valuePattern = params.valuePattern ? params.valuePattern : "T";
    this.specClass = params.specClass ? params.specClass : "";
    this.placeholder = params.placeholder ? params.placeholder : "Parameters";
    this.placeholderSpelling = params.placeholderSpelling ? params.placeholderSpelling : function() {};
    this.dataSize = params.dataSize ? params.dataSize : "short";
    this.options = params.options ? params.options : [];
    this.clearBtn = params.clearBtn != undefined ? params.clearBtn : false;
    this.applyBtn = params.applyBtn != undefined ? params.applyBtn : false;
    
    this.minAmount = 0;

    for (var i = 0; i < this.options.length; i++) {
        if (this.options[i].value != undefined) {
            this.minAmount += this.options[i].value;
        } else {
            this.options[i].value = 0;
        }
        if (this.options[i].min == undefined) {
            this.options[i].min = 0;
        }
        if (this.options[i].max == undefined) {
            this.options[i].max = -1;
        }
    }

    this.amount = this.minAmount;
}

DropdownModel.prototype.getParamData = function() {
    return this.params;
}

DropdownModel.prototype.updatePlaceholder = function() {
    if (this.amount == 0) {
        return this.placeholder;
    } else {
        if (this.valuePattern == "T") {
            return this.amount + " " + this.placeholderSpelling(this.amount);
        } else if (this.valuePattern == "S") {
            var value = "";
            for (var i = 0; i < this.options.length; i++) {
                value += this.options[i].value + " " + this.placeholderSpelling(i, this.options[i].value)
                if (i+1 < this.options.length)
                    value += ", ";
            }
            return value;
        }
    }
}