var Table = require('easy-table')  // модуль для вывода таблицы
var clc = require('cli-color');    // вывод на терминал цветной текс
var fs = require("fs");            // модуль чтения фаила
var error = clc.red.bold;
var warn = clc.yellow;
var notice = clc.green;

// записи
var candidates;

// считавание candidates.json и сохраниение в массив
fs.readFile('./candidates.json', function (err, data) {
	candidates = JSON.parse(data);
});
// отчистка терминала
var clear = function(clear){
  if(clear !== false){process.stdout.write('\033[2J');}
  process.stdout.write('\033[0f');
};
// модуль для опросника
// проверка введеных полей
var questions = function(){
var obj = {};
obj.askMany = function(questions, callback){
var response = {};
var pool = function(){
	for(i in questions){
		obj.askOne(questions[i], function(data){
			response[i] = data;
			if(response.name && !response.name.match(/^[a-zA-Zа-яА-Я'][a-zA-Zа-яА-Я-' ]+[a-zA-Zа-яА-Я']?$/)){console.log(error("Ошибка ввода! Поле должно состоять из букв!"));pool();}
			else if(response.name && response.name.length > 20){console.log(error("Ошибка ввода: недопустимое количество символов"));pool();}
			else if(response.middle && !response.middle.match(/^[a-zA-Zа-яА-Я'][a-zA-Zа-яА-Я-' ]+[a-zA-Zа-яА-Я']?$/)){console.log(error("Ошибка ввода! Поле должно состоять из букв!"));pool();}
			else if(response.middle && response.middle.length > 20){console.log(error("Ошибка ввода: недопустимое количество символов"));pool();}
			else if(response.surname && !response.surname.match(/^[a-zA-Zа-яА-Я'][a-zA-Zа-яА-Я-' ]+[a-zA-Zа-яА-Я']?$/)){console.log(error("Ошибка ввода! Поле должно состоять из букв!"));pool();}
			else if(response.surname && response.surname.length > 20){console.log(error("Ошибка ввода: недопустимое количество символов"));pool();}
			else if(response.sex && !response.sex.match(/(м|ж)/)){console.log(error("Ошибка ввода! Пол должно состоять из букв 'м' или 'ж'"));pool();}
			else if(response.income && !response.income.match(/^[\d\s]+$/)){console.log(error("Ошибка ввода! Поле должно состоять из чисел!"));pool();}
			else if(response.age && !response.age.match(/^[\d\s]+$/)){console.log(error("Ошибка ввода! Поле должно состоять из чисел!"));pool();}
			else if(response.age && response.age.length > 2){console.log(error("Ошибка ввода: недопустимое количество символов"));pool();}
			else{delete questions[i];pool();}
		});
		return;
	}
	callback(response);
}
pool();
}
// функция задачи вопроса
obj.askOne = function(question, callback){
	var stdin = process.stdin, stdout = process.stdout;
	stdin.resume();
	// stdout.write((question.required == false ? '(Optional) ': '') + question.info + ": ");
	stdout.write(question.info + " ");
	stdin.once('data', function(data){
		var result = data.toString().trim(); // преобразует в строку
		if(question.required != false && result == ''){
			console.log(error("Ошибка ввода: пустая строка"));
			obj.askOne(question, callback);
		}
		else {
			stdin.pause();
			callback(result);
		}
	});
}
return obj;
}();

// вывод таблицы
var listRecord = function(){
  if(candidates.length){
  	var table = new Table();
  	clear();
  	printMenu();
  	candidates.forEach(function(item, i) {
  		table.cell(clc.blue("№"), clc.white(i))
  	  table.cell(clc.blue("имя"), clc.white(item.name))
  	 	table.cell(clc.blue("фамилия"), clc.white(item.middle))
  	  table.cell(clc.blue("отчество"), clc.white(item.surname))
  	 	table.cell(clc.blue("доход в месяц ₽"), clc.white(item.income))
  	  table.cell(clc.blue("пол(м/ж)"), clc.white(item.sex))
  	  table.cell(clc.blue("возраст"), clc.white(item.age))
  	  table.newRow()
  	});
  	console.log(table.toString());
  	what();
  }else{
  	clear();
  	printMenu();
  	console.log(error("Нет записей! Мне нечего смотреть!"));
  	what();
  }
};

// создание candidates.json и сохраниение записей в фаил
var saveArray = function(){
	fs.writeFile('./candidates.json', JSON.stringify(candidates), function(err, data){
		if (err) throw err;
	});
};
function compareObjects(a, b){
  if (a.name > b.name) return 1;
  if (a.name < b.name) return -1;
  return 0;
};
var sortRecord = function(){
	if(candidates.length){
		clear();
		printMenu();
		var list = [];
		candidates.forEach(function(item,i){
			list.push(candidates[i].name);
		});
		candidates.sort(compareObjects);
		saveArray();
		console.log(notice("Отсортировал"));
		what();
	}
	else{
  	clear();
  	printMenu();
  	console.log(error("Нет записей! Нечего сортировать!"));
  	what();
  }
};
// опросник
var addRecord = function(){
	clear();
	printMenu();
	questions.askMany({
		name:      {info:'Имя:'},
		middle:    {info:'Фамилия:'},
		surname:   {info:'Отчество:'},
		income:    {info:'Доход в месяц ₽:'},
		sex:       {info:'Пол(м/ж):'},
		age:       {info:'Возраст:'},
	},function(result){
		candidates.push(result);
		clear();
		printMenu();
		console.log(notice("Успешно! Добавленна новая запись!"));
		saveArray();
		what();
	});
};
var editRecord = function(){
	clear();
	printMenu();
	if(candidates.length){
		questions.askOne({info:'номер элемента:'}, function(result){
			if(result < candidates.length && result >= 0){
				// console.log(Table.print(candidates[result]));
				var arr = [
					clc.green("Имя         "),
					clc.green("Фамилия     "),
					clc.green("Отчество    "),
					clc.green("Доход       "),
					clc.green("Пол(м/ж)    "),
					clc.green("Возраст     ")
				];
				var i = 0;
				console.log(" ");
				for(item in candidates[result]){
					console.log(arr[i++],candidates[result][item]);
				}
				console.log(" ");
				questions.askMany({
					name:      {info:'Имя:'},
					middle:    {info:'Фамилия:'},
					surname:   {info:'Отчество:'},
					income:    {info:'Доход в месяц ₽:'},
					sex:       {info:'Пол(м/ж):'},
					age:       {info:'Возраст:'},
				},function(ob){
					candidates[result] = ob;
					clear();
					printMenu();
					saveArray();
					console.log(notice("Успешно изменено!"));
					what();
				});
			}
			else{
				console.log(error("Не найдено!"));
				what();
			}
		});
	}
	else{
		console.log(error("Нет записей! Что я изменять буду?"));
		what();
	}
}
var delRecord = function(){
	clear();
	printMenu();
	if(candidates.length){
		questions.askOne({info:'номер элемента:'}, function(result){
			if(result < candidates.length && result >= 0){
				candidates.splice(result,1);
				saveArray();
				console.log(notice("Успешно удаленно!"));
				what();
			}
			else{
				console.log(error("Не найдено!"));
				what();
			}
		});
	}
	else{
		console.log(error("Нет записей! Что я удалять буду?"));
		what();
	}
};
// меню
var printMenu = function(){
	var menu = [];

	menu[0] = clc.cyanBright("[1] Посмотреть    ")+"┊";
	menu[1] = clc.cyanBright("[2] Сортировать   ")+"┊";
	menu[2] = clc.cyanBright("[3] Добавить      ")+"┊";
	menu[3] = clc.cyanBright("[4] Изменить      ")+"┊";
	menu[4] = clc.cyanBright("[5] Удалить       ")+"┊";
	menu[5] = clc.white("------------------┊"); 	
	menu[6] = clc.yellowBright("[0] Выход         ")+"┊";
	console.log(clc.white("------------------┐"));
	menu.forEach(function(item){
		console.log(item);
	});
	console.log(clc.white("------------------┘"));
}; 
// вопрос пункта меню
var what = function(){
	questions.askOne({info:'>>' }, function(result){
		if(result == 1){listRecord();}
		else if(result == 2){sortRecord();}
		else if(result == 3){addRecord();}
		else if(result == 4){editRecord();}
		else if(result == 5){delRecord();}
		else if(result == 0){clear();}
		else{
			clear();
			printMenu();
			console.log(error("Ошибка ввода! Нет такого поля!"));
			what();
		}
	});
};

clear();        // отчистка
printMenu();    // напечать меню
what();         // вопрос для выбоа пункта меню